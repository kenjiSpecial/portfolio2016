var TVScreen = require('./tv-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var constants = require('../utils/constants');

var customEvent = require('../utils/custom-event');

var _ = require('underscore');

var TVObject = function( opts, glowObject){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onTransitionStart', 'onChangeDirectory', 'onClickToHome');
    _.bindAll(this, 'onMouseEnable', 'onMouseDisable', 'onClickToWorks', 'onClickEventHandler');
    THREE.Object3D.call( this );
    this.type = 'tvContact';

    var translateY = 75/2;

    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone()
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    //this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.tvControllerMesh.position.set( 23.5, -28+ translateY, 37 );
    this.add(this.tvControllerMesh);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.position.set( -23 , -28, 39 );
    lightMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(lightMesh)

    this.tvScreen = new TVScreen();
    this.tvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.tvScreen.addEventListener("mouseEnable", this.onMouseEnable );
    this.add(this.tvScreen);


    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    cubeGeo.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    var cubeMat = new THREE.MeshBasicMaterial({color:0x1111cc, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster);

    this.curModel = {
        'clickable' : true
    };

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );
    appStore.addEventListener( appStore.CHANGE_DIRECTORY, this.onChangeDirectory);

    //setTimeout(this.turnOn.bind(this), 840);

    this.scale.y = 0.000001;
};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.onChangeDirectory = function(event){
    //console.log('??');
    if(this.tlAngle) this.tlAngle.pause();
    var angle = constants.controller[appStore.curDirectory];
    this.tlAngle = TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});

    switch(appStore.curDirectory){
        case 'about':
            this.turnOn();
            break;
        case 'home':
            this.turnOff();
            break;
        case 'works':
            this.turnOn();
            break;
        case 'contact':
            this.turnOn();
            break;
        case 'sketch':
            this.turnOn();
            break;
        case 'work':
            setTimeout(function(){
                this.turnOnColor = constants[appStore.curDirectory].lightColor;
                this.glowMat.color = this.turnOnColor;
            }.bind(this), 600);
            this.rayCaster.material.color = constants[appStore.curDirectory].lightColor;
            break;
    }
};

TVObject.prototype.update = function(dt){
    this.tvScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    var angle = Math.PI * 2/5 * 2;
    this.tlAngle = TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});

    this.turnOnColor = constants[appStore.curDirectory].lightColor;

    setTimeout(function(){
        this.glowMat.color = this.turnOnColor;
    }.bind(this), 600);
    this.rayCaster.material.color = constants[appStore.curDirectory].lightColor;

    var prevTurnOn = this.isTurnOn;
    this.isTurnOn = true;
    if(!prevTurnOn) this.tvScreen.turnOn();
}

TVObject.prototype.turnOff = function(){
    this.turnOnColor = constants.turnOffColor;
    setTimeout(function(){
        this.glowMat.color = this.turnOnColor;
    }.bind(this), 300);

    var prevTurnOn = this.isTurnOn;
    this.isTurnOn = false;
    if(prevTurnOn)this.tvScreen.turnOff();
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

TVObject.prototype.onMouseOver = function() {
    //console.log(this.isTurnOn);
    if (!this.isTurnOn) return;
    this.tvScreen.onMouseOver();

    if (this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.3, ease: Quint.easeOut});

    if(!customEvent.hasEventListener ( 'click', this.onClickEventHandler  )) customEvent.addEventListener('click', this.onClickEventHandler );
}

TVObject.prototype.onClickEventHandler = function(){
    customEvent.dispatchEvent({type: 'mouseReset'});

    if(appStore.curDirectory == 'about' || appStore.curDirectory == 'works' || appStore.curDirectory == 'sketch' || appStore.curDirectory == 'contact' ) {
        this.onClickToHome();
    }else if(appStore.curDirectory == 'work'){
        this.onClickToWorks();
    }
};

TVObject.prototype.onMouseOut = function(){
    if(!this.isTurnOn) return;

    this.tvScreen.onMouseOut();
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});

    customEvent.removeEventListener('click', this.onClickEventHandler );
}

TVObject.prototype.onClickToWorks = function(){
    this.onMouseDisable();

    setTimeout(function(){
        this.onMouseEnable();
    }.bind(this), 1200);

    this.tvScreen.onClick();

    appAction.goToWorks();
    customEvent.removeEventListener('click', this.onClickToWorks );
}

TVObject.prototype.onClickToHome = function(){
    this.onMouseDisable();

    appAction.goToHome();

    customEvent.removeEventListener('click', this.onClickToHome );
};

TVObject.prototype.onTransitionStart = function(){
    /**
    this.tvScreen.onTransitionStart();

    this.turnOnColor = constants[appStore.curDirectory].lightColor;
    setTimeout(function(){
        this.glowMat.color = this.turnOnColor;
    }.bind(this), 1000);


    this.rayCaster.material.color = appStore.selectedObject.rayCaster.material.color;
    this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.3, ease: Quint.easeInOut, delay: 0.6});
    this.tl = TweenMax.to(this.rayCaster.material, 1.0, {opacity: 0.01, ease: Quint.easeInOut, delay: 0.6 + 1.6});
    */
}

TVObject.prototype.onMouseEnable = function(){
    this.rayCaster.mouseEnable = true;
};

TVObject.prototype.onMouseDisable = function(){
    this.rayCaster.mouseEnable = false;
}

TVObject.prototype.start = function(){
    var delay = 700; //this.col * 100 + (2 - this.row) * 200;
    setTimeout(function(){
        this.visible = true;
        TweenLite.to(this.scale,    0.6, {y: 1, ease: Elastic.easeOut.config(1, 0.8) });
        //setTimeout(this.turnOn.bind(this), 200);
        //setTimeout(function(){audioAction.click();}, 400);
    }.bind(this), delay);
}


module.exports = TVObject;