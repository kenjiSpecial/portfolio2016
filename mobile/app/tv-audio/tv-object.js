var TVScreen = require('./tv-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var constants = require('../utils/constants');
var _ = require('underscore');

var TVObject = function( opts, glowObject){
    _.bindAll(this, 'onMainMouseOverObjectUpdated','onMouseEnable', 'onClickHandler' )
    THREE.Object3D.call( this );
    this.type = 'tvContact';
    this.tag = 'contact';

    var translateY = 75/2;

    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone()
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.tvControllerMesh.position.set( 23.5, -28, 37 );
    this.add(this.tvControllerMesh);

    this.contactColor = new THREE.Color(0x1111cc);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.position.set( -23 , -28, 39 );
    lightMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(lightMesh)

    this.tvScreen = new TVScreen();
    this.tvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.tvScreen.addEventListener('mouseEnable', this.onMouseEnable);
    this.add(this.tvScreen);


    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    cubeGeo.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    var cubeMat = new THREE.MeshBasicMaterial({color:this.contactColor, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster);

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );

    this.curModel = {
        'clickable' : true
    };

    this.scale.y = 0.000001;

    //setTimeout(this.turnOn.bind(this), 900);
};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.update = function(dt){
    this.tvScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    this.glowMat.color = new THREE.Color(this.contactColor);
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

        if(this.isClick){
            this.isClick = false;
            return;
        }

        this.onMouseOut();
    }
}

TVObject.prototype.onMouseOver = function(){
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.3, ease: Quint.easeOut});
    this.tvScreen.onMouseOver();

    window.addEventListener('click', this.onClickHandler);
};

TVObject.prototype.onMouseOut = function(){
    this.tvScreen.onMouseOut();
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});

    window.removeEventListener('click', this.onClickHandler);
}

TVObject.prototype.onClickHandler = function(){
    this.tvScreen.onClick(appStore.isAudio);


    this.onMouseDisable();

    window.removeEventListener('click', this.onClickHandler);
};


TVObject.prototype.onMouseEnable = function(){
    this.rayCaster.mouseEnable = true;
};

TVObject.prototype.onMouseDisable = function(){
    this.rayCaster.mouseEnable = false;
}

TVObject.prototype.start = function(){
    var delay = 600; //this.col * 100 + (2 - this.row) * 200;
    setTimeout(function(){
        this.visible = true;
        TweenLite.to(this.scale,    0.6, {y: 1/3, ease: Elastic.easeOut.config(1, 0.8) });
        setTimeout(this.turnOn.bind(this), 200);
    }.bind(this), delay);
}

module.exports = TVObject;