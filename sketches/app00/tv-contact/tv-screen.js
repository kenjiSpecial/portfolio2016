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

    var  canvas = document.createElement('canvas');
    canvas.width = 620;
    canvas.height = 540;
    this.ctx = canvas.getContext('2d');
    this.canvas = canvas;

    var transCanvas = document.createElement('canvas');
    transCanvas.width = 620;
    transCanvas.height = 540;
    this.transCtx = transCanvas.getContext('2d');
    this.transCanvas = transCanvas;

    this.tvPlane = new THREE.PlaneGeometry( 62, 54);

    this.canvasTexture = new THREE.Texture(canvas);
    this.canvasTexture.magFilter = this.canvasTexture.minFilter = THREE.LinearFilter;

    this.transCanvasTexture = new THREE.Texture(this.transCanvas);
    this.transCanvasTexture.magFilter = this.transCanvasTexture.minFilter = THREE.LinearFilter;


    this.uniforms = {
        uTime : {type :"f", value: 0 },
        uState : {type: "f", value: 0 },
        texture : { type: "t",  value: null },
        transformTexture : { type: "t",  value: null },
    };

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : glslify('./shaders/screen0/shader.frag')        ,
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.canvasRenderer = new CanvasRenderer();

    this.canvasRenderer.font = RobotFont;
    this.canvasRenderer.fontSize = 140;
    this.canvasRenderer.text = 'CONTACT';
    this.canvasRenderer.layout(620);
    this.canvasRenderer.align = 'left';
    this.canvasRenderer.letterSpacing = 0;
    this.canvasRenderer.lineHeight = 110;
    this.textBounds = this.canvasRenderer.getBounds();

    this.transCanvasRenderer = new CanvasRenderer();
    this.transCanvasRenderer.font = RobotFont;
    this.transCanvasRenderer.fontSize = 140;
    this.transCanvasRenderer.text = 'CONTACT';
    this.transCanvasRenderer.align = 'left';
    this.transCanvasRenderer.letterSpacing = 0;
    this.transCanvasRenderer.lineHeight = 110;
    this.textBounds = this.transCanvasRenderer.getBounds();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.fillStyle = '#8888ff';
    this.canvasRenderer.fill(this.ctx, 20, 330);
    this.ctx.restore();

    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

    this.transformTexture

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
        .to(this.tvMaterial.uniforms.uState, 0.5, {value: 1.0, delay: 0.7, onComplete: this.onTurnOnComplete });

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
    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this, 0.4, {rate: 1, ease: Power4.easeOut, onUpdate: this.onMouseOverTweenUpdate})
};

TVScreen.prototype.onMouseOut = function(){
    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this, 0.4, {rate: 0, ease: Power4.easeOut, onUpdate: this.onMouseOverTweenUpdate})
}

TVScreen.prototype.shutDown = function(){
    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 4, ease: Power4.easeOut});
};

TVScreen.prototype.backToWorks = function(){
    if(this.tw) this.tw.pause();
    this.tw = TweenMax.to(this.tvMaterial.uniforms.uState, 1.2, {value: 3, onComplete: this.onTurnOnComplete} );
};

TVScreen.prototype.onMouseOverTweenUpdate = function(){
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.globalAlpha = 1 - this.rate;
    this.ctx.fillStyle = '#8888ff';
    this.canvasRenderer.fill(this.ctx, 20 + this.canvas.width * this.rate, 330);
    this.ctx.restore();


    this.ctx.fillStyle = '#8888ff';
    this.ctx.fillRect(0, 0, this.canvas.width * this.rate, this.canvas.height);
    this.ctx.save();
    this.ctx.globalAlpha = this.rate * this.rate;
    this.ctx.fillStyle = '#ffffff';
    this.canvasRenderer.fill(this.ctx, 20 - this.canvas.width * (1-this.rate), 330);
    this.ctx.restore();

    this.canvasTexture.needsUpdate = true;
};

TVScreen.prototype.onTransitionHomeStart = function(){
    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.4, {value: 2, delay: 0.1 })
        .to(this.tvMaterial.uniforms.uState, 0.4, {value: 1, delay: 0.1, onComplete: this.onTurnOnComplete});

};

TVScreen.prototype.onTransitionStart = function(){
    this.transCanvasRenderer.text = appStore.curDirectory.toUpperCase();
    var bounds = this.transCanvasRenderer.getBounds();

    this.transCtx.fillStyle = '#ffffff';
    this.transCtx.fillRect(0, 0, this.transCanvas.width, this.transCanvas.height );
    this.transCtx.save();
    this.transCtx.fillStyle = constants[appStore.curDirectory].color;
    this.transCanvasRenderer.fill(this.transCtx, (this.transCanvas.width - bounds.width)/2, 330);
    this.transCtx.restore();

    this.transCanvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.transformTexture.value = this.transCanvasTexture;

    var tl = new TimelineMax();
    tl.to(this.tvMaterial.uniforms.uState, 0.4, {value: 2, delay: 0.1 })
        .to(this.tvMaterial.uniforms.uState, 0.4, {value: 3, delay: 0.5, onComplete: this.onTurnOnComplete});
}


module.exports = TVScreen;

