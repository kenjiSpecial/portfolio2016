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
    _.bindAll(this, 'onWorkTweenComplete');

    this.textDelay = 0.4;
    this.rate = 0;
    this.translAboutRate = 0;
    this.row = row || 0;
    this.col = col || 0;
    this.idNumber = this.row * 3 + this.col;
    this.model = model;

    this.canvasRenderer = new CanvasRenderer();
    this.canvasRenderer.font = RobotFont;

    var  canvas = document.createElement('canvas');
    canvas.width = 310;
    canvas.height = 270;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tvPlane = new THREE.PlaneGeometry( 62, 54);

    this.textCanvas = document.createElement('canvas');
    this.textCanvas.width = 310;
    this.textCanvas.height = 270;
    this.textCtx = this.textCanvas.getContext('2d');

    this.canvasTexture = new THREE.Texture(canvas);
    this.canvasTexture.magFilter = this.canvasTexture.minFilter = THREE.LinearFilter;

    this.canvasTextTexture = new THREE.Texture(this.textCanvas);
    this.canvasTextTexture.magFilter = this.canvasTextTexture.minFilter = THREE.LinearFilter;


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
        texture1    : {type: "t", value: this.custom1Texture },
        workTexture : {type: "t", value: null },
        workType    : {type: "f", value: this.idNumber }
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

        this.canvasRenderer.fontSize = 140/2;
        this.canvasRenderer.text = 'MORE';
        this.canvasRenderer.layout(620/2);
        this.canvasRenderer.align = 'left';
        this.canvasRenderer.letterSpacing = 0;
        this.canvasRenderer.lineHeight = 110/2;
        this.textBounds = this.canvasRenderer.getBounds();

        var  canvas = document.createElement('canvas');
        canvas.width = 310;
        canvas.height = 270;
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = constants.white;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = constants.yellow;
        this.canvasRenderer.fill(ctx, (canvas.width - this.textBounds.width)/2, 330/2);
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
    this.isWorks = true;

    this.drawCanvas();
    TweenMax.to(this.tvMaterial.uniforms.uState, 1., {value: 1, onComplete: function(){
        this.isTweenComplete = true;
        this.dispatchEvent({type: "mouseEnable"});
    }.bind(this) });

    this.timerId = setTimeout(this.interval, 200 + 200 * Math.random());
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

    this.timerId = setTimeout(this.interval, 200 + 300 * Math.random());
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

TVScreen.prototype.transToWork = function(workModel){

    this.isWorks = false;
    this.workData = workModel.model.worksData;
    if(this.idNumber < 6){
        this.uniforms.workTexture.value = window.app.assets.texture[this.workData.main];
    }else{
        var worksData = workModel.model.worksData;

        if(this.idNumber == 6){
            this.textCtx.fillStyle = "#8c98a5";
            this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);

            var top = 30;

            this.canvasRenderer.fontSize = 50;
            this.canvasRenderer.text = worksData.title;
            this.canvasRenderer.layout(280);
            this.canvasRenderer.align = 'left';
            this.canvasRenderer.letterSpacing = 0;
            this.canvasRenderer.lineHeight = 40;

            bounds = this.canvasRenderer.getBounds();
            top += bounds.height


            this.textCtx.save();
            this.textCtx.fillStyle = "#d1d6db";
            this.canvasRenderer.fill( this.textCtx, 20, top);

            /**
            this.textCtx.fillStyle = "#ffff00";
            this.textCtx.fillRect(0, top, bounds.width, bounds.height)
             */
            //this.canvasRenderer.fill( this.textCtx, 20, top);

            this.canvasRenderer.fontSize = 35;
            this.canvasRenderer.text = worksData.year;

            this.textCtx.fillStyle = "#d1d6db";
            var getBound = this.canvasRenderer.getBounds();
            top += getBound.height + 25;

            this.canvasRenderer.fill( this.textCtx, 20, top);

            this.textCtx.restore();
        }else if(this.idNumber == 7){
            this.textCtx.fillStyle = "#8c98a5";
            this.textCtx.fillRect(0, 0, this.textCanvas.width, this.textCanvas.height);

            var bounds;
            var top = 30;

            this.canvasRenderer.fontSize = 25;
            this.canvasRenderer.layout(280);
            this.canvasRenderer.align = 'left';
            this.canvasRenderer.letterSpacing = 0;


            this.textCtx.save();
            this.textCtx.fillStyle = "#d1d6db";

            this.canvasRenderer.text = "ROLE";
            this.canvasRenderer.fontSize = 20;
            this.canvasRenderer.lineHeight = 20;

            bounds = this.canvasRenderer.getBounds();
            top += bounds.height;

            this.canvasRenderer.fill( this.textCtx, 20, top);

            this.canvasRenderer.text = worksData.role;
            this.canvasRenderer.fontSize = 35;
            this.canvasRenderer.lineHeight = 30;

            bounds = this.canvasRenderer.getBounds();
            top += bounds.height + 15;

            this.canvasRenderer.fill( this.textCtx, 20, top);


            this.canvasRenderer.text = "TECHNLOGY";
            this.canvasRenderer.fontSize = 20;
            this.canvasRenderer.lineHeight = 20;

            bounds = this.canvasRenderer.getBounds();
            top += bounds.height + 30;

            this.canvasRenderer.fill( this.textCtx, 20, top);

            this.canvasRenderer.text = worksData.technology;
            this.canvasRenderer.fontSize = 35;
            this.canvasRenderer.lineHeight = 35;
            this.canvasRenderer.layout(280);

            bounds = this.canvasRenderer.getBounds();
            top += bounds.height + 15;

            this.canvasRenderer.fill( this.textCtx, 20, top);

            this.textCtx.restore();
        }else if(this.idNumber == 8){
            if(worksData.visit){
                this.canvasRenderer.fontSize = 70;
                this.canvasRenderer.text = worksData.visitType; //'MORE';
                this.canvasRenderer.layout(310);
                this.canvasRenderer.align = 'left';
                this.canvasRenderer.letterSpacing = 0;
                this.canvasRenderer.lineHeight = 55;
                this.textBounds = this.canvasRenderer.getBounds();

                this.textCtx.fillStyle = "#d1d6db";
                this.textCtx.fillRect( 0, 0, this.textCanvas.width, this.textCanvas.height );

                var yPos = (270 - this.textBounds.height)/2 + this.textBounds.height;
                var xPos = (this.textCanvas.width - this.textBounds.width)/2;
                this.textCtx.fillStyle = "#8c98a5";
                this.canvasRenderer.fill( this.textCtx, xPos, yPos);

            }else{
                this.textCtx.fillStyle = "#000000";
                this.textCtx.fillRect( 0, 0, this.textCanvas.width, this.textCanvas.height );
            }
        }


        this.canvasTextTexture.needsUpdate = true;
        this.uniforms.workTexture.value = this.canvasTextTexture;


    }

    //this.uniforms.workTexture.value =

    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 3, delay: Math.random() * 0.6, onComplete: this.onWorkTweenComplete });
};

TVScreen.prototype.onWorkMouseOut = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 3, ease: Quint.easeOut });
};

TVScreen.prototype.onWorkMouseOver = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 4, ease: Quint.easeOut });
}

TVScreen.prototype.onWorkTweenComplete = function(){
    if(this.idNumber == 8 && this.workData.visit){
        this.dispatchEvent({type: "mouseEnable"});
    }else{

    }
}

TVScreen.prototype.backToWorks = function(){
    if(this.tl) this.tl.pause();
    this.tl = TweenMax.to(this.tvMaterial.uniforms.uState, 0.6, {value: 1, delay: Math.random() * 0.6   , onComplete: function(){
        this.dispatchEvent({type: "mouseEnable"});
    }.bind(this) });

    this.timerId = setTimeout(this.interval, 200 + 200 * Math.random());
};

TVScreen.prototype.stopTimer = function(){
    clearTimeout(this.timerId);
}

TVScreen.prototype.setText = function(){

};

TVScreen.prototype.turnOff = function(){

};

module.exports = TVScreen;

