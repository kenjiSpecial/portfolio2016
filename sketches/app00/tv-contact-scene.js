var TVMainObject = require('./tv-contact/tv-object');
var TVIndicator = require('./tv-indicator/tv-object');

var customRayCaster = require('./custom-raycaster/custom-raycaster');

var TVScene = function(){
    THREE.Object3D.call(this);

    this.tvMainObject = new TVMainObject();
    this.add(this.tvMainObject);

    customRayCaster.setObject(this.tvMainObject.rayCaster)


    this.tvIndicator = new TVIndicator()
    this.tvIndicator.position.set(-76 * (0 + 1/3) + 6, 77 * (1 - 1/3), 76 * 1/3 - 8 );
    this.tvIndicator.scale.set(1/3, 1/3, 1/3)
    customRayCaster.setObject(this.tvIndicator.rayCaster);
    this.add(this.tvIndicator);

    this.rotateOnAxis ( new THREE.Vector3(0, 1, 0), -Math.PI/6);
    this.position.set( 200, -77, 360);
};

TVScene.prototype = Object.create(THREE.Object3D.prototype);
TVScene.prototype.constructor = TVScene.prototype;

TVScene.prototype.update = function(dt){
    this.tvMainObject.update(dt);
    this.tvIndicator.update(dt);
}

module.exports = TVScene;