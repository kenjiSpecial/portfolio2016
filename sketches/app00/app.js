
require('../../vendors/TrackballControls');
require('./utils/ShaderExtras');

var customRayCaster = require('./custom-raycaster/custom-raycaster');
var keydown = require('keydown');

var TVMenuScene      = require('./tv-menu-scene');
var TVMainScene      = require('./tv-main-scene');
var TVIndicatorScene = require('./tv-indicator-scene')
var TVContactScene   = require('./tv-contact-scene');
var LoaderScene      = require('./loader-scene');

var loaderScene;

var CustomLoader     = require('./loader/loader');

var raf = require('raf');
var scene = new THREE.Scene();
var glowscene = new THREE.Scene();
var controls, renderer;
var camera, camOriginalPosition, camLookAtOriginalPosition;

var audioController = require('./audio/audio-controller');

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
var initId;

function loadStart(){
    var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
    renderTargetGlow = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );
    renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

    var directionalLight = new THREE.DirectionalLight(0xffffff, .15);
    directionalLight.position.set( 0, 100, 120);
    scene.add(directionalLight);
    window.app.scene = scene;

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    //camera.position.set( 15, 30, 770);
    //camera.lookAt(new THREE.Vector3(50, 0, 0));
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

    loaderScene = new LoaderScene(renderer);
    loaderScene.start();

    customLoader = new CustomLoader();
    //customLoader.addEventListener(customLoader.ASSETS_LOADED, onAssetsLoaded);
    loaderScene.addEventListener('loaded', onAssetsLoaded);

    setTimeout(function(){
        customLoader.start()
    }, 300);



    clock = new THREE.Clock();
    raf(initLoop);
}

function onAssetsLoaded(){
    raf.cancel(initId);

    tvMenuScene = new TVMenuScene();
    scene.add(tvMenuScene);

    tvContactScene = new TVContactScene();
    scene.add(tvContactScene);

    tvMainScene = new TVMainScene();
    scene.add(tvMainScene);


    renderer.render(scene, camera);
    tvContactScene.invisible();
    tvMenuScene.invisible()


    setTimeout(initMain, 300);
    setTimeout(init, 1900);


    id = raf(loop);
};

function initMain(){

    tvMainScene.start();
    //camera.rotation
    //camera.rotateOnAxis ( new THREE.Vector3(0, 1, 0), Math.PI/3 );
    //tvMainScene.position

    var transY = 75/2;
    var ddX = 600 * Math.cos(Math.PI*1/6);
    var ddY = 600 * Math.sin(Math.PI*1/6);
    camera.position.set(tvMainScene.position.x + ddX, tvMainScene.position.y , tvMainScene.position.z  + ddY)
    camLookAtOriginalPosition = tvMainScene.position.clone()
    camLookAtOriginalPosition.y += transY;
    camera.lookAt(camLookAtOriginalPosition);

    setTimeout(animationCamera, 1600);
}


function animationCamera(){
    camera.animationRate   = 0;
    camera.animationRate1  = 0;
    camOriginalPosition = new THREE.Vector3();
    camOriginalPosition.set(camera.position.x, camera.position.y, camera.position.z);

    TweenMax.to(camera, 1.5, {animationRate: 1, onUpdate: onAnimationUpdate, ease: Elastic.easeOut.config(1,1) });
    TweenMax.to(camera, 2.2, {animationRate1: 1, onUpdate: onLookAtUpdate, ease: Elastic.easeOut.config(1, 1) });
}

function onAnimationUpdate() {
    var curPosition = new THREE.Vector3();
    var xx = 15 * (camera.animationRate) + camOriginalPosition.x * (1 - camera.animationRate);
    var yy = 30 * (camera.animationRate) + camOriginalPosition.y * (1 - camera.animationRate);
    var zz = 770 * (camera.animationRate) + camOriginalPosition.z * (1 - camera.animationRate);

    camera.position.set(xx, yy, zz);
    onLookAtUpdate();
}

function onLookAtUpdate(){
    var lookxx = 50 * (camera.animationRate1) + camLookAtOriginalPosition.x * (1-camera.animationRate1);;
    var lookyy = 37.5 * (camera.animationRate1) + camLookAtOriginalPosition.y * (1-camera.animationRate1);
    var lookzz = camLookAtOriginalPosition.z * (1-camera.animationRate1);

    camera.lookAt(new THREE.Vector3(lookxx, lookyy, lookzz));
}

function init() {
    tvMenuScene.start();
    tvContactScene.start();
    //raf(loop);
}

function initLoop(){
    stats.begin();

    var dt = clock.getDelta();
    loaderScene.update( dt, renderer, customLoader );
    stats.end();

    initId = raf(initLoop);

}


function loop() {
    stats.begin();

    var dt = clock.getDelta();
    customRayCaster.update(mouse);

    if(tvContactScene) tvMenuScene.update(dt);
    if(tvMainScene)    tvMainScene.update(dt);
    if(tvContactScene) tvContactScene.update(dt);
    renderer.render(scene, camera);

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

function resize(){
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};


loadStart();
window.addEventListener('resize', resize);
