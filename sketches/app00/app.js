
require('../../vendors/TrackballControls');
require('./utils/ShaderExtras');

var customRayCaster = require('./custom-raycaster/custom-raycaster');
var keydown = require('keydown');

var TVMenuScene      = require('./tv-menu-scene');
var TVMainScene      = require('./tv-main-scene');
var TVIndicatorScene = require('./tv-indicator-scene')
var TVContactScene   = require('./tv-contact-scene');

var CustomLoader     = require('./loader/loader');

var raf = require('raf');
var scene = new THREE.Scene();
var glowscene = new THREE.Scene();
var controls, renderer;
var camera;

var tvMenuScene, tvMainScene, tvContactScene, tvIndicatorScene;
var clock;
var renderTargetGlow, renderTarget;

window.app = {
    assets : {
        model   : {},
        texture : {},
        json    : {}
    }
};

var hblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
var vblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
var bluriness = 3;
var mouse = new THREE.Vector2( 1000, 1000 );
var intersected;

hblur.uniforms[ 'h' ].value = bluriness / window.innerWidth;
vblur.uniforms[ 'v' ].value = bluriness / window.innerHeight;

var effectFXAA = new THREE.ShaderPass( THREE.ShaderExtras[ "fxaa" ] );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
var stats;
var finalcomposer;
var noiseTexture;
var customLoader;
var renderModelGlow;
var glowcomposer;

var customLoader = new CustomLoader();
customLoader.addEventListener(customLoader.ASSETS_LOADED, onAssetsLoaded);
customLoader.start();

function onAssetsLoaded(){
    //console.log('onAssetsLoaded');
    init();
};

function init() {
    var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
    renderTargetGlow = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
    renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

    tvMenuScene = new TVMenuScene();
    scene.add(tvMenuScene);

    tvMainScene = new TVMainScene();
    scene.add(tvMainScene);

    tvContactScene = new TVContactScene();
    scene.add(tvContactScene);

    //tvIndicatorScene = new TVIndicatorScene();
    //scene.add(tvIndicatorScene);

    var directionalLight = new THREE.DirectionalLight(0xffffff, .15);
    directionalLight.position.set( 0, 100, 120);
    scene.add(directionalLight);
    window.app.scene = scene;

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set( 15, 30, 770);
    camera.lookAt(new THREE.Vector3(50, 0, 0));
    customRayCaster.setCamera(camera);
    window.app.camera = camera;

    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(renderer.domElement);


    glowscene.add( new THREE.AmbientLight( 0xffffff ) );

    var renderModelGlow = new THREE.RenderPass( glowscene, camera );

    glowcomposer = new THREE.EffectComposer( renderer, renderTargetGlow );

    glowcomposer.addPass( renderModelGlow );
    glowcomposer.addPass( hblur );
    glowcomposer.addPass( vblur );
    glowcomposer.addPass( hblur );
    glowcomposer.addPass( vblur );

    var finalshader = {
        uniforms: {
            tDiffuse: { type: "t", value: 0, texture: null },
            tGlow: { type: "t", value: 1, texture: null }
        },

        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

            "vUv = vec2( uv.x,  uv.y );",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join("\n"),

        fragmentShader: [
            "uniform sampler2D tDiffuse;",
            "uniform sampler2D tGlow;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 texel = texture2D( tDiffuse, vUv );",
            "vec4 glow = texture2D( tGlow, vUv );",
            "gl_FragColor = texel + vec4(0.5, 0.75, 1.0, 1.0) * glow * 2.0;",

            "}"
        ].join("\n")
    };

    finalshader.uniforms[ 'tGlow' ].value = renderTargetGlow; // glowcomposer.renderTarget2;

    var renderModel = new THREE.RenderPass( scene, camera );
    var finalPass = new THREE.ShaderPass( finalshader );
    finalPass.needsSwap = true;
    finalPass.renderToScreen = true;

    renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

    finalcomposer = new THREE.EffectComposer( renderer);
    finalcomposer .setSize(window.innerWidth , window.innerHeight);

    finalcomposer.addPass( renderModel );
    finalcomposer.addPass( effectFXAA );
    finalcomposer.addPass( finalPass );


    //renderModelGlow = new THREE.RenderPass( glowscene, glowcamera );

    //controls = new THREE.TrackballControls(camera, renderer.domElement);

    stats = new Stats();
    stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

    // align top-left
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom  = '30px';
    stats.domElement.style.left = '30px';
    stats.domElement.style.zIndex= 9999;

    document.body.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    clock = new THREE.Clock();

    raf(loop);
}


function loop() {
    stats.begin();


    //console.log(mouse);
    /*
    raycaster.setFromCamera( mouse, camera );
    //console.log(tvMainScene.rayCaster);
    var intersects = raycaster.intersectObjects(raycasterObjects);
    if(intersects.length > 0){
        if(intersects[ 0 ].object){
            if(intersected != intersects[ 0 ].object){
                if(intersected) intersected.material.opacity = 0.01;
                intersected = intersects[ 0 ].object
                intersected.material.opacity = 1;
            }
        }
    }else{
        if(intersected){
            intersected.material.opacity = 0.01;
            intersected = null
        }

    } */
    customRayCaster.update(mouse);

    var dt = clock.getDelta();

    //controls.update();

    tvMenuScene.update(dt);
    tvMainScene.update(dt);
    tvContactScene.update(dt);
    //tvIndicatorScene.update(dt);
    renderer.render(scene, camera);
    //glowcomposer.render();
    //finalcomposer.render();

    stats.end();

    id = raf(loop);
}

function onDocumentMouseMove(event){
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

var kd = keydown(['<escape>']);

kd.on('pressed', function() {
    // control + a are both pressed right now
    //console.log(clock);
    if(clock.running){
        raf.cancel(id);
        clock.stop();
    }else{
        clock.start();
        raf(loop);
    }

});



