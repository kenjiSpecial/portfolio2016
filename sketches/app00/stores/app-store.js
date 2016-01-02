var appAction = require('../actions/app-action');
var _ = require('underscore');

var AppStore = function(){
    _.bindAll(this, 'onMouseOverObject', 'onMouseOutObject', 'onClickObject', 'onMouseEnable', 'onMouseDisable');
    _.bindAll(this, 'onMouseOverAboutType', 'onMouseOutAboutType')

    this.curDirectory         = 'home';
    this._mouseOverObject     = null;
    this._mainMouseOverObject = null;
    this.isMouseEnable       = false;

    appAction.addEventListener(appAction.MOUSE_OVER_OBJECT, this.onMouseOverObject )
    appAction.addEventListener(appAction.MOUSE_OUT_OBJECT,  this.onMouseOutObject);
    appAction.addEventListener(appAction.CLICK_OBJECT,      this.onClickObject);
    appAction.addEventListener(appAction.MOUSE_ENABLE,      this.onMouseEnable );
    appAction.addEventListener(appAction.MOUSE_DISABLE,     this.onMouseDisable );
    appAction.addEventListener(appAction.MOUSE_OVER_ABOUT_TYPE, this.onMouseOverAboutType);
    appAction.addEventListener(appAction.MOUSE_OUT_ABOUT_TYPE, this.onMouseOutAboutType);
}

THREE.EventDispatcher.prototype.apply( AppStore.prototype );


AppStore.prototype.MAIN_MOUSE_OVER_OBJECT_UPDATED = 'mainMouseOverObjectUpdated';
AppStore.prototype.TRANSITION_START               = 'transitionStart';
AppStore.prototype.TRANSITION_END                 = 'transitionEnd';
AppStore.prototype.CHANGE_DIRECTORY               = 'changeDirectory';
AppStore.prototype.MOUSE_ENABLE_CHANGED           = 'mouseEnableChanged';
AppStore.prototype.MOUSE_ENABLE                   = 'mouseEnable';
AppStore.prototype.MOUSE_DISABLE                  = 'mouseDisable';
AppStore.prototype.MOUSE_OVER_ABOUT_TYPE = 'mouseOverAboutType';
AppStore.prototype.MOUSE_OUT_ABOUT_TYPE  = 'mouseOutAboutType';


AppStore.prototype.onMouseOverAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_ABOUT_TYPE});
}


AppStore.prototype.onMouseOutAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_ABOUT_TYPE});
}

AppStore.prototype.onMouseOverObject = function(ev){
    this.mouseOverProject = ev.object;

    if(this.mouseOverProject.parent.curModel && this.mouseOverProject.parent.curModel.clickable){
        document.body.style.cursor = "pointer";
    }

}

AppStore.prototype.onMouseOutObject = function(){
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;

    document.body.style.cursor = "default";
};

AppStore.prototype.onClickObject = function(ev){
    this.curDirectory = ev.object.tag;
    this.selectedObject = ev.object;

    document.body.style.cursor = "default";
    this.mouseOverProject = null;
    this.mainMouseOverObject = null;
};

AppStore.prototype.onMouseEnable = function(){
    this.isMouseEnable       = true;
}

AppStore.prototype.onMouseDisable = function(){
    document.body.style.cursor = "default";
    this.isMouseEnable         = false;
}

Object.defineProperty(AppStore.prototype, 'isTransition', {
    get : function(){
        return this._isTransition;
    },
    set : function(value){
        this._isPrevTransition = this._isTransition;
        this._isTransition = value;

        if( !this._isPrevTransition &&  this._isTransition ) this.dispatchEvent({type: this.TRANSITION_START});
        if(  this._isPrevTransition && !this._isTransition ) this.dispatchEvent({type: this.TRANSITION_END});

    }
});

Object.defineProperty(AppStore.prototype, 'selectedObject', {
    get : function(){
        return this._selectedObject;
    },
    set : function(value){
        //this.prev
        this.prevObject = this._selectedObject;
        this._selectedObject = value;
        this.selectedType   = value.type;

        this.isTransition = true;
        this.onMouseDisable();
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

        if(this.prevDirectory != this._curDirectory) {
            setTimeout(function(){
                this.dispatchEvent({type: this.CHANGE_DIRECTORY });
            }.bind(this), 0);
        }
    }
});

Object.defineProperty(AppStore.prototype, 'isMouseEnable', {
    get : function(){
        return this._isMouseEnable;
    },
    set : function(value){
        this.prevMouseEnalble = this._isMouseEnable;
        this._isMouseEnable = value;
        if(this._isMouseEnable != this.prevMouseEnalble) this.dispatchEvent({type: this.MOUSE_ENABLE_CHANGED });
    }
});


var appStore = new AppStore();

module.exports = appStore;