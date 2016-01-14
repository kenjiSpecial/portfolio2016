
//require('../../vendors/TrackballControls');
//require('./utils/ShaderExtras');

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

var mouse = new THREE.Vector2( 1000, 1000 );

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

    document.addEventListener( 'touchmove',  onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchend',   onDocumentTouchEnd, false );

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


    //setTimeout(initMain, 300);
    setTimeout(init, 300);


    id = raf(loop);
};

function initMain(){



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
    camera.position.set(0, 0, 850);
    window.addEventListener('deviceorientation', onOrientationHandler, false);

    camera.lookAt(new THREE.Vector3(0, 0, 0));

    tvMainScene.start();
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

var touchStartTime;
function onDocumentTouchStart(event){
    touchStartTime = Date.now();
    mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

    event.preventDefault();
}

function onDocumentMouseMove(event){
    event.preventDefault();

    mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

}


function onDocumentTouchEnd(event){
    mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;

    var curTime = Date.now();

    if(curTime - touchStartTime < 300){
        //
    }


    event.preventDefault();
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

var cameraTheta1 = 0;
var cameraTheta2 = 0;

function onOrientationHandler(){
    var x, y;
    if(window.orientation % 180 == 0){
        x = event.gamma;  // In degree in the range [-180,180]
        y = event.beta - 45; // In degree in the range [-90,90]
    }else{
        x = event.beta;  // In degree in the range [-180,180]
        y = event.gamma - 45; // In degree in the range [-90,90]
    }

    cameraTheta1 += (x/ 300 - cameraTheta1) / 10;
    cameraTheta2 += (y/ 300 - cameraTheta2) / 10;

    var rad = 850;
    camera.position.z = 850 * Math.cos(cameraTheta1) * Math.cos(cameraTheta2);
    camera.position.x = 850 * Math.sin(cameraTheta1) * Math.cos(cameraTheta2);
    camera.position.y = 850 * Math.sin(cameraTheta2);

    camera.lookAt(scene.position);


    camera.updateMatrix();
    camera.updateMatrixWorld();
    scene.updateMatrixWorld();
}

loadStart();
window.addEventListener('resize', resize);
