var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');
var constants = require('../utils/constants');
var appStore = require('../stores/app-store');

var getShader = function(col, row){
    var shader = glslify('./shaders/works/shader.frag');
    return shader;
}

var TVScreen = function( row, col, model  ){
    //_.bindAll(this, 'onCompleteTw0', 'onBlink', 'onStartAnimation', 'onUpdate', 'onMouseOverTweenUpdate', 'onMouseOverComplete', 'onTransToUpdate', 'onTransToUpdate2', 'transEndStart');
    _.bindAll(this, 'onMouserOver', 'onMouserOut', 'interval');
    this.textDelay = 0.4;
    this.rate = 0;
    this.translAboutRate = 0;
    this.row = row || 0;
    this.col = col || 0;
    this.model = model;

    var  canvas = document.createElement('canvas');
    canvas.width = 620;
    canvas.height = 540;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tvPlane = new THREE.PlaneGeometry( 62, 54);


    this.canvasTexture = new THREE.Texture(canvas);
    this.canvasTexture.magFilter = this.canvasTexture.minFilter = THREE.LinearFilter;


    this.customInit();

    this.uniforms = {
        uTime    : {type :"f", value: 10 * Math.random() },
        distortion1 : { type : "f", value: 1. + 4. * Math.random() },
        distortion2 : { type : "f", value: 1. + 2. * Math.random() },
        speed       : { type : "f", value: 0.1 + 0.3 * Math.random() },
        uRandom     : { type : "f", value: Math.random() },
        uRandom1     : { type : "f", value: Math.random()  },
        uRandom2     : { type : "f", value: Math.random()  },
        uColR     : { type : "f", value: Math.random() + 1  },
        uColG     : { type : "f", value: Math.random() + 1 },
        uState      : {type: "f", value: 0 },
        texture     : {type: "t", value: null },
        texture1    : {type: "t", value: this.custom1Texture }
    };
    if(Math.random() < 0.5) this.uniforms.speed.value *= -1;

    this.fragmentShader = getShader(this.col, this.row);

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : this.fragmentShader,
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.tag = 'works'; //constants.types[this.row]; //textData.text.toLowerCase();

    //this.drawCanvas();

    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

    THREE.Mesh.call(this, this.tvPlane, this.tvMaterial);
    this.customDelay = 0.4 + 0.2;
    this.customDuration = 0.25;
    this.position.set( 0, 5, 38);

    appStore.addEventListener(appStore.MOUSE_OVER_WORKS_TYPE, this.onMouserOver);
    appStore.addEventListener(appStore.MOUSE_OUT_WORKS_TYPE, this.onMouserOut);
};

TVScreen.prototype = Object.create(THREE.Mesh.prototype);
TVScreen.prototype.constructor = TVScreen;

TVScreen.prototype.customInit = function(){
    //console.log(this.model.thumbnail);
    if(this.model.title == 'more'){
        this.canvasRenderer = new CanvasRenderer();
        this.canvasRenderer.font = RobotFont;
        this.canvasRenderer.fontSize = 140;
        this.canvasRenderer.text = 'MORE';
        this.canvasRenderer.layout(620);
        this.canvasRenderer.align = 'left';
        this.canvasRenderer.letterSpacing = 0;
        this.canvasRenderer.lineHeight = 110;
        this.textBounds = this.canvasRenderer.getBounds();

        var  canvas = document.createElement('canvas');
        canvas.width = 620;
        canvas.height = 540;
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = constants.white;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = constants.yellow;
        this.canvasRenderer.fill(ctx, (canvas.width - this.textBounds.width)/2, 330);
        ctx.restore();

        this.custom1Texture = new THREE.Texture(canvas);
        this.custom1Texture.magFilter = this.custom1Texture.minFilter = THREE.LinearFilter;
        this.custom1Texture.needsUpdate = true;
    }else{
        this.custom1Texture = window.app.assets.texture[this.model.thumbnail];
    }

};

TVScreen.prototype.update = function(dt){
    this.tvMaterial.uniforms.uTime.value += dt * (0.6 + 1.4 * Math.random());
};

TVScreen.prototype.drawCanvas = function(isWhite){
    this.ctx.fillStyle = isWhite? constants.white : constants.yellow;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.canvasTexture.needsUpdate = true;
};

TVScreen.prototype.startTransition = function(){
    this.drawCanvas();
    TweenMax.to(this.tvMaterial.uniforms.uState, 1., {value: 1, onComplete: function(){
        this.isTweenComplete = true;
        this.dispatchEvent({type: "mouseEnable"});
    }.bind(this) });

    setTimeout(this.interval, 300);
}

TVScreen.prototype.interval = function(){
    if(Math.random() < 0.1){
        this.uniforms.uRandom.value = Math.random();
        this.uniforms.uRandom1.value = Math.random();
        this.uniforms.uRandom2.value = Math.random();
        this.uniforms.uColR.value = Math.random() * 0.3 + 1;
        //this.uniforms.uColG.value = Math.random() + 1;

        setTimeout(function(){
            this.uniforms.uRandom.value = Math.random();
            this.uniforms.uRandom1.value = Math.random();
            this.uniforms.uRandom2.value = Math.random();
            this.uniforms.uColR.value = Math.random() * 0.3 + 1;
        }.bind(this), 150);
        if(Math.random() < 0.5){
            setTimeout(function(){
                this.uniforms.uRandom.value = Math.random();
                this.uniforms.uRandom1.value = Math.random();
                this.uniforms.uRandom2.value = Math.random();
                this.uniforms.uColR.value = Math.random() * 0.3 + 1;
            }.bind(this), 300);
        }
    }else{
        this.uniforms.uRandom.value = 0;
        this.uniforms.uRandom1.value =0;
        this.uniforms.uRandom2.value = 0;
    }

    setTimeout(this.interval, 400);
}

TVScreen.prototype.onMouserOver = function(){
    if(!this.isTweenComplete) return;
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 2, ease: Power2.easeOut });
}

TVScreen.prototype.onMouserOut = function(){
    if(!this.isTweenComplete ) return;
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.8, {value: 1, ease: Power2.easeOut });
}

TVScreen.prototype.backToHome = function(){
    this.drawCanvas(true);
    this.isTweenComplete = true;
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 0, ease: Power2.easeOut });
};


module.exports = TVScreen;

