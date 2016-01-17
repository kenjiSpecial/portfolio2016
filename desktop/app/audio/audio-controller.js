var _ = require('underscore');

var buzz = require('node-buzz');
var NoiseAudio = require('./noise');
var appStore = require('../stores/app-store');
var audioAction = require('../actions/audio-action');

var AudioController = function(){
    _.bindAll(this, 'turn', 'loaded', 'click', 'trans', 'mouseOver', 'onChangeAudio');
    /**
    var audioContext = new AudioContext();
    var bufferSize = 2 * audioContext.sampleRate,
        noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate),
        output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 0.05;
    }

    var gainNode = audioContext.createGain();

    this.audioCtx = audioContext;

    var whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.start(0);

    whiteNoise.connect(gainNode)
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0;
    this.bgNode= gainNode; */

    //this.turnOnSound = new buzz.sound("/assets/sounds/turn.mp3");
    //this.turnOnSound.setVolume( 40 );
    this.clickSound  = new buzz.sound("/assets/sounds/click.mp3");
    this.clickSound.setVolume( 40 );
    this.mouseOverSound  = new buzz.sound("/assets/sounds/over.mp3");
    this.mouseOverSound.setVolume( 40 );
    //this.transSound  = new buzz.sound("/assets/sounds/trans5.mp3");
    //this.transSound.setVolume( 70 );

    audioAction.addEventListener(audioAction.TURN, this.turn);
    //audioAction.addEventListener(audioAction.LOADED, this.loaded);
    audioAction.addEventListener(audioAction.CLICK, this.click);
    audioAction.addEventListener(audioAction.TRANS, this.trans);
    audioAction.addEventListener(audioAction.MOUSE_OVER, this.mouseOver);

    appStore.addEventListener(appStore.AUDIO_CHANGED, this.onChangeAudio);
};
AudioController.prototype.loaded = function(){
    if(!appStore.isAudio) return;
    //this.audioTw = TweenLite.to(this.bgNode.gain, 1, {value: 0.6, delay: 0.4})
}
AudioController.prototype.turn = function(){
    if(!appStore.isAudio) return;

    setTimeout(function(){
        this.turnOnSound.stop()
        this.turnOnSound.play();
    }.bind(this), 50)
}

AudioController.prototype.click = function(){
    if(!appStore.isAudio) return;
    this.clickSound.stop()
    this.clickSound.play();
}

AudioController.prototype.trans = function(){
    /**
    if(!appStore.isAudio) return;
    this.transSound.stop()
    this.transSound.play();
     */
}

AudioController.prototype.mouseOver = function(){
    if(!appStore.isAudio) return;
    this.mouseOverSound.stop();
    this.mouseOverSound.play();
}

AudioController.prototype.onChangeAudio = function(){
    if(this.audioTw) this.audioTw.pause();
    /**
    if(appStore.isAudio){
        this.audioTw = TweenLite.to(this.bgNode.gain, 1, {value: 0.6})
    }else{
        this.audioTw = TweenLite.to(this.bgNode.gain, 1, {value: 0.})
    } */
}


var audioController = new AudioController();
module.exports = audioController;