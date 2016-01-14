var customRayCaster = require('./custom-raycaster/custom-raycaster');
var glslify = require('glslify');

var LoaderScene = function( renderer ){
    THREE.Scene.call(this);

    this.renderer = renderer;

    this.camera =  new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 10000 );
    this.camera.position.z = 10000;

    this.uniforms = {
        uTime   : {type :"f", value: 0.1 },
        uRate   : {type :"f", value: 0 },
        uWindow : {type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) }
    };

    this.tvMaterial = new THREE.ShaderMaterial({
        uniforms       : this.uniforms,
        vertexShader   : glslify('./load/shader.vert'),
        fragmentShader : glslify('./load/shader.frag'),
        side           : THREE.DoubleSide,
        transparent    : true
    });

    this.uniforms.uWindow.value.x = window.innerWidth;
    this.uniforms.uWindow.value.y = window.innerHeight;

    var plane = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
    var mesh = new THREE.Mesh(plane, this.tvMaterial);
    this.mesh = mesh;
    this.add(mesh)
};

LoaderScene.prototype = Object.create(THREE.Scene.prototype);
LoaderScene.prototype.constructor = LoaderScene.prototype;

LoaderScene.prototype.start = function(){
    this.isLoaded = false;
};

LoaderScene.prototype.update = function( dt, renderer, customLoader ){
    if(!this.isLoaded){
        var rate = customLoader.getRate();
        if(rate == 1) this.isLoaded = true;
        if(this.tl) this.tl.pause();
        this.tl = TweenMax.to(this.uniforms.uRate, 0.6, {value: rate, onComplete: this.onCompleteTween.bind(this)} )
    }
    this.uniforms.uTime.value  += dt;

    renderer.render(this, this.camera);
};

LoaderScene.prototype.onCompleteTween = function(){
    if(this.uniforms.uRate.value == 1){
        setTimeout(function(){
            this.dispatchEvent ( {type: "loaded"} )
        }.bind(this), 100);
    }
}




module.exports = LoaderScene;