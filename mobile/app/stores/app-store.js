var appAction = require('../actions/app-action');
var _ = require('underscore');

var AppStore = function(){
    _.bindAll(this, 'onMouseOverObject', 'onMouseOutObject', 'onClickObject');
    _.bindAll(this, 'onMouseOverAboutType', 'onMouseOutAboutType', 'onGoToHome');
    _.bindAll(this, 'onMouseOverWorksType', 'onMouseOutWorksType');
    _.bindAll(this, 'onClickWorks', 'onGoToWorks', 'onMouseOverContactType', 'onMouseOutContactType', 'onChangeAudioHandler');

    this._curDirectory         = 'home';
    this._isAudio = true;
    this._mouseOverObject     = null;
    this._mainMouseOverObject = null;

    appAction.addEventListener(appAction.MOUSE_OVER_OBJECT, this.onMouseOverObject )
    appAction.addEventListener(appAction.MOUSE_OUT_OBJECT,  this.onMouseOutObject);
    appAction.addEventListener(appAction.CLICK_OBJECT,      this.onClickObject);
    appAction.addEventListener(appAction.MOUSE_OVER_ABOUT_TYPE, this.onMouseOverAboutType);
    appAction.addEventListener(appAction.MOUSE_OUT_ABOUT_TYPE, this.onMouseOutAboutType);
    appAction.addEventListener(appAction.MOUSE_OVER_WORKS_TYPE, this.onMouseOverWorksType);
    appAction.addEventListener(appAction.MOUSE_OUT_WORKS_TYPE, this.onMouseOutWorksType);
    appAction.addEventListener(appAction.MOUSE_OVER_CONTACT_TYPE, this.onMouseOverContactType);
    appAction.addEventListener(appAction.MOUSE_OUT_CONTACT_TYPE, this.onMouseOutContactType);
    appAction.addEventListener(appAction.GO_TO_HOME, this.onGoToHome);
    appAction.addEventListener(appAction.GO_TO_WORKS, this.onGoToWorks);
    appAction.addEventListener(appAction.CLICK_WORKS, this.onClickWorks);

}

THREE.EventDispatcher.prototype.apply( AppStore.prototype );


AppStore.prototype.MAIN_MOUSE_OVER_OBJECT_UPDATED = 'mainMouseOverObjectUpdated';
AppStore.prototype.TRANSITION_START               = 'transitionStart';
AppStore.prototype.TRANSITION_END                 = 'transitionEnd';
AppStore.prototype.CHANGE_DIRECTORY               = 'changeDirectory';
AppStore.prototype.MOUSE_ENABLE_CHANGED           = 'mouseEnableChanged';
AppStore.prototype.MOUSE_ENABLE                   = 'mouseEnable';
AppStore.prototype.MOUSE_DISABLE                  = 'mouseDisable';
AppStore.prototype.MOUSE_OVER_ABOUT_TYPE   = 'mouseOverAboutType';
AppStore.prototype.MOUSE_OUT_ABOUT_TYPE    = 'mouseOutAboutType';
AppStore.prototype.MOUSE_OVER_WORKS_TYPE   = 'mouseOverWorksType';
AppStore.prototype.MOUSE_OUT_WORKS_TYPE    = 'mouseOutWorksType';
AppStore.prototype.MOUSE_OVER_CONTACT_TYPE = 'mouseOverWorksType';
AppStore.prototype.MOUSE_OUT_CONTACT_TYPE  = 'mouseOutWorksType';
AppStore.prototype.GO_TO_HOME              = 'goToHome';
AppStore.prototype.GO_TO_WORKS             = 'goToWorks';
AppStore.prototype.CLICK_WORKS             = "clickWorks";
AppStore.prototype.AUDIO_CHANGED           = "audioChanged";

AppStore.prototype.onMouseOverWorksType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_WORKS_TYPE});
};

AppStore.prototype.onMouseOutWorksType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_WORKS_TYPE});
};

AppStore.prototype.onMouseOverAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_ABOUT_TYPE});
};

AppStore.prototype.onMouseOutAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_ABOUT_TYPE});
};

AppStore.prototype.onMouseOverContactType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_CONTACT_TYPE});
};

AppStore.prototype.onMouseOutContactType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_CONTACT_TYPE});
};

AppStore.prototype.onMouseOverObject = function(ev){
    this.mouseOverProject = ev.object;

    if(this.mouseOverProject.parent.curModel && this.mouseOverProject.parent.curModel.clickable){
        document.body.style.cursor = "pointer";
    }else{
        document.body.style.cursor = "default";
    }

}

AppStore.prototype.onChangeAudioHandler = function(){
    this.isAudio = !this.isAudio;
};

AppStore.prototype.onMouseOutObject = function(){
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;

    document.body.style.cursor = "default";
};

AppStore.prototype.onClickObject = function(ev){
    this.curDirectory = ev.object.tag;
    this.selectedObject = ev.object;
    //console.log(this.curDirectory); console.log( this.selectedObject);

    document.body.style.cursor = "default";
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;
};

AppStore.prototype.onGoToHome = function(){
    this.curDirectory = 'home';
    this.selectedObject = null;

    document.body.style.cursor = "default";
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;

    //setTimeout(this.onMouseEnable.bind(this), 1000);
}

AppStore.prototype.onGoToWorks = function(){
    console.log('onGoToWorks');
    this.curDirectory = "works";
    this.selectedObject = null;

    document.body.style.cursor = "default";
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;
};

AppStore.prototype.onClickWorks = function(ev){
    this.curDirectory = 'work'; //ev.model.id;
    this.selectedObject = ev.model;

    document.body.style.cursor = "default";
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;
};

AppStore.prototype.onMouseDisable = function(){
    document.body.style.cursor = "default";
}

Object.defineProperty(AppStore.prototype, 'isTransition', {
    get : function(){
        return this._isTransition;
    },
    set : function(value){
        this._isPrevTransition = this._isTransition;
        this._isTransition = value;

        if( this._isTransition ) this.dispatchEvent({type: this.TRANSITION_START});
        //if(  this._isPrevTransition && !this._isTransition ) this.dispatchEvent({type: this.TRANSITION_END});

    }
});

Object.defineProperty(AppStore.prototype, 'selectedObject', {
    get : function(){
        return this._selectedObject;
    },
    set : function(value){
        //this.prev
        this.prevObject = this._selectedObject;
        if(value){
            this._selectedObject = value;
        }else{
            this._selectedObject = null;
        }

        this.isTransition = true;
    }
});



Object.defineProperty(AppStore.prototype, 'mouseOverProject', {
    get : function(){
        return this._mouseOverObject;
    },
    set : function(value){
        this._prevMouseOverObject = this._mouseOverObject;
        this._mouseOverObject = value;

        if(value && value.parent) this.mainMouseOverObject = value.parent;
    }
});

Object.defineProperty(AppStore.prototype, 'mainMouseOverObject', {
    get : function(){
        return this._mainMouseOverObject;
    },
    set : function(value){
        this.prevMainMouseOverObject = this._mainMouseOverObject;
        this._mainMouseOverObject = value;
        if(this.prevMainMouseOverObject != this._mainMouseOverObject) this.dispatchEvent({type: this.MAIN_MOUSE_OVER_OBJECT_UPDATED});
    }
});

Object.defineProperty(AppStore.prototype, 'curDirectory', {
    get : function(){
        return this._curDirectory;
    },
    set : function(value){
        this.prevDirectory = this._curDirectory;
        this._curDirectory = value;
        ga('send', 'pageview', this._curDirectory);

        if(this.prevDirectory != this._curDirectory) {
            setTimeout(function(){
                this.dispatchEvent({type: this.CHANGE_DIRECTORY });
            }.bind(this), 0);
        }
    }
});

Object.defineProperty(AppStore.prototype, 'isAudio', {
    get : function(){
        return this._isAudio;
    },
    set : function(value){
        this.isPrevAudio = this._isAudio;
        this._isAudio = value;

        if(this.isPrevAudio != this._isAudio) this.dispatchEvent({type: this.AUDIO_CHANGED });
    }
});



var appStore = new AppStore();

module.exports = appStore;