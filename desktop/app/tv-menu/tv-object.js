var TVScreen        = require('./tv-screen');
var TVAboutScreen   = require('./tv-about-screen');
var TVWorksScreen   = require('./tv-works-screen');
var TVContactScreen = require('./tv-contact-screen');
var TVSketchScreen  = require('./tv-sketch-screen');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');
var _ = require('underscore');
var constants = require('../utils/constants');

var HomeModel    = require('./model/home-model');
var AboutModel   = require('./model/about-model');
var WorksModel   = require('./model/works-model');
var WorkModel    = require('./model/work-model');
var ContactModel = require('./model/contact-model');
var SketchModel  = require('./model/sketch-model');

var audioAction = require('../actions/audio-action');

var TVObject = function( opts, tvScreen ){
    _.bindAll(this, 'onMainMouseOverObjectUpdated', 'onClickHandler', 'onTransitionStart', 'onChangeDirectory', 'onMouseEnable', 'onMouseDisable');
    _.bindAll(this, 'onClickWorksHandler', 'onClickWorkHandler', 'onClickContactHandler', 'onClickSketchHandler', 'onClickAboutHandler');

    THREE.Object3D.call( this );

    this.row = opts.row || 0;
    this.col = opts.col || 0;
    this.idNumber = this.row * 3 + this.col;
    this.tag = constants.types[this.row];

    var translateY = 75/2;

    //console.log(window.app.assets.model.tvData.geometry.clone());
    this.tvGeometry = window.app.assets.model.tvData.geometry;
    this.tvMaterial = window.app.assets.model.tvData.material.clone();
    this.tvMesh = new THREE.Mesh( this.tvGeometry, this.tvMaterial );
    //this.tvMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.add(this.tvMesh);

    this.tvControllerGeometry = window.app.assets.model.tvController.geometry.clone();
    this.tvControllerMaterial = window.app.assets.model.tvController.material.clone();
    this.tvControllerMesh     = new THREE.Mesh( this.tvControllerGeometry, this.tvControllerMaterial );
    this.tvControllerMesh.position.set( 23, -28 + translateY, 37 );
    //this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.add(this.tvControllerMesh);

    this.homeModel  = new HomeModel(this.row, this.col);
    this.aboutModel = new AboutModel(this.row, this.col);
    this.worksModel = new WorksModel(this.row, this.col);
    this.workModel  = new WorkModel(this.row, this.col);
    this.contactModel = new ContactModel(this.row, this.col);
    this.sketchModel  = new SketchModel(this.row, this.col);

    var sphere = new THREE.SphereGeometry(1, 1);
    this.glowMat = new THREE.MeshBasicMaterial({color: 0xcc1111});
    var lightMesh = new THREE.Mesh(sphere, this.glowMat);
    lightMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    lightMesh.position.set( -23 , -28, 39 );
    //lightMesh.scaleY = 0.01;
    this.add(lightMesh)

    if(tvScreen) this.tvScreen = tvScreen
    else this.tvScreen = new TVScreen( null, opts, this.row, this.col );
    this.tvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.tvScreen.addEventListener('mouseDisable', this.onMouseDisable );
    this.tvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.aboutTvScreen = new TVAboutScreen( this.row, this.col );
    this.aboutTvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.aboutTvScreen.addEventListener('mouseDisable', this.onMouseDisable );
    this.aboutTvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.worksTvScreen = new TVWorksScreen( this.row, this.col, this.worksModel );
    this.worksTvScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.worksTvScreen.addEventListener('mouseDisable', this.onMouseDisable );
    this.worksTvScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.contactTVScreen = new TVContactScreen( this.row, this.col, this.contactModel );
    this.contactTVScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.contactTVScreen.addEventListener('mouseDisable', this.onMouseDisable );
    this.contactTVScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    this.sketchTVScreen = new TVSketchScreen( this.row, this.col, this.sketchModel );
    this.sketchTVScreen.addEventListener('mouseEnable',  this.onMouseEnable   );
    this.sketchTVScreen.addEventListener('mouseDisable', this.onMouseDisable );
    this.sketchTVScreen.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );

    var cubeGeo = new THREE.CubeGeometry( 75, 75, 75);
    var cubeMat = new THREE.MeshBasicMaterial({color:0x000000, opacity: 0.01, transparent: true});
    //this.tvControllerMesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    cubeGeo.applyMatrix( new THREE.Matrix4().makeTranslation ( 0, translateY, 0 ) );
    this.rayCaster = new THREE.Mesh(cubeGeo, cubeMat);
    this.add(this.rayCaster)

    appStore.addEventListener( appStore.MAIN_MOUSE_OVER_OBJECT_UPDATED, this.onMainMouseOverObjectUpdated );
    appStore.addEventListener( appStore.CHANGE_DIRECTORY, this.onChangeDirectory );


    this.position.set( constants.tvPosition.x * (this.col - 1), constants.tvPosition.y * (-this.row + 1), 0 )

    this.add(this.tvScreen);

    this.scale.y = 0.000001;

    this.goToHomeInit();
};

TVObject.prototype = Object.create(THREE.Object3D.prototype);
TVObject.prototype.constructor = TVObject.prototype;

TVObject.prototype.onChangeDirectory = function(){
    this.setRouter();
};

TVObject.prototype.setRouter = function(){
    this.onMouseDisable();

    if(this.tlAngle) this.tlAngle.pause();
    var angle = constants.controller[appStore.curDirectory];
    this.tlAngle = TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});


    //console.log(appStore.prevDirectory);
    if(appStore.prevDirectory == 'works'){
        this.worksTvScreen.stopTimer();
    }

    if(appStore.prevDirectory == 'work'){
        this.goToWorksFromWork();
        return;
    }


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
        case 'work':
            this.goToWork();
            break;
        case 'contact':
            this.goToContact();
            break;
        case 'sketch':
            this.goToSketch();
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

    //setTimeout(this.turnOn.bind(this), constants.delay.firstDelay + constants.delay.intervalDelay * ( this.col) );
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
    }else if(appStore.prevDirectory == 'contact'){
        this.contactTVScreen.backToHome();
    }else if(appStore.prevDirectory == 'sketch'){
        this.sketchTVScreen.backToHome();
    }


    setTimeout(function(){
        if(appStore.prevDirectory == 'about') this.remove(this.aboutTvScreen);
        else if(appStore.prevDirectory == 'works') this.remove(this.worksTvScreen);
        else if(appStore.prevDirectory == 'contact') this.remove(this.contactTVScreen);
        else if(appStore.prevDirectory == 'sketch') this.remove(this.sketchTVScreen);

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

TVObject.prototype.goToWork = function(){
    this.curModel = this.workModel;
    this.workModel.set(appStore.selectedObject);

    this.worksTvScreen.transToWork(this.workModel);

    this.turnOnColor = this.curModel.clickable ?  constants['work'].heightLightColor : constants['work'].lightColor;
    this.glowMat.color = this.turnOnColor;
    this.rayCaster.material.color = constants['work'].heightLightColor;
    //console.log(constants['work'].lightColor);
};

TVObject.prototype.goToWorksFromWork = function(){
    this.curModel = this.worksModel;

    this.worksTvScreen.backToWorks();

    setTimeout(function(){
        this.turnOnColor = constants[appStore.curDirectory].lightColor;
        this.glowMat.color = this.turnOnColor;

        this.rayCaster.material.color = constants[appStore.curDirectory].lightColor;
    }.bind(this), 300 + 300 * Math.random())
};

TVObject.prototype.goToWorks = function(){
    this.curModel = this.worksModel;
    this.workModel.reset();

    this.onTransitionStart();

    setTimeout(function(){
        this.remove(this.tvScreen);
        this.add(this.worksTvScreen);

        this.worksTvScreen.startTransition();
        TweenMax.to(this.rayCaster.material, 0.4, {opacity: 0.01});
    }.bind(this), 1200 +  150 * this.col );
};

TVObject.prototype.goToContact = function(){
    this.curModel = this.contactModel;
    this.curModel.reset();

    this.onTransitionStart();

    setTimeout(function(){
        this.remove(this.tvScreen);
        this.add(this.contactTVScreen);

        this.contactTVScreen.startTransition();
        TweenMax.to(this.rayCaster.material, 0.4, {opacity: 0.01});
    }.bind(this), 1200 +  150 * this.col );
};

TVObject.prototype.goToSketch = function(){
    this.curModel = this.sketchModel;
    this.curModel.reset();



    this.onTransitionStart();

    if(!this.curModel.type){
        clearTimeout(this.timerId);

        this.turnOnColor = constants.blackColor;
        var delay = Math.abs(this.col - appStore.selectedObject.col) * 100;
        this.timerId = setTimeout(function(){
            this.glowMat.color = this.turnOnColor;
        }.bind(this), delay);
        setTimeout(function(){
            this.rayCaster.material.color = constants.blackColor;
        }.bind(this), 1500);

    }

    setTimeout(function(){
        this.remove(this.tvScreen);
        this.add(this.sketchTVScreen);

        this.sketchTVScreen.startTransition();
        TweenMax.to(this.rayCaster.material, 0.4, {opacity: 0.01});
    }.bind(this), 1200 +  150 * this.col );
}

TVObject.prototype.update = function(dt){
    if(this.tvScreen.parent) this.tvScreen.update(dt);
    if(this.aboutTvScreen.parent) this.aboutTvScreen.update(dt);
    if(this.worksTvScreen.parent) this.worksTvScreen.update(dt);
    if(this.contactTVScreen.parent) this.contactTVScreen.update(dt);
    if(this.sketchTVScreen.parent) this.sketchTVScreen.update(dt);
};

TVObject.prototype.turnOn = function(){
    //console.log('turnOn');

    //audioAction.turn();
    //var angle = (this.idNumber/9 *  + 1) * Math.PI * 2/5
    var angle = Math.PI * 2/5
    TweenMax.to(this.tvControllerMesh.rotation, 0.4, {z: angle});

    this.glowMat.color = new THREE.Color(0x1111cc);
    if(this.turnOnColor) {
        setTimeout(function () {
            this.glowMat.color = this.turnOnColor;
        }.bind(this), 300);
    }
    this.tvScreen.turnOn();
}

TVObject.prototype.onMainMouseOverObjectUpdated = function(){
    if(appStore.mainMouseOverObject == this){
        this.isMouseOver = true;
        setTimeout(function(){ this.onMouseOver();}.bind(this), 0);
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
    audioAction.mouseOver();
    if(appStore.curDirectory == 'home') window.addEventListener('click', this.onClickHandler );
    else if(appStore.curDirectory == 'about') this.onMouseOverAbout();
    else if(appStore.curDirectory == 'works') this.onMouseOverWorks();
    else if(appStore.curDirectory == 'work')  this.onMouseOverWork();
    else if(appStore.curDirectory == 'contact')  this.onMouseOverContact();
    else if(appStore.curDirectory == 'sketch') this.onMouseOverSketch();
};

TVObject.prototype.onMouseOverAbout = function(){
    this.aboutTvScreen.onMouserOver();

    if(this.aboutModel.clickable){
        window.addEventListener('click', this.onClickAboutHandler );
    }
};

TVObject.prototype.onMouseOverWorks = function(){
    this.worksTvScreen.onMouserOver();

    if(this.worksModel.clickable){
        window.addEventListener('click', this.onClickWorksHandler );
    }
};

TVObject.prototype.onMouseOverWork = function(){
    if(this.workModel.clickable){
        this.worksTvScreen.onWorkMouseOver();
        window.addEventListener('click', this.onClickWorkHandler);
    }
};

TVObject.prototype.onMouseOverContact = function(){
    if(this.contactModel.clickable){
        this.contactTVScreen.onMouserOver();
        window.addEventListener('click', this.onClickContactHandler);
    }
};

TVObject.prototype.onMouseOverSketch = function(){
    if(!this.curModel.type) return;

    if(this.sketchModel.clickable){
        this.sketchTVScreen.onMouserOver();
        window.addEventListener('click', this.onClickSketchHandler);
    }
}

TVObject.prototype.onMouseOut = function(){
    //console.log('mouseout');
    //if(appStore.curDirectory != 'home') return;

    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.rayCaster.material, 0.6, {opacity: 0.01, ease: Quint.easeOut});
    if(appStore.curDirectory == 'home') window.removeEventListener('click', this.onClickHandler );
    else if(appStore.curDirectory == 'about') this.onMouseOutAbout();
    else if(appStore.curDirectory == 'works') this.onMouseOutWorks();
    else if(appStore.curDirectory == 'work' ) this.onMouseOutWork();
    else if(appStore.curDirectory == 'contact') this.onMouseOutContact();
    else if(appStore.curDirectory == 'sketch') this.onMouseOutSketch();
};

TVObject.prototype.onMouseOverType = function(){
    this.tvScreen.onMouseOverType();
};

TVObject.prototype.onMouseOutType = function(){
    if(appStore.curDirectory == 'home') this.tvScreen.onMouseOutType();
};

TVObject.prototype.onMouseOutAbout = function(){
    this.aboutTvScreen.onMouserOut();

    if(this.aboutModel.clickable){
        window.removeEventListener('click', this.onClickAboutHandler );
    }
}

TVObject.prototype.onMouseOutWorks = function(){
    this.worksTvScreen.onMouserOut();
    window.removeEventListener('click', this.onClickWorksHandler );
};

TVObject.prototype.onMouseOutContact = function(){
    this.contactTVScreen.onMouserOut();
    window.removeEventListener('click', this.onClickContactHandler );
};

TVObject.prototype.onMouseOutSketch = function(){
    if(!this.curModel.type) return;

    this.sketchTVScreen.onMouserOut();
    window.removeEventListener('click', this.onClickSketchHandler );
}

TVObject.prototype.onMouseOutWork = function(){
    document.body.style.cursor = "default";
    if(this.workModel.clickable){
        this.worksTvScreen.onWorkMouseOut();
        window.removeEventListener('click', this.onClickWorkHandler );
    }

}

TVObject.prototype.onClickHandler = function(){
    appAction.clickObject(this);
    window.removeEventListener('click', this.onClickHandler );
    audioAction.click();

};

TVObject.prototype.onClickWorksHandler = function(){
    if(this.idNumber == 8){
        var win = window.open(this.curModel.worksData.url, '_blank');
        if(win){
            win.focus();
        }else{
            //Broswer has blocked it
            alert('Please allow popups for this site');
        }
    } else {
        appAction.clickWorks(this.worksModel);
    }
    audioAction.click();
    window.removeEventListener('click', this.onClickWorksHandler );
};

TVObject.prototype.onClickAboutHandler = function(){
    document.body.style.cursor = "default";
    var win = window.open(this.aboutModel.url, '_blank');
    if(win) win.focus();
    else alert('Please allow popups for this site');

    audioAction.click();
    window.removeEventListener('click', this.onClickAboutHandler );
}

TVObject.prototype.onClickWorkHandler = function(){
    document.body.style.cursor = "default";
    var win = window.open(this.curModel.workData.url, '_blank');
    if(win){
        //Browser has allowed it to be opened
        win.focus();
    }else{
        //Broswer has blocked it
        alert('Please allow popups for this site');
    }
    audioAction.click();
    window.removeEventListener('click', this.onClickWorkHandler );
};

TVObject.prototype.onClickContactHandler = function(){
    document.body.style.cursor = "default";
    var win;

    if(this.curModel.isMail) {
        var mailto_link = 'mailto:' + this.curModel.url + '?subject=Hello!';
        win = window.open(mailto_link, 'emailWindow');
        //if (win && win.open && !win.closed) win.close();
    }else{
        var win = window.open(this.curModel.url, '_blank');
        if(win){
            //Browser has allowed it to be opened
            win.focus();
        }else{
            //Broswer has blocked it
            alert('Please allow popups for this site');
        }
    }
    //url
    audioAction.click();
    window.removeEventListener('click', this.onClickContactHandler );
};

TVObject.prototype.onClickSketchHandler = function(){
    var win = window.open(this.curModel.url, '_blank');
    if(win){
        //Browser has allowed it to be opened
        win.focus();
    }else{
        //Broswer has blocked it
        alert('Please allow popups for this site');
    }
    audioAction.click();
    window.removeEventListener('click', this.onClickSketchHandler );
}

TVObject.prototype.onTransitionStart = function(){
    this.transToNextStage();

    this.turnOnColor = constants[appStore.curDirectory].lightColor;
    var delay = Math.abs(this.col - appStore.selectedObject.col) * 100;
    this.timerId = setTimeout(function(){
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

TVObject.prototype.start = function(){
    var delay = this.col * 100 + (2 - this.row) * 200;
    setTimeout(function(){
        this.visible = true;
        TweenLite.to(this.scale,    0.6, {y: 1, ease: Elastic.easeOut.config(1, 0.8) });
        setTimeout(this.turnOn.bind(this), 200);
        setTimeout(function(){audioAction.click();}, 400);
    }.bind(this), delay);
}

module.exports = TVObject;