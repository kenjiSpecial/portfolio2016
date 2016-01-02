

var AppAction = function(){

};

THREE.EventDispatcher.prototype.apply( AppAction.prototype );

AppAction.prototype.MOUSE_OVER_OBJECT     = 'mouseOverObject';
AppAction.prototype.MOUSE_OUT_OBJECT      = 'mouseOutObject';
AppAction.prototype.CLICK_OBJECT          = 'clickObject';
AppAction.prototype.MOUSE_ENABLE          = 'mouseEnable';
AppAction.prototype.MOUSE_DISABLE         = 'mouseDisable';
AppAction.prototype.MOUSE_OVER_ABOUT_TYPE = 'mouseOverAboutType';
AppAction.prototype.MOUSE_OUT_ABOUT_TYPE  = 'mouseOutAboutType';

AppAction.prototype.onMouseOverAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_ABOUT_TYPE})
};

AppAction.prototype.onMouseOutAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_ABOUT_TYPE})
};

AppAction.prototype.mouseOver = function(object){
    this.dispatchEvent({ type: this.MOUSE_OVER_OBJECT, object: object });
};

AppAction.prototype.mouseOut = function(object){
    this.dispatchEvent({ type: this.MOUSE_OUT_OBJECT });
};

AppAction.prototype.clickObject = function(object){
    this.dispatchEvent({ type: this.CLICK_OBJECT, object: object });
};

AppAction.prototype.mouseEnable = function(){
    this.dispatchEvent({ type: this.MOUSE_ENABLE });
};

AppAction.prototype.mouseDiable = function(){
    this.dispatchEvent({ type: this.MOUSE_ENABLE });
}

var appAction = new AppAction();
module.exports = appAction;