
//require('../../vendors/TrackballControls');
//require('./utils/ShaderExtras');

var customRayCaster = require('./custom-raycaster/custom-raycaster');
var keydown = require('keydown');

var TVMenuScene      = require('./tv-menu-scene');
var TVMainScene      = require('./tv-main-scene');
var TVIndicatorScene = require('./tv-indicator-scene')
var TVContactScene   = require('./tv-contact-scene');
var LoaderScene      = require('./loader-scene');

var appStore =require('./stores/app-store');

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
var curLookAtPos       = new THREE.Vector3();
var curLookAtOriginPos = new THREE.Vector3();
var tl1, tl2;

window.app = {
    assets : {
        model   : {},
        texture : {},
        json    : {}
    },
    renderer : null
};

var mouse = new THREE.Vector2( 1000, 1000 );

var stats;
var finalcomposer;
var noiseTexture;
var customLoader;
var renderModelGlow;
var glowcomposer;
var initId, specialId;

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
    window.app.renderer = renderer;

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

    //document.body.appendChild( stats.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    loaderScene = new LoaderScene(renderer);
    loaderScene.start();

    customLoader = new CustomLoader();
    //customLoader.addEventListener(customLoader.ASSETS_LOADED, onAssetsLoaded);
    loaderScene.addEventListener('loaded', onAssetsLoaded);

    setTimeout(function(){
        customLoader.start()
    }, 300);

    appStore.addEventListener(appStore.CHANGE_DIRECTORY, onChangeDirectory);


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
    camera.position.set(tvMainScene.position.x + ddX, tvMainScene.position.y + transY, tvMainScene.position.z  + ddY)
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

    tl1 = TweenMax.to(camera, 1.5, {animationRate: 1, onUpdate: onAnimationUpdate, ease: Elastic.easeOut.config(1,1) });
    tl2 = TweenMax.to(camera, 2.2, {animationRate1: 1, onUpdate: onLookAtUpdate, ease: Elastic.easeOut.config(1, 1) });
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

    curLookAtPos.set(lookxx, lookyy, lookzz);

    camera.lookAt(new THREE.Vector3(lookxx, lookyy, lookzz));
}

function init() {
    tvMenuScene.start();
    tvContactScene.start();
    //raf(loop);
}

function changeToSpecial(){
    raf.cancel(id);
    tvMainScene.updateSpecial();

    raf(specialLoop);
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

function specialLoop(){
    var dt = clock.getDelta();
    if(tvMainScene)    tvMainScene.update(dt);
    customRayCaster.update(mouse);
    renderer.render(scene, camera);

    id = raf(specialLoop);
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

function onChangeDirectory() {
    if(appStore.curDirectory == 'special'){
        onChangeTVPosition();
        return;
    }

    if(appStore.prevDirectory == 'special'){
        setTimeout(onChangeTVBasicPosition, 0)
        return;
    }

}

function onChangeTVBasicPosition(){
    tl1 = TweenMax.to(camera, 0.6, {animationRate: 0, onUpdate: onAnimationUpdate1, delay: 0.2 });
    tl2 = TweenMax.to(camera, 1.5, {animationRate1: 0, onUpdate: onLookAtUpdate1, ease: Elastic.easeOut.config(1, 0.7), delay: 0.2 });

    raf.cancel(id);
    id = raf(loop);
}

function onChangeTVPosition(){
    if(tl1) tl1.pause();
    if(tl2) tl2.pause();

    var transY = 75/2 + 5;
    var ddX = 98 * Math.cos(Math.PI*1/6);
    var ddY = 98 * Math.sin(Math.PI*1/6);
    /**
    camera.position.set(tvMainScene.position.x + ddX, tvMainScene.position.y + transY, tvMainScene.position.z  + ddY)
    camLookAtOriginalPosition = tvMainScene.position.clone()
    camLookAtOriginalPosition.y += transY;
    camera.lookAt(camLookAtOriginalPosition); */

    camera.animationRate   = 0;
    camera.animationRate1  = 0;
    camOriginalPosition = new THREE.Vector3();
    camOriginalPosition.set(camera.position.x, camera.position.y, camera.position.z);

    camera.targetPosition = new THREE.Vector3(tvMainScene.position.x + ddX, tvMainScene.position.y + transY, tvMainScene.position.z  + ddY)
    camera.targetLooAtPostion = tvMainScene.position.clone(); //camLookAtOriginalPosition.clone();
    camera.targetLooAtPostion.y += transY; // = camLookAtOriginalPosition.clone();
    curLookAtOriginPos = new THREE.Vector3(curLookAtPos.x, curLookAtPos.y, curLookAtPos.z);

    tl1 = TweenMax.to(camera, 0.6, {animationRate: 1, onUpdate: onAnimationUpdate1, delay: 0.2 });
    tl2 = TweenMax.to(camera, 1.5, {animationRate1: 1, onUpdate: onLookAtUpdate1, ease: Elastic.easeOut.config(1, 0.7), delay: 0.2, onComplete: changeToSpecial });
}

function onAnimationUpdate1(){
    var curPosition = new THREE.Vector3();
    var xx = camera.targetPosition.x * (camera.animationRate) + camOriginalPosition.x * (1 - camera.animationRate);
    var yy = camera.targetPosition.y * (camera.animationRate) + camOriginalPosition.y * (1 - camera.animationRate);
    var zz = camera.targetPosition.z * (camera.animationRate) + camOriginalPosition.z * (1 - camera.animationRate);

    camera.position.set(xx, yy, zz);
    onLookAtUpdate1();
}

function onLookAtUpdate1(){
    var lookxx = camera.targetLooAtPostion.x * (camera.animationRate1) + curLookAtOriginPos.x * (1-camera.animationRate1);;
    var lookyy = camera.targetLooAtPostion.y * (camera.animationRate1) + curLookAtOriginPos.y * (1-camera.animationRate1);
    var lookzz = camera.targetLooAtPostion.z * (camera.animationRate1) + curLookAtOriginPos.z * (1-camera.animationRate1);

    curLookAtPos.set(lookxx, lookyy, lookzz);

    camera.lookAt(new THREE.Vector3(lookxx, lookyy, lookzz));
}

loadStart();
window.addEventListener('resize', resize);
