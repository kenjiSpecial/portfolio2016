var TVScreen = require('./tv-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var constants = require('../utils/constants');
var _ = require('underscore');

var TVObject = function( opts, glowObject){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onTransitionStart')
    THREE.Object3D.call( this );
    this.type = 'tvContact';

    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone()
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    this.tvControllerMesh.position.set( 23.5, -28, 37 );
    this.add(this.tvControllerMesh);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.position.set( -23 , -28, 39 );
    this.add(lightMesh)

    this.tvScreen = new TVScreen();
    this.add(this.tvScreen);


    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    var cubeMat = new THREE.MeshBasicMaterial({color:0x1111cc, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster);

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );
    appStore.addEventListener( appStore.TRANSITION_START, this.onTransitionStart  );

    setTimeout(this.turnOn.bind(this), 840);
};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.update = function(dt){
    this.tvScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    this.glowMat.color = new THREE.Color(0x1111cc);
    setTimeout(function(){
        //this.glowMat.color = new THREE.Color(0x9999dd);
    }.bind(this), 1000);
    this.tvScreen.turnOn();
}


TVObject.prototype.onMainMouseOverObjectUpdated = function(){
    if(appStore.mainMouseOverObject == this){
        this.isMouseOver = true;
        this.onMouseOver();
    }else if(this.isMouseOver && appStore.mainMouseOverObject != this){
        this.isMouseOver = false;
        this.onMouseOut();
    }
}

TVObject.prototype.onMouseOver = function(){
    this.tvScreen.onMouseOver();
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.3, ease: Quint.easeOut});

    if(appStore.curDirectory == 'about'){
        appAction.onMouseOverAboutType();
    }
};

TVObject.prototype.onMouseOut = function(){
    this.tvScreen.onMouseOut();
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});

    if(appStore.curDirectory == 'about'){
        appAction.onMouseOutAboutType();
    }
}

TVObject.prototype.onTransitionStart = function(){
    this.tvScreen.onTransitionStart();

    this.turnOnColor = constants[appStore.curDirectory].lightColor;
    setTimeout(function(){
        this.glowMat.color = this.turnOnColor;
    }.bind(this), 1000);


    this.rayCaster.material.color = appStore.selectedObject.rayCaster.material.color;
    this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.3, ease: Quint.easeInOut, delay: 0.6});
    this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.01, ease: Quint.easeInOut, delay: 0.6 + 1.6});
}


module.exports = TVObject;