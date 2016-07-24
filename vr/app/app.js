
//require('../../vendors/TrackballControls');
//require('./utils/ShaderExtras');

var customRayCaster = require('./custom-raycaster/custom-raycaster');
var keydown = require('keydown');
const glslify = require('glslify');

var TVMenuScene      = require('./tv-menu-scene');
var TVMainScene      = require('./tv-main-scene');
var TVIndicatorScene = require('./tv-indicator-scene')
var TVContactScene   = require('./tv-contact-scene');
var LoaderScene      = require('./loader-scene');

var appStore =require('./stores/app-store');

var loaderScene;

var CustomLoader     = require('./loader/loader');

var raf = require('raf');

const WEBVR = require('../vendors/webvr/WebVR');

var appAction = require('./actions/app-action');

var appStore =require('./stores/app-store');
var scene = new THREE.Scene();
var glowscene = new THREE.Scene();
var controls, renderer, effect;
var camera, camOriginalPosition, camLookAtOriginalPosition;

// var audioController = require('./audio/audio-controller');

var tvMenuScene, tvMainScene, tvContactScene, tvIndicatorScene;
var clock;
var renderTargetGlow, renderTarget;
var curLookAtPos       = new THREE.Vector3();
var curLookAtOriginPos = new THREE.Vector3();
var tl1, tl2;
var id;

var ViveController = require('../vendors/webvr/custom-three-vive-controller/index')(THREE, './');

var worldScaled = 1/100;

var lineGeo = new THREE.Geometry();
lineGeo.vertices.push(new THREE.Vector3(0, 0, 0));
lineGeo.vertices.push(new THREE.Vector3(0, 0.00, -5 * worldScaled));
var controlLine = new THREE.Line(lineGeo, new THREE.MeshBasicMaterial({color: 0xaaaaaa, side : THREE.DoubleSide}));


var clock = new THREE.Clock();
var scene, camera, room, controls, container, renderer, controller1, controller2, effect;
var scaled = 1/100;
var selectionPlane = new THREE.PlaneBufferGeometry(8 * worldScaled, 8 * worldScaled);
var selectionMat = new THREE.ShaderMaterial({
    vertexShader: glslify('./circle/shader.vert'),
    fragmentShader: glslify('./circle/shader.frag'),
    side: THREE.DoubleSide,
    transparent: true,
    blending : THREE.AdditiveBlending
})
var mat = new THREE.MeshBasicMaterial({
    color : 0x0000ff,
    side : THREE.DoubleSide
})

var selectionMesh = new THREE.Mesh(selectionPlane, selectionMat);

var customLoader;
var initId;
var cameraParentObject;

var LoaderScene      = require('./loader-scene');


window.app = {
    assets : {
        model   : {},
        texture : {},
        json    : {}
    },
    special : {
        texture : {}
    },
    scale : 1/300,
    renderer : null
};

require('domready')(function () {
    if (WEBVR.isAvailable() === true) {
        init();
    }else{

    }

    // loop();
});



function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10 );
    scene.add( camera );
    window.app.camera = camera;

    room = new THREE.Mesh(
        new THREE.BoxGeometry( 6, 6, 6, 8, 8, 8 ),
        new THREE.MeshBasicMaterial( {  color: 0x404040, wireframe: true, opacity : 0.4, transparent : true } )
    );


    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setClearColor( 0x000000 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.sortObjects = false;
    container.appendChild( renderer.domElement );

    controls = new THREE.VRControls( camera );
    controls.standing = true;

    controller1 = new ViveController(0, controls);
    scene.add(controller1);
    controller1.on(controller1.TriggerClicked, () => {
        appAction.onClick();
    })


    controller2 = new ViveController(1, controls);
    scene.add(controller2);
    effect = new THREE.VREffect(renderer);


    scene.add(controlLine)


    document.body.appendChild(WEBVR.getButton(effect));

    window.addEventListener('resize', onWindowResize, false);

    loadStart();
}

function loadStart() {
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set( 0, 100, 120);
    scene.add(directionalLight);
    window.app.scene = scene;

    loaderScene = new LoaderScene(renderer);
    loaderScene.start();

    customLoader = new CustomLoader();
    loaderScene.addEventListener('loaded', onAssetsLoaded);

    setTimeout(function(){
        customLoader.start()
    }, 300);

    appStore.addEventListener(appStore.CHANGE_DIRECTORY, onChangeDirectory);


    clock = new THREE.Clock();
    raf(initLoop);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
}

function loop() {
    id = raf(loop);

    var dt = clock.getDelta();

    controls.update();
    cameraParentObject.position.copy(camera.position)

    customRayCaster.update(controller1, controller2, controlLine, room, selectionMesh);

    controlLine.visible = controller1.visible;
    if(!controller1.visible) selectionMesh.visible = false;
    if(tvMainScene)    tvMainScene.update(dt);
    if(tvContactScene) tvContactScene.update(dt);
    if(tvMenuScene) tvMenuScene.update(dt);

    effect.render(scene, camera);
}

function initLoop(){
    var dt = clock.getDelta();
    controls.update();


    loaderScene.update( dt, effect , customLoader );

    initId = raf(initLoop);
}

function onAssetsLoaded(){
    raf.cancel(initId);

    cameraParentObject = new THREE.Object3D();


    tvMenuScene = new TVMenuScene();
    cameraParentObject.add(tvMenuScene);

    tvContactScene = new TVContactScene();
    cameraParentObject.add(tvContactScene);
    //
    tvMainScene = new TVMainScene();
    cameraParentObject.add(tvMainScene);

    // var geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // for(var ii = 0; ii < 80; ii++){
    //     var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
    //
    //     object.position.x = (Math.random() * 4 - 2)/3;
    //     object.position.y = (Math.random() * 4 - 2)/3;
    //     object.position.z = (Math.random() * 4 - 2)/3;
    //
    //     object.rotation.x = Math.random() * 2 * Math.PI;
    //     object.rotation.y = Math.random() * 2 * Math.PI;
    //     object.rotation.z = Math.random() * 2 * Math.PI;
    //
    //     // var randomScale = 1 + Math.random();
    //     // object.scale.set(randomScale, randomScale, randomScale);
    //
    //     cameraParentObject.add(object);
    //     // cubeArr.push(object);
    // }
    cameraParentObject.add(room);

    scene.add(cameraParentObject);

    cameraParentObject.position.copy(camera.position)

    scene.add(selectionMesh);

    setTimeout(initMain, 0);

    id = raf(loop)

};


function onChangeDirectory() {

}

function initMain(){

    //tvMainScene.start();
    tvMenuScene.start();
    tvContactScene.start();
    tvMainScene.start();

    // var transY = 75/2;
    // var ddX = 600 * Math.cos(Math.PI*1/6);
    // var ddY = 600 * Math.sin(Math.PI*1/6);
    // camera.position.set(tvMainScene.position.x + ddX, tvMainScene.position.y + transY, tvMainScene.position.z  + ddY)
    // camLookAtOriginalPosition = tvMainScene.position.clone()
    // camLookAtOriginalPosition.y += transY;
    // camera.lookAt(camLookAtOriginalPosition);
    //
    // setTimeout(animationCamera, 1600);
}

