var TVMainObject = require('./tv-contact/tv-object');
var customRayCaster = require('./custom-raycaster/custom-raycaster');

var TVScene = function(){
    THREE.Object3D.call(this);

    this.tvMainObject = new TVMainObject();
    this.add(this.tvMainObject);

    customRayCaster.setObject(this.tvMainObject.rayCaster)

    this.rotateOnAxis ( new THREE.Vector3(0, 1, 0), -Math.PI/6);
    this.position.set( 200, -77, 360);
};

TVScene.prototype = Object.create(THREE.Object3D.prototype);
TVScene.prototype.constructor = TVScene.prototype;

TVScene.prototype.update = function(dt){
    this.tvMainObject.update(dt);
}

module.exports = TVScene;