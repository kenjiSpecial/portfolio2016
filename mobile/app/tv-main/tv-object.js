var TVScreen = require('./tv-screen');
var appStore = require('../stores/app-store');
var _ = require('underscore')

var TVObject = function( opts ){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onMouseEnable', 'onMouseDisable');
    THREE.Object3D.call( this );
    //console.log(noiseTexture);

    this.type = 'tvMain';

    var translateY = 75/2;

    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );
    this.tvMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone();
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    //this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.tvControllerMesh.position.set( 23.5, -28 + translateY, 37 );
    this.add(this.tvControllerMesh);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.position.set( -23 , -28, 39 );
    lightMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(lightMesh)

    this.tvScreen = new TVScreen();
    this.tvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(this.tvScreen)

    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    cubeGeo.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    var cubeMat = new THREE.MeshBasicMaterial({color:0x999999, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster);

    this.tvScreen.addEventListener('mouseEnable', this.onMouseEnable);
    this.tvScreen.addEventListener('mouseDisable', this.onMouseDisable);
    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );

    this.scale.y = 0.01;

};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.start = function(){
    //console.log('start?');
    this.scale.y = 0.01;
    setTimeout(function(){
        TweenLite.to(this.scale,    1., {y: 1, ease: Elastic.easeOut.config(1, 0.8) });
        setTimeout(this.turnOn.bind(this), 0);
    }.bind(this), 600);

}

TVObject.prototype.update = function(dt){
    this.tvScreen.update(dt);
};

TVObject.prototype.onMainMouseOverObjectUpdated = function(event){
    if(appStore.mainMouseOverObject == this){
        this.isMouseOver = true;
        this.onMouseOver();
    }else if(this.isMouseOver && appStore.mainMouseOverObject != this){
        this.isMouseOver = false;
        this.onMouseOut();
    }

};

TVObject.prototype.onMouseOver = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.2, ease: Quint.easeOut});
    this.tvScreen.onMouseOver();
};

TVObject.prototype.onMouseOut = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});
    this.tvScreen.onMouseOut();
}

TVObject.prototype.turnOn = function(){
    TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: Math.PI * 2/5});

    this.glowMat.color = new THREE.Color(0x1111cc);
    setTimeout(function(){
        this.glowMat.color = new THREE.Color(0x333333);
    }.bind(this), 1000);
    this.tvScreen.turnOn();
}

TVObject.prototype.onMouseEnable = function(){
    this.rayCaster.mouseEnable = true;
};

TVObject.prototype.onMouseDisable = function(){
    this.rayCaster.mouseEnable = false;
}

module.exports = TVObject;