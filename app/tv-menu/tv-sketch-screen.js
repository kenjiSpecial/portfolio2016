var glslify = require('glslify');
var CanvasRenderer = require('fontpath-canvas');
var RobotFont = require('../utils/fonts/robot-font');
var _ = require('underscore');
var constants = require('../utils/constants');
var appStore = require('../stores/app-store');

var getShader = function(col, row){
    return glslify('./shaders/sketch/shader.frag');
}

var TVScreen = function( row, col, sketchModel  ){
    //_.bindAll(this, 'onCompleteTw0', 'onBlink', 'onStartAnimation', 'onUpdate', 'onMouseOverTweenUpdate', 'onMouseOverComplete', 'onTransToUpdate', 'onTransToUpdate2', 'transEndStart');
    _.bindAll(this, 'onMouserOver', 'onMouserOut', 'interval');
    this.textDelay = 0.4;
    this.rate = 0;
    this.translAboutRate = 0;
    this.row = row || 0;
    this.col = col || 0;
    this.sketchModel = sketchModel;

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
        distortion1 : { type : "f", value: 3. + 4. * Math.random() },
        distortion2 : { type : "f", value: 3. + 4. * Math.random() },
        speed       : { type : "f", value: 0.1 + 0.3 * Math.random() },
        uRandom     : { type : "f", value: Math.random() },
        uRandom1     : { type : "f", value: Math.random()  },
        uRandom2     : { type : "f", value: Math.random()  },
        uColG       : { type : "f", value: Math.random() + 1 },
        uState      : {type: "f", value: 0 },
        texture     : {type: "t", value: null },
        texture1    : {type: "t", value: this.custom1Texture },
        workTexture : {type: "t", value: null },
        workType    : {type: "f", value: this.idNumber }
    };

    this.fragmentShader = getShader(this.col, this.row);

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./shaders/common.vert'),
        fragmentShader : this.fragmentShader,
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.tag = 'contact'; //constants.types[this.row]; //textData.text.toLowerCase();

    //this.drawCanvas();

    this.canvasTexture.needsUpdate = true;
    this.tvMaterial.uniforms.texture.value = this.canvasTexture;

    THREE.Mesh.call(this, this.tvPlane, this.tvMaterial);
    this.customDelay = 0.4 + 0.2;
    this.customDuration = 0.25;
    this.position.set( 0, 5, 38);

    this.randomSpeed = 0.8 + 1.2 * Math.random();

    appStore.addEventListener(appStore.MOUSE_OVER_CONTACT_TYPE, this.onMouserOver);
    appStore.addEventListener(appStore.MOUSE_OUT_CONTACT_TYPE,  this.onMouserOut);
};

TVScreen.prototype = Object.create(THREE.Mesh.prototype);
TVScreen.prototype.constructor = TVScreen;

TVScreen.prototype.customInit = function(){
    var randomNumber = 3 * this.row + this.col; //parseInt(constants.aboutPage.type.length * Math.random());
    if(this.sketchModel.type) this.custom1Texture = window.app.assets.texture[this.sketchModel.type];
    else              {
        var  canvas = document.createElement('canvas');
        canvas.width = 620;
        canvas.height = 540;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        var canvasTexture = new THREE.Texture(canvas);
        canvasTexture.magFilter = canvasTexture.minFilter = THREE.LinearFilter;
        canvas.needsUpdate = true;
        this.custom1Texture = canvasTexture
    }
};

TVScreen.prototype.update = function(dt){
    this.tvMaterial.uniforms.uTime.value += dt;
};

TVScreen.prototype.drawCanvas = function(isWhite){
    this.ctx.fillStyle = isWhite? constants.white : constants.sketch.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.canvasTexture.needsUpdate = true;
};

TVScreen.prototype.startTransition = function(){
    this.drawCanvas(false);
    if(this.tl) this.tl.pause()
    this.tvMaterial.uniforms.uState.value = 0;
    TweenMax.to(this.tvMaterial.uniforms.uState, 1., {value: 1, onComplete: function(){
        this.isTweenComplete = true;
        this.dispatchEvent({type: "mouseEnable"});
    }.bind(this) });

    this.timerId = setTimeout(this.interval, 200 + 200 * Math.random());
}

TVScreen.prototype.onMouserOver = function(){
    //console.log('onMouserOver ');
    if(!this.isTweenComplete) return;
    //console.log('mouseover');
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 2, ease: Power2.easeOut });
}

TVScreen.prototype.interval = function(){
    if(Math.random() < 0.1){
        this.uniforms.uRandom.value = Math.random();
        this.uniforms.uRandom1.value = Math.random();
        this.uniforms.uRandom2.value = Math.random();
        this.uniforms.uColG.value = Math.random() * 0.3 + 1;
        //this.uniforms.uColG.value = Math.random() + 1;

        setTimeout(function(){
            this.uniforms.uRandom.value = Math.random();
            this.uniforms.uRandom1.value = Math.random();
            this.uniforms.uRandom2.value = Math.random();
            this.uniforms.uColG.value = Math.random() * 0.3 + 1;
        }.bind(this), 150);
        if(Math.random() < 0.5){
            setTimeout(function(){
                this.uniforms.uRandom.value = Math.random();
                this.uniforms.uRandom1.value = Math.random();
                this.uniforms.uRandom2.value = Math.random();
                this.uniforms.uColG.value = Math.random() * 0.3 + 1;
            }.bind(this), 300);
        }
    }else{
        this.uniforms.uRandom.value = 0;
        this.uniforms.uRandom1.value =0;
        this.uniforms.uRandom2.value = 0;
    }

    this.timerId = setTimeout(this.interval, 200 + 300 * Math.random());
}


TVScreen.prototype.onMouserOut = function(){
    if(!this.isTweenComplete ) return;
    //console.log('mouseout');
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 1, ease: Power2.easeOut });
}

TVScreen.prototype.backToHome = function(){
    this.drawCanvas(true);
    clearTimeout(this.timerId);
    this.isTweenComplete = true;
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.4, {value: 0, ease: Power2.easeOut });
};


module.exports = TVScreen;

