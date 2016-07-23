

var AppAction = function(){

};

THREE.EventDispatcher.prototype.apply( AppAction.prototype );

AppAction.prototype.MOUSE_OVER_OBJECT        = 'mouseOverObject';
AppAction.prototype.MOUSE_OUT_OBJECT         = 'mouseOutObject';
AppAction.prototype.GO_TO_HOME               = 'goToHome';
AppAction.prototype.GO_TO_WORKS              = 'goToWorks';
AppAction.prototype.CLICK_OBJECT             = 'clickObject';
AppAction.prototype.MOUSE_DISABLE            = 'mouseDisable';
AppAction.prototype.MOUSE_OVER_ABOUT_TYPE    = 'mouseOverAboutType';
AppAction.prototype.MOUSE_OUT_ABOUT_TYPE     = 'mouseOutAboutType';
AppAction.prototype.MOUSE_OVER_WORKS_TYPE    = 'mouseOverWorksType';
AppAction.prototype.MOUSE_OUT_WORKS_TYPE     = 'mouseOutWorksType';
AppAction.prototype.MOUSE_OUT_CONTACT_TYPE   = 'mouseOutContactType';
AppAction.prototype.MOUSE_OVER_CONTACT_TYPE  = 'mouseOverContactType';
AppAction.prototype.MOUSE_OVER_SKETCH_TYPE   = 'mouseOverSketchType';
AppAction.prototype.MOUSE_OUT_SKETCH_TYPE    = 'mouseOverSketchType';
AppAction.prototype.CLICK_WORKS              = "clickWorks";
AppAction.prototype.CLICK_MAIN               = "clickMain";
AppAction.prototype.CLICK                    = 'click'

AppAction.prototype.onMouseOverAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_ABOUT_TYPE})
};

AppAction.prototype.onMouseOutAboutType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_ABOUT_TYPE})
};

AppAction.prototype.onMouseOverWorksType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_WORKS_TYPE})
};

AppAction.prototype.onMouseOutWorksType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_WORKS_TYPE})
};

AppAction.prototype.onMouseOverContactType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_CONTACT_TYPE})
};

AppAction.prototype.onMouseOutContactType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_CONTACT_TYPE})
};

AppAction.prototype.onMouseOverSketchType = function(){
    this.dispatchEvent({type: this.MOUSE_OVER_CONTACT_TYPE})
};

AppAction.prototype.onMouseOutSketchType = function(){
    this.dispatchEvent({type: this.MOUSE_OUT_CONTACT_TYPE})
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

AppAction.prototype.clickWorks = function(worksModel){
    this.dispatchEvent({type: this.CLICK_WORKS, model: worksModel })
}

AppAction.prototype.goToHome = function(){
    this.dispatchEvent({ type: this.GO_TO_HOME });
};

AppAction.prototype.goToWorks = function(){
    this.dispatchEvent({ type: this.GO_TO_WORKS });
};

AppAction.prototype.onClickMain = function(){
    this.dispatchEvent({ type: this.CLICK_MAIN });
};

AppAction.prototype.onClick = function () {
    console.log('appaction click');
    this.dispatchEvent({type: this.CLICK});
};

var appAction = new AppAction();
module.exports = appAction;