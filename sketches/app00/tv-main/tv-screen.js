var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');

var TVScreen = function(){
    _.bindAll(this, 'onCompleteTw0', 'onBlink', 'onCompleteTw1');

    this.canvasWidth = 620;
    this.canvasHeight = 540;
    var  canvas = document.createElement('canvas');
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    this.ctx = canvas.getContext('2d');

    this.portfolioCanvas = document.createElement('canvas');
    this.portfolioCanvas.width = this.canvasWidth;
    this.portfolioCanvas.height = this.canvasHeight;
    this.portfolioCtx = this.portfolioCanvas.getContext('2d');

    this.tvPlane = new THREE.PlaneGeometry( 62, 54);


    this.canvasTexture = new THREE.Texture(canvas);
    this.canvasTexture.magFilter = this.canvasTexture.minFilter = THREE.LinearFilter;
    this.canvasTexture.needsUpdate = true;

    this.portfolioTexture = new THREE.Texture(this.portfolioCanvas);
    this.portfolioTexture.magFilter = this.portfolioTexture.minFilter = THREE.LinearFilter;
    this.portfolioTexture.needsUpdate = true;

    this.uniforms = {
        uTime : {type :"f", value: 0 },
        uState : {type: "f", value: 0 },
        uMouse : {type: "f", value: 0 },
        texture : { type: "t",  value: null },
        portfolioTexture :{ type: "t",  value: this.portfolioTexture }
    };

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : glslify('./shaders/screen0/shader.frag'),
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.canvasRenderer = new CanvasRenderer();
    this.portfolioRenderer = new CanvasRenderer();;

    this.canvasRenderer.font = RobotFont;
    this.canvasRenderer.fontSize = 160;
    this.canvasRenderer.text = 'KENJI SPECIAL TV';
    this.canvasRenderer.layout(600);
    this.canvasRenderer.align = 'left';
    this.canvasRenderer.letterSpacing = 0;
    this.canvasRenderer.lineHeight = 110;
    this.textBounds = this.canvasRenderer.getBounds();

    this.portfolioRenderer.font = RobotFont;
    this.portfolioRenderer.fontSize = 160;
    this.portfolioRenderer.text = 'KENJI SAITO FOLIO';
    this.portfolioRenderer.layout(620);
    this.portfolioRenderer.align = 'left';
    this.portfolioRenderer.letterSpacing = 0;
    this.portfolioRenderer.lineHeight = 110;
    this.portfolioTextBounds = this.portfolioRenderer.getBounds();


    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ctx.save();
    this.ctx.fillStyle = '#666666';
    this.canvasRenderer.fill(this.ctx, 15, 490);
    this.ctx.restore();

    this.portfolioCtx.fillStyle = '#ffffff';
    this.portfolioCtx.fillRect(0, 0, canvas.width, canvas.height);
    this.portfolioCtx.save();
    this.portfolioCtx.fillStyle = '#999999';
    this.portfolioRenderer.fill(this.portfolioCtx, 15, 490);
    this.portfolioCtx.restore();

    this.canvasTexture.needsUpdate = true;
    this.portfolioTexture.neeedsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

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
        .to(this.tvMaterial.uniforms.uState, 0.6, {value: 1.0, delay: 0.4, onComplete: this.onCompleteTw1 });

};

TVScreen.prototype.onCompleteTw0 = function(){
    //return;
    this.originalValue = 0.4;
    this.count = 0;
    setTimeout(this.onBlink, 60);
}

TVScreen.prototype.onCompleteTw1 = function(){
    this.dispatchEvent({type: "mouseEnable"});
};

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
    this.tvMaterial.uniforms.uTime.value = 0;
    if(this.tl)this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uMouse, 0.8, {value: 1})
};

TVScreen.prototype.onMouseOut = function(){
    if(this.tl)this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uMouse, 0.8, {value: 0})
    //this.tvMaterial.uniforms.uMouse.value = 0;
};


module.exports = TVScreen;

