var TVScreen = require('./tv-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var constants = require('../utils/constants');
var _ = require('underscore');

var customEvent = require('../utils/custom-event');

var TVObject = function( opts, glowObject){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onTransitionStart', 'onMouseEnable', 'onClickContact')
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
    this.tvControllerMesh.position.set( 23.5, -28+ translateY, 37 );
    this.add(this.tvControllerMesh);
    //this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.contactColor = new THREE.Color(0x1111cc);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    lightMesh.position.set( -23 , -28, 39 );
    this.lightMesh = lightMesh;
    this.add(lightMesh)

    this.tvScreen = new TVScreen();
    this.tvScreen.addEventListener('mouseEnable', this.onMouseEnable);
    this.tvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(this.tvScreen);


    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    cubeGeo.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    var cubeMat = new THREE.MeshBasicMaterial({color:this.contactColor, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster);

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );
    appStore.addEventListener( appStore.TRANSITION_START, this.onTransitionStart  );

    this.curModel = {
        'clickable' : true
    };
    this.scale.y = 0.0001;

    //setTimeout(this.turnOn.bind(this), 840);
};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.update = function(dt){
    this.tvScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    var angle = Math.PI * 2/5
    TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});

    this.glowMat.color = new THREE.Color(this.contactColor);
    setTimeout(function(){
        //this.glowMat.color = new THREE.Color(0x9999dd);
    }.bind(this), 1000);
    this.tvScreen.turnOn();
}


TVObject.prototype.onMainMouseOverObjectUpdated = function(){
    if(appStore.mainMouseOverObject == this){
        this.isMouseOver = true;
        //setTimeout(function(){//}.bind(this), 0);
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

    this.tvScreen.onMouseOver();
    if(this.tl) this.tl.pause();
    //this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.3, ease: Quint.easeOut});

    if(appStore.curDirectory == 'about' ){
        appAction.onMouseOverAboutType();
    }else if(appStore.curDirectory == 'works'){
        appAction.onMouseOverWorksType();
    }else if(appStore.curDirectory == 'home'){
        customEvent.addEventListener('click', this.onClickContact);
    }else if(appStore.curDirectory == 'contact'){
        appAction.onMouseOverContactType();
    }else if(appStore.curDirectory == "sketch"){
        appAction.onMouseOverSketchType();
    }
};

TVObject.prototype.onMouseOut = function(){
    this.tvScreen.onMouseOut();
    if(this.tl) this.tl.pause();
    //this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});

    if(appStore.curDirectory == 'about'){
        appAction.onMouseOutAboutType();
    }else if(appStore.curDirectory == 'works'){
        appAction.onMouseOutWorksType();
    }else if(appStore.curDirectory == 'home'){
        customEvent.removeEventListener('click', this.onClickContact );
    }else if(appStore.curDirectory == 'contact'){
        appAction.onMouseOutContactType();
    }else if(appStore.curDirectory == "sketch"){
        appAction.onMouseOutSketchType();
    }
}

TVObject.prototype.onTransitionStart = function(){
    this.onMouseDisable();


    if(this.tlAngle) this.tlAngle.pause();
    var angle = constants.controller[appStore.curDirectory];
    this.tlAngle = TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});

    if(appStore.prevDirectory == 'work'){
        this.tvScreen.backToWorks();
        this.turnOnColor = constants[appStore.curDirectory].lightColor;
        this.glowMat.color = this.turnOnColor;
        return;
    }

    if(appStore.curDirectory == 'home'){
        this.curModel.clickable = true;

        setTimeout(function(){
            this.rayCaster.material.color = this.contactColor;
            this.glowMat.color = this.contactColor;
        }.bind(this), 300);
        this.tvScreen.onTransitionHomeStart();
    }else if(appStore.curDirectory == 'works' || appStore.curDirectory == 'about' || appStore.curDirectory == 'sketch' || appStore.curDirectory == 'contact' ){
        this.curModel.clickable = false;
        this.tvScreen.onTransitionStart();

        this.turnOnColor = constants[appStore.curDirectory].lightColor;
        setTimeout(function(){
            this.glowMat.color = this.turnOnColor;
        }.bind(this), 500);


        this.rayCaster.material.color = constants[appStore.curDirectory].lightColor;
        //this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.3, ease: Quint.easeInOut, delay: 0.6});
        //this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.01, ease: Quint.easeInOut, delay: 0.6 });
    }else{
        this.turnOnColor = constants.turnOffColor;
        this.glowMat.color = constants.turnOffColor;

        this.tvScreen.shutDown();
    }

};

TVObject.prototype.onClickContact = function(){
    customEvent.dispatchEvent({type: 'mouseReset'});

    this.isClick = true;
    appAction.clickObject(this);

    customEvent.removeEventListener('click', this.onClickContact );
};

TVObject.prototype.onMouseEnable = function(){
    this.rayCaster.mouseEnable = true;
};

TVObject.prototype.onMouseDisable = function(){
    this.rayCaster.mouseEnable = false;
}

TVObject.prototype.start = function(){
    var delay = 400; //this.col * 100 + (2 - this.row) * 200;
    setTimeout(function(){
        this.visible = true;
        TweenLite.to(this.scale,    0.6, {y: 1, ease: Elastic.easeOut.config(1, 0.8) });
        setTimeout(this.turnOn.bind(this), 200);
    }.bind(this), 800);
}


module.exports = TVObject;