

var AudioAction = function(){

};

THREE.EventDispatcher.prototype.apply( AudioAction.prototype );

AudioAction.prototype.TURN           = 'turn';
AudioAction.prototype.LOADED         = 'loaded';
AudioAction.prototype.CLICK          = 'click';
AudioAction.prototype.TRANS          = 'trans';
AudioAction.prototype.MOUSE_OVER     = 'mouseOver';
AudioAction.prototype.CHANGE_AUDIO   = "changeAudio";

AudioAction.prototype.turn = function(){
    this.dispatchEvent({ type: this.TURN });
};

AudioAction.prototype.loaded = function(){
    this.dispatchEvent({ type: this.LOADED });
};

AudioAction.prototype.click = function(){
    this.dispatchEvent({ type: this.CLICK });
};


AudioAction.prototype.trans = function(){
    this.dispatchEvent({ type: this.TRANS });
};

AudioAction.prototype.mouseOver = function(){
    this.dispatchEvent({ type: this.MOUSE_OVER });
};

AudioAction.prototype.turnOnAudio = function(){
    this.dispatchEvent({ type: this.TURN_ON_AUDIO });
};

AudioAction.prototype.turnOffAudio = function(){
    this.dispatchEvent({ type: this.TURN_OFF_AUDIO });
};

AudioAction.prototype.changeAudio = function(){
    this.dispatchEvent({ type: this.CHANGE_AUDIO });
};

var audioAction = new AudioAction();
module.exports = audioAction;