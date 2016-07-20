//require('./vendors/GPUParticleSystem');
var ParticleContainer = require('./particle-container');
var glslify = require('glslify');

var HanabiParticle = function(){
    this.PARTICLE_COUNT = 300000;
    this.PARTICLE_CONTAINERS = 120;
    this.PARTICLES_PER_CONTAINER = Math.ceil(this.PARTICLE_COUNT / this.PARTICLE_CONTAINERS);
    this.PARTICLE_CURSOR = 0;
    this.time = 0;

    // Custom vertex and fragement shader
    var GPUParticleShader = {
        vertexShader: glslify('./particle-shader/shader.vert'),
        fragmentShader: glslify('./particle-shader/shader.frag')
    };

    // preload a million random numbers
    this.rand = [];

    for (var i = 1e5; i > 0; i--) {
        this.rand.push(Math.random() - .5);
    }

    this.random = function() {
        return ++i >= this.rand.length ? this.rand[i = 1] : this.rand[i];
    }.bind(this);
    
    
    this.particleShaderMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            "uTime": {
                type: "f",
                value: 0.0
            },
            "uScale": {
                type: "f",
                value: 1.0
            },
            "tNoise": {
                type: "t",
                value: window.app.assets.texture['spPerlin']
            },
            "tSprite": {
                type: "t",
                value: window.app.assets.texture['spParticle']
            }
        },
        blending: THREE.AdditiveBlending,
        vertexShader: GPUParticleShader.vertexShader,
        fragmentShader: GPUParticleShader.fragmentShader
    });


    this.particleShaderMat.defaultAttributeValues.particlePositionsStartTime = [0, 0, 0, 0];
    this.particleShaderMat.defaultAttributeValues.particleVelColSizeLife = [0, 0, 0, 0];

    this.particleContainers = [];
    //this.randomTime = 10 * Math.random();

    THREE.Object3D.apply(this, arguments);

    for (var i = 0; i < this.PARTICLE_CONTAINERS; i++) {
        var c = new  ParticleContainer(this.PARTICLES_PER_CONTAINER, this); //THREE.GPUParticleContainer(this.PARTICLES_PER_CONTAINER, this);
        this.particleContainers.push(c);
        //c.position.set( )
        this.add(c);
    }
}

HanabiParticle.prototype = Object.create(THREE.Object3D.prototype);
HanabiParticle.prototype.constructor = HanabiParticle; //THREE.GPUParticleSystem;

HanabiParticle.prototype.start = function(){

    this.particleContainers.forEach(function(particleContainer){
        particleContainer.start()
    }.bind(this));
};

HanabiParticle.prototype.spawnParticle = function(options) {

}

HanabiParticle.prototype.update = function(time) {
    for (var i = 0; i < this.PARTICLE_CONTAINERS; i++) {
        this.particleContainers[i].update(time);
    }
};

HanabiParticle.prototype.turnOff = function(){
    for (var i = 0; i < this.PARTICLE_CONTAINERS; i++) {
        this.particleContainers[i].turnOff();
    }
}

module.exports = HanabiParticle;