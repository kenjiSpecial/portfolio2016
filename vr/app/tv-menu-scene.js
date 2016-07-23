var customRayCaster = require('./custom-raycaster/custom-raycaster');
var TVObject = require('./tv-menu/tv-object');

var TVScene = function( ){
    THREE.Object3D.call(this);
    this.tvArr = [];
    var opts = {};

    for(var xx = 0; xx < 3; xx++){
        for(var yy = 0; yy < 3; yy++){
            opts.row = yy;
            opts.col = xx;
            var tvObject = new TVObject(opts);
            customRayCaster.setObject(tvObject.rayCaster);
            this.add(tvObject);
            this.tvArr.push(tvObject);
        }
    }


    // this.rotateOnAxis ( new THREE.Vector3(0, 1, 0), -Math.PI/6);
    this.scale.set(window.app.scale, window.app.scale, window.app.scale);

    this.position.set( -100 * window.app.scale, 0, -380 * window.app.scale);
    // window.position = this.position;
    // window.obj = this;

};

TVScene.prototype = Object.create(THREE.Object3D.prototype);
TVScene.prototype.constructor = TVScene.prototype;

TVScene.prototype.update = function(dt){
    this.tvArr.forEach(function(tvObject){
        tvObject.update(dt);
    });
}

TVScene.prototype.invisible = function(){
    this.tvArr.forEach(function(tvObject){
        tvObject.visible = false;
    });
};

TVScene.prototype.start = function(){
    this.tvArr.forEach(function(tvObject){
        tvObject.start()
    });
}

module.exports = TVScene;