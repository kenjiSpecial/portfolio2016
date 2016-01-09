var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');
var constants = require('../utils/constants');
var appStore = require('../stores/app-store');
var appAction = require('../actions/app-action');

var TVScreen = function(){
    _.bindAll(this, 'onCompleteTw0', 'onBlink', 'onMouseOverTweenUpdate', 'onTurnOnComplete');

    this.rate = 0;

    this.tvPlane = new THREE.PlaneGeometry( 62, 54);


    this.uniforms = {
        uTime : {type :"f", value: 0 },
        uState : {type: "f", value: 0 },
        texture : { type: "t",  value: window.app.assets.texture.leftArrow }
    };

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : glslify('./shaders/screen0/shader.frag'),
        side           : THREE.DoubleSide,
        transparent    : true
    });


    THREE.Mesh.call(this, this.tvPlane, this.tvMaterial);

    this.position.set( 0, 5, 38);

};

TVScreen.prototype = Object.create(THREE.Mesh.prototype);
TVScreen.prototype.constructor = TVScreen;

TVScreen.prototype.update = function(dt){
    this.tvMaterial.uniforms.uTime.value += dt;
};

TVScreen.prototype.turnOn = function(){
    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.2, {value: 0.1, ease: Quint.easeIn })
        .to(this.tvMaterial.uniforms.uState, 0.1, {value: 0.2})
        .to(this.tvMaterial.uniforms.uState, 0.3, {value: 0.4, onComplete: this.onCompleteTw0 })
        .to(this.tvMaterial.uniforms.uState, 0.5, {value: 1.0, delay: 1.2, onComplete: this.onTurnOnComplete });

};

TVScreen.prototype.turnOff = function(){
    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.4, {value: 0, ease: Quint.easeOut });
        //.to(this.tvMaterial.uniforms.uState, 0.1, {value: 0.2})
        //.to(this.tvMaterial.uniforms.uState, 0.3, {value: 0.4, onComplete: this.onCompleteTw0 })
        //.to(this.tvMaterial.uniforms.uState, 0.5, {value: 1.0, delay: 1.5, onComplete: this.onTurnOnComplete });

};

TVScreen.prototype.onTurnOnComplete = function(){
    this.dispatchEvent({type: "mouseEnable"});
}

TVScreen.prototype.onCompleteTw0 = function(){
    return;
    this.originalValue = 0.4;
    this.count = 0;
    setTimeout(this.onBlink, 60);
}

TVScreen.prototype.onBlink = function(){
    if(this.count % 2 == 0){
        this.tvMaterial.uniforms.uState.value = 10;
    }else{
        this.tvMaterial.uniforms.uState.value = this.originalValue;
    }

    this.count++;
    if(this.count < 4) setTimeout(this.onBlink, 80);
}

TVScreen.prototype.onMouseOver = function(){
    if(this.isClick) return;

    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 2, ease: Power4.easeOut})
};

TVScreen.prototype.onMouseOut = function(){
    if(this.isClick) return;

    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 1, ease: Power4.easeOut})
}

TVScreen.prototype.onMouseOverTweenUpdate = function(){

};

TVScreen.prototype.onClick = function(){
    var tl = new TimelineMax();
    this.isClick = true;
    tl.to(this.tvMaterial.uniforms.uState, 0.1, {value: 3.0 })
        .to(this.tvMaterial.uniforms.uState, 0.1, {value: 2.0, onComplete: function(){this.isClick = false; }.bind(this) });

};

module.exports = TVScreen;

