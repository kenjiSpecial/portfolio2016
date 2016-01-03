var TVScreen = require('./tv-screen');
var TVAboutScreen = require('./tv-about-screen');
var TVWorksScreen = require('./tv-works-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var _ = require('underscore');
var constants = require('../utils/constants');

var HomeModel  = require('./model/home-model');
var AboutModel = require('./model/about-model');
var WorksModel = require('./model/works-model');
var WorkModel  = require('./model/work-model');

var TVObject = function( opts, tvScreen ){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onClickHandler', 'onTransitionStart', 'onChangeDirectory', 'onMouseEnable', 'onMouseDisable');
    //_.bindAll(this, );

    THREE.Object3D.call( this );

    this.row = opts.row || 0;
    this.col = opts.col || 0;
    this.tag = constants.types[this.row];

    //console.log(window.app.assets.model.tvData.geometry.clone());
    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone();
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    this.tvControllerMesh.position.set( 23, -28, 37 );
    this.add(this.tvControllerMesh);

    this.homeModel  = new HomeModel(this.row, this.col);
    this.aboutModel = new AboutModel(this.row, this.col);
    this.worksModel = new WorksModel(this.row, this.col);
    this.workModel  = new WorkModel(this.row, this.col);


    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.position.set( -23 , -28, 39 );
    this.add(lightMesh)

    if(tvScreen) this.tvScreen = tvScreen
    else this.tvScreen = new TVScreen( null, opts, this.row, this.col );
    this.tvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.tvScreen.addEventListener('mouseDisable', this.onMouseDisable );

    this.aboutTvScreen = new TVAboutScreen( this.row, this.col );
    this.aboutTvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.aboutTvScreen.addEventListener('mouseDisable', this.onMouseDisable );

    this.worksTvScreen = new TVWorksScreen( this.row, this.col, this.worksModel );
    this.worksTvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.worksTvScreen.addEventListener('mouseDisable', this.onMouseDisable );


    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    var cubeMat = new THREE.MeshBasicMaterial({color:0x000000, opacity: 0.01, transparent: true});
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster)

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );
    appStore.addEventListener( appStore.CHANGE_DIRECTORY, this.onChangeDirectory );


    this.position.set( constants.tvPosition.x * (this.col - 1), constants.tvPosition.y * (-this.row + 1), 0 )

    this.add(this.tvScreen);

    this.goToHomeInit();

};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.onChangeDirectory = function(){
    this.setRouter();
};

TVObject.prototype.setRouter = function(){
    this.onMouseDisable();


    switch (appStore.curDirectory){
        case 'home':
            this.goToHome();
            break;
        case 'about':
            this.goToAbout();
            break;
        case 'works':
            this.goToWorks();
            break;
    }
};

TVObject.prototype.removeChild = function(){
    if(this.tvScreen.parent) this.remove(this.tvScreen);
};

TVObject.prototype.goToHomeInit = function(){
    //console.log('gotohome');
    this.curModel = this.homeModel;
    this.homeModel.reset();

    setTimeout(this.turnOn.bind(this), constants.delay.firstDelay + constants.delay.intervalDelay * ( this.col) );
    this.rayCaster.material.color = constants[this.tag].lightColor; //new THREE.Color(0xff3333);
    this.turnOnColor = constants[this.tag].lightColor;
};

TVObject.prototype.goToHome = function(){
    this.curModel = this.homeModel;
    this.homeModel.reset();

    if(appStore.prevDirectory == "about"){
        this.aboutTvScreen.backToHome();
    }else if(appStore.prevDirectory == 'works'){
        this.worksTvScreen.backToHome();
    }

    setTimeout(function(){
        if(appStore.prevDirectory == 'about') this.remove(this.aboutTvScreen);
        if(appStore.prevDirectory == 'works') this.remove(this.worksTvScreen);

        this.add(this.tvScreen);
        this.tvScreen.resetHome();
    }.bind(this), 400);

    this.turnOnColor = constants[this.tag].lightColor;
    this.glowMat.color = this.turnOnColor;
    this.rayCaster.material.color = this.turnOnColor;

}

TVObject.prototype.goToAbout = function(){
    this.curModel = this.aboutModel;
    this.aboutModel.reset();

    this.onTransitionStart();

    setTimeout(function(){
        this.remove(this.tvScreen);
        this.add(this.aboutTvScreen);

        this.aboutTvScreen.startTransition();
        TweenMax.to(this.rayCaster.material, 0.4, {opacity: 0.01});
    }.bind(this), 1200 +  150 * this.col );

};

TVObject.prototype.goToWorks = function(){
    //console.log('goToWorks');
    this.curModel = this.workModel;
    this.workModel.reset();

    this.onTransitionStart();


    setTimeout(function(){
        this.remove(this.tvScreen);
        this.add(this.worksTvScreen);

        this.worksTvScreen.startTransition();
        TweenMax.to(this.rayCaster.material, 0.4, {opacity: 0.01});
    }.bind(this), 1200 +  150 * this.col );
};

TVObject.prototype.update = function(dt){
    if(this.tvScreen.parent) this.tvScreen.update(dt);
    if(this.aboutTvScreen.parent) this.aboutTvScreen.update(dt);
    if(this.worksTvScreen.parent) this.worksTvScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    this.glowMat.color = new THREE.Color(0x1111cc);
    if(this.turnOnColor) {
        setTimeout(function () {
            this.glowMat.color = this.turnOnColor;
        }.bind(this), 1000);
    }
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


    if(!appStore.mainMouseOverObject){
        if(appStore.prevMainMouseOverObject.tag == this.tag) this.onMouseOutType();
    }else if(!appStore.prevMainMouseOverObject){
        if(appStore.mainMouseOverObject.tag == this.tag) this.onMouseOverType();
    }else{
        if(appStore.mainMouseOverObject.tag == this.tag && appStore.mainMouseOverObject.tag != appStore.prevMainMouseOverObject.tag ){
            this.onMouseOverType();
        }else  if(appStore.prevMainMouseOverObject.tag == this.tag && appStore.mainMouseOverObject.tag != appStore.prevMainMouseOverObject.tag){
            this.onMouseOutType();
        }
    }
}

TVObject.prototype.onMouseOver = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.3, ease: Quint.easeOut});

    if(appStore.curDirectory == 'home') window.addEventListener('click', this.onClickHandler );
    else if(appStore.curDirectory == 'about') this.onMouseOverAbout();
    else if(appStore.curDirectory == 'works') this.onMouseOverWorks();
};

TVObject.prototype.onMouseOverAbout = function(){
    this.aboutTvScreen.onMouserOver();
};

TVObject.prototype.onMouseOverWorks = function(){
    this.worksTvScreen.onMouserOver();
};

TVObject.prototype.onMouseOut = function(){
    //console.log('mouseout');
    //if(appStore.curDirectory != 'home') return;

    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});
    if(appStore.curDirectory == 'home') window.removeEventListener('click', this.onClickHandler );
    else if(appStore.curDirectory == 'about') this.onMouseOutAbout();
    else if(appStore.curDirectory == 'works') this.onMouseOutWorks();
};

TVObject.prototype.onMouseOverType = function(){
    this.tvScreen.onMouseOverType();
};

TVObject.prototype.onMouseOutType = function(){
    if(appStore.curDirectory == 'home') this.tvScreen.onMouseOutType();
};

TVObject.prototype.onMouseOutAbout = function(){
    this.aboutTvScreen.onMouserOut();
}

TVObject.prototype.onMouseOutWorks = function(){
    this.worksTvScreen.onMouserOut();
}

TVObject.prototype.onClickHandler = function(){
    appAction.clickObject(this);
    window.removeEventListener('click', this.onClickHandler );
};

TVObject.prototype.onTransitionStart = function(){
    this.transToNextStage();

    this.turnOnColor = constants[appStore.curDirectory].lightColor;
    var delay = Math.abs(this.col - appStore.selectedObject.col) * 100;
    setTimeout(function(){
        this.glowMat.color = this.turnOnColor;
    }.bind(this), delay);


    var delay = (Math.abs(this.col - appStore.selectedObject.col) + Math.abs(this.row - appStore.selectedObject.row)) /20;
    this.rayCaster.material.color = appStore.selectedObject.rayCaster.material.color;
    this.tl = TweenMax.to(this.rayCaster.material, 0.2, {opacity: 0.3, ease: Quint.easeOut, delay: delay});

};

TVObject.prototype.transToNextStage = function(){
    this.tvScreen.transToNextStage();
}

TVObject.prototype.onMouseEnable = function(){
    this.rayCaster.mouseEnable = true;
};

TVObject.prototype.onMouseDisable = function(){
    this.rayCaster.mouseEnable = false;
};

module.exports = TVObject;