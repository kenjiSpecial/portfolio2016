var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');
var constants = require('../utils/constants');
var appStore = require('../stores/app-store');

var TVScreen = function(fragmentShader, textData, row, col){
    _.bindAll( this, 'onCompleteTw0', 'onBlink', 'onStartAnimation', 'onUpdate', 'onMouseOverTweenUpdate', 'onMouseOverComplete', 'onTransToUpdate', 'onTransToUpdate2', 'transEndStart');
    _.bindAll( this, 'onCompleteTw1' );

    this.textDelay = 0.4;
    this.rate = 0;
    this.translAboutRate = 0;
    this.row = row || 0;
    this.col = col || 0;

    var  canvas = document.createElement('canvas');
    canvas.width = 620;
    canvas.height = 540;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tvPlane = new THREE.PlaneGeometry( 62, 54);


    this.canvasTexture = new THREE.Texture(canvas);
    this.canvasTexture.magFilter = this.canvasTexture.minFilter = THREE.LinearFilter;
    this.canvasTexture.needsUpdate = true;

    this.uniforms = {
        uTime : {type :"f", value: 0 },
        uState : {type: "f", value: 0 },
        texture : { type: "t",  value: null },
    };

    if(fragmentShader) this.fragmentShader = fragmentShader;
    else               this.fragmentShader = glslify('./shaders/screen/shader.frag');

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : this.fragmentShader,
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.tag = constants.types[this.row]; //textData.text.toLowerCase();
    var text = this.tag.toUpperCase();

    textData = textData || {};
    this.canvasRenderer = new CanvasRenderer();
    this.canvasRenderer.font = RobotFont;
    this.canvasRenderer.fontSize = textData.fontSize || 500;
    this.canvasRenderer.text = text || 'test';
    this.canvasRenderer.align = 'left';
    this.canvasRenderer.letterSpacing = textData.letterSpacing || 5;
    this.canvasRenderer.lineHeight = textData.lineHeight || 120;
    this.textBounds = this.canvasRenderer.getBounds();

    this.transRenderer = new CanvasRenderer();
    this.transRenderer.font = RobotFont;
    this.transRenderer.fontSize = textData.fontSize || 500;
    this.transRenderer.text = '';
    this.transRenderer.align = 'left';
    this.transRenderer.letterSpacing = textData.letterSpacing || 5;
    this.transRenderer.lineHeight = textData.lineHeight || 120;

    this.drawCanvas();

    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

    THREE.Mesh.call(this, this.tvPlane, this.tvMaterial);
    this.customDelay =  0.1;
    this.customDuration = 0.25;
    this.position.set( 0, 5, 38);
};

TVScreen.prototype = Object.create(THREE.Mesh.prototype);
TVScreen.prototype.constructor = TVScreen;

TVScreen.prototype.resetHome = function(){
    this.rate = 0;
    this.drawCanvas();
    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.uState.value = 0.4;
    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.4, {value: 1.0, onUpdate: this.onUpdate, delay: this.col * 0.1, onComplete: this.onCompleteTw1 });

};

TVScreen.prototype.update = function(dt){
    this.tvMaterial.uniforms.uTime.value += dt;
};

TVScreen.prototype.drawCanvas = function(){
    this.ctx.fillStyle = constants.white;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();

    this.ctx.save();
    this.ctx.fillStyle = constants[this.tag].color;
    this.canvasRenderer.fill( this.ctx, constants[this.tag].position[this.col].left, 450)
    this.ctx.restore();
};

TVScreen.prototype.turnOn = function(){
    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.2, {value: 0.1, ease: Quint.easeIn })
        .to(this.tvMaterial.uniforms.uState, 0.1, {value: 0.2})
        .to(this.tvMaterial.uniforms.uState, 0.3, {value: 0.4, onComplete: this.onCompleteTw0 })
        .to(this.tvMaterial.uniforms.uState, this.customDuration, {value: 1.0, onUpdate: this.onUpdate, delay: this.customDelay, onComplete: this.onCompleteTw1 });
};

TVScreen.prototype.onUpdate = function(){};

TVScreen.prototype.onCompleteTw0 = function(){
    return;
    this.originalValue = 0.4;
    this.count = 0;

    setTimeout(this.onStartAnimation, 300);

    setTimeout(this.onBlink, 60);
}

TVScreen.prototype.onCompleteTw1 = function(){
    this.dispatchEvent({type: "mouseEnable"});
};

TVScreen.prototype.onStartAnimation = function(){

};

TVScreen.prototype.onBlink = function(){
    if(this.count % 2 == 0){
        this.tvMaterial.uniforms.uState.value = 10;
    }else{
        this.tvMaterial.uniforms.uState.value = this.originalValue;
    }

    this.count++;
    if(this.count < 4) setTimeout(this.onBlink, 60);
}

TVScreen.prototype.onMouseOverType = function(){
    if(this.tw) this.tw.pause();
    //this.tw = TweenMax.to(this, 0.6, {rate: 1, ease: Power4.easeOut, onUpdate: this.onMouseOverTweenUpdate, onComplete: this.onMouseOverComplete})
};

TVScreen.prototype.onMouseOutType = function(){
    if(this.tw) this.tw.pause();
    //this.tw = TweenMax.to(this, 0.6, {rate: 0, ease: Power4.easeOut, onUpdate: this.onMouseOverTweenUpdate, onComplete: this.onMouseOverComplete})
};

TVScreen.prototype.onMouseOverTweenUpdate = function(){
    /**
    this.ctx.fillStyle =  constants.white;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.fillStyle =  constants[this.tag].color; //'#ff6666';
    this.ctx.globalAlpha = 1-this.rate;
    this.canvasRenderer.fill(this.ctx, this.canvas.width * this.rate + constants[this.tag].position[this.col].left, 450);
    this.ctx.restore();

    // -----------------------------

    this.ctx.fillStyle =  constants[this.tag].color;
    this.ctx.fillRect( -this.canvas.width * this.col, 0, this.canvas.width * 3 * this.rate, this.canvas.height);
    this.ctx.save();
    this.ctx.globalAlpha = this.rate;
    this.ctx.fillStyle =  constants.white;
    this.canvasRenderer.fill(this.ctx, -this.canvas.width * (1-this.rate) + constants[this.tag].position[this.col].left, 450);
    this.ctx.restore();
    this.canvasTexture.needsUpdate = true; */
};

TVScreen.prototype.onMouseOverComplete = function(){

}

TVScreen.prototype.transToNextStage = function(){
    this.transRate = 0;
    this.selectedTag = appStore.selectedObject.tag;
    this.transRenderer.letterSpacing = constants[appStore.curDirectory].letterSpacing;
    this.transRenderer.text =  this.selectedTag.toUpperCase();

    if(this.selectedTag == this.tag ){
        //
    }else{
        if(this.tw) this.tw.pause();
        //this.tw = TweenMax.to(this, 0.4, {transRate: 1, ease: Power4.easeOut, onUpdate: this.onTransToUpdate, delay: 0.1 * Math.abs(this.row - appStore.selectedObject.row) })
    }

    //setTimeout(this.transEndStart, 750);

}

TVScreen.prototype.onTransToUpdate = function(){
    /**
    this.ctx.fillStyle = constants.white;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.globalAlpha = 1 - this.transRate;
    this.ctx.fillStyle = constants[constants.types[this.row]].color;
    this.canvasRenderer.fill(this.ctx, this.canvas.width * this.transRate + constants[constants.types[this.row]].position[this.col].left, 450);
    this.ctx.restore();

    // -----------------------------
    this.ctx.save();
    this.ctx.globalAlpha = this.transRate;
    this.ctx.fillStyle =  constants[this.selectedTag].color;
    this.ctx.fillRect( -this.canvas.width * this.col, 0, this.canvas.width * 4 * this.transRate, this.canvas.height);
    this.ctx.restore();
    this.ctx.save();
    this.ctx.globalAlpha = this.transRate;
    this.ctx.fillStyle = constants.white;
    this.transRenderer.fill(this.ctx, -this.canvas.width/2 * (1-this.transRate) +constants[this.selectedTag].position[this.col].left, 450);
    this.ctx.restore();
    this.canvasTexture.needsUpdate = true; */
};

TVScreen.prototype.transEndStart = function(){
    this.transRate = 0;
    TweenMax.to(this, 0.4, {transRate: 1, ease: Power4.easeInOut, onUpdate: this.onTransToUpdate2 });
}

TVScreen.prototype.onTransToUpdate2 = function(){
    /**
    this.ctx.fillStyle = constants[this.selectedTag].color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.globalAlpha = 1 - this.transRate;
    this.ctx.fillStyle = constants.white
    this.transRenderer.fill(this.ctx, this.canvas.width * this.transRate + constants[this.selectedTag].position[this.col].left, 450);
    this.ctx.restore();
    */

    //this.canvasTexture.needsUpdate = true;
}


module.exports = TVScreen;

