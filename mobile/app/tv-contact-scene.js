var TVMainObject = require('./tv-contact/tv-object');
var TVIndicator = require('./tv-indicator/tv-object');
var TVAudio     = require('./tv-audio/tv-object');

var customRayCaster = require('./custom-raycaster/custom-raycaster');

var TVScene = function(){
    THREE.Object3D.call(this);

    this.tvMainObject = new TVMainObject();
    this.add(this.tvMainObject);

    customRayCaster.setObject(this.tvMainObject.rayCaster)

    this.tvIndicator = new TVIndicator();
    this.tvIndicator.position.set(-75, 0, 0);
    //this.tvIndicator.scale.set(1/3, 0.0001, 1/3)
    customRayCaster.setObject(this.tvIndicator.rayCaster);
    this.add(this.tvIndicator);

    //this.position.set( 200, -77, 360);
    this.position.set( 75, 75 * 1, 400);
};

TVScene.prototype = Object.create(THREE.Object3D.prototype);
TVScene.prototype.constructor = TVScene.prototype;

TVScene.prototype.update = function(dt){
    this.tvMainObject.update(dt);
    this.tvIndicator.update(dt);
    //this.tvAudio.update(dt);
}


TVScene.prototype.invisible = function(){
    this.tvMainObject.visible = false;
    this.tvIndicator.visible = false;
    //this.tvAudio.visible = false;
};

TVScene.prototype.start = function(){
    this.tvMainObject.start();
    this.tvIndicator.start();
    //this.tvAudio.start();
}

module.exports = TVScene;