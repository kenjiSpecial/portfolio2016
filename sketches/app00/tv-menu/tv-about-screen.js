var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');
var constants = require('../utils/constants');
var appStore = require('../stores/app-store');

var getShader = function(col, row){
    if( col == 1 && row == 1 ){
        return glslify('./shaders/about/shader.frag');
    }else{
        var number = 3 * row + col;
        var shader;
        if(number == 2 || number == 8 ){
            shader = glslify('./shaders/about/custom3-shader.frag');
        }else if(number == 0 || number == 6){
            shader = glslify('./shaders/about/custom1-shader.frag');
        }else if(number == 5 || number == 3){
            shader = glslify('./shaders/about/custom2-shader.frag');
        }else{
            shader = glslify('./shaders/about/custom4-shader.frag');
        }
        return shader;
    }
}

var TVScreen = function( row, col  ){
    //_.bindAll(this, 'onCompleteTw0', 'onBlink', 'onStartAnimation', 'onUpdate', 'onMouseOverTweenUpdate', 'onMouseOverComplete', 'onTransToUpdate', 'onTransToUpdate2', 'transEndStart');
    _.bindAll(this, 'onMouserOver', 'onMouserOut');
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

    this.customInit();

    this.uniforms = {
        uTime    : {type :"f", value: 0 },
        uState   : {type: "f", value: 0 },
        texture  : {type: "t", value: null },
        texture1 : {type: "t", value: this.custom1Texture }
    };

    this.fragmentShader = getShader(this.col, this.row);

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : this.fragmentShader,
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.tag = 'about'; //constants.types[this.row]; //textData.text.toLowerCase();

    this.drawCanvas();

    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

    THREE.Mesh.call(this, this.tvPlane, this.tvMaterial);
    this.customDelay = 0.4 + 0.2;
    this.customDuration = 0.25;
    this.position.set( 0, 5, 38);

    this.randomSpeed = 0.8 + 1.2 * Math.random();

    appStore.addEventListener(appStore.MOUSE_OVER_ABOUT_TYPE, this.onMouserOver);
    appStore.addEventListener(appStore.MOUSE_OUT_ABOUT_TYPE, this.onMouserOut);
};

TVScreen.prototype = Object.create(THREE.Mesh.prototype);
TVScreen.prototype.constructor = TVScreen;

TVScreen.prototype.customInit = function(){
    //if(Math.random() ) 0.5
    var randomNumber = 3 * this.row + this.col; //parseInt(constants.aboutPage.type.length * Math.random());
    this.custom1Texture = window.app.assets.texture[constants.aboutPage.type[randomNumber]];
};

TVScreen.prototype.update = function(dt){
    this.tvMaterial.uniforms.uTime.value += dt;
};

TVScreen.prototype.drawCanvas = function(){
    this.ctx.fillStyle = constants.red;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
};

TVScreen.prototype.startTransition = function(){
    TweenMax.to(this.tvMaterial.uniforms.uState, 1., {value: 1, onComplete: function(){
        this.isTweenComplete = true;
    }.bind(this) });
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


module.exports = TVScreen;

