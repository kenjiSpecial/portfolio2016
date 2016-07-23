var TVMainObject = require('./tv-contact/tv-object');
var TVIndicator = require('./tv-indicator/tv-object');
var TVAudio     = require('./tv-audio/tv-object');

var customRayCaster = require('./custom-raycaster/custom-raycaster');

var TVScene = function(){
    THREE.Object3D.call(this);

    this.tvMainObject = new TVMainObject();
    this.add(this.tvMainObject);

    customRayCaster.setObject(this.tvMainObject.rayCaster)


    this.tvIndicator = new TVIndicator()
    this.tvIndicator.position.set(-76 * (0 + 1/3) + 6, 77 * (1 - 1/3), 76 * 1/3 - 8 );
    this.tvIndicator.scale.set(1/3, 0.0001, 1/3)
    customRayCaster.setObject(this.tvIndicator.rayCaster);
    this.add(this.tvIndicator);

    // this.tvAudio = new TVAudio()
    // this.tvAudio.position.set(-76 * (0 + 1/3) + 6, 77 * (1 - 1/3), 76 * 1/3 - 8 );
    // this.tvAudio.scale.set(1/3, 0.0001, 1/3)
    // customRayCaster.setObject(this.tvAudio.rayCaster);
    // this.add(this.tvAudio);

    // this.rotateOnAxis ( new THREE.Vector3(0, 1, 0), -Math.PI/6);
    // this.position.set( -200, -77, -360);
    this.scale.set(window.app.scale, window.app.scale, window.app.scale);

    this.position.set( 80 * window.app.scale, -77 * window.app.scale, -380 * window.app.scale);
};

TVScene.prototype = Object.create(THREE.Object3D.prototype);
TVScene.prototype.constructor = TVScene.prototype;

TVScene.prototype.update = function(dt){
    this.tvMainObject.update(dt);
    this.tvIndicator.update(dt);
    // this.tvAudio.update(dt);
}


TVScene.prototype.invisible = function(){
    this.tvMainObject.visible = false;
    this.tvIndicator.visible = false;
    // this.tvAudio.visible = false;
};

TVScene.prototype.start = function(){
    this.tvMainObject.start();
    this.tvIndicator.start();
    // this.tvAudio.start();

}

module.exports = TVScene;