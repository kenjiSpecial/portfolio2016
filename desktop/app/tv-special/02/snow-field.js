var SimplexNoise = require('simplex-noise');
var simplexNoise = new SimplexNoise();
var THREE = require('three');

var SnowInteraction = require('./snow-interaction');
var SnowFallMesh    = require('./snow-mesh');

var glslify = require('glslify');
var ksUtils = require('ks-utils');

var EarthSnow = function(){
    this.speed = 0;
    this.time = 0;
    this.geo = new THREE.PlaneGeometry(500, 500,  69, 69      );

    console.log();

    this.textureLoader = new THREE.TextureLoader();
    this.selectedVertices = [];

    this.snowTexture = window.app.assets.texture["spSnow"];
    this.snowTexture.mapping= THREE.RepeatWrapping;
    this.snowTexture.wrapS = this.snowTexture.wrapT = THREE.RepeatWrapping;

    this.snowNormalTexture = window.app.assets.texture["spSnowNormal"];
    this.snowNormalTexture.mapping = THREE.RepeatWrapping;
    this.snowNormalTexture.wrapS = this.snowNormalTexture.wrapT = THREE.RepeatWrapping;

    this.noiseTexture =  window.app.assets.texture["spNoise"];
    this.noiseTexture .wrapS = this.noiseTexture.wrapT = THREE.RepeatWrapping;
    this.noiseTexture.mapping = THREE.RepeatWrapping;

    this.snowInteraction = new SnowInteraction(this.geo);

    this.uniforms = {
        tInteraction : {
            type : "t",
            value: this.snowInteraction.texture
        },
        tNormal : {
            type : "t",
            value: this.snowNormalTexture
        },
        tNoise : {
            type  : "t",
            value : this.noiseTexture
        },
        tDiffuse : {
            type : "t",
            value: this.snowTexture
        },
        uvoffset : {
            type : "t",
            value: new THREE.Vector2()
        },
        uTime : {
            type : "f",
            value : 0
        },
        uHorizontalScale : {
            type : "f",
            value : 1
        },
        uTime2 : {
            type : "f",
            value : 0,
        }
    };

    this.shaderMat = new THREE.ShaderMaterial({
        uniforms : this.uniforms,
        vertexShader : glslify("./shader/shader.vert"),
        fragmentShader: glslify("./shader/shader.frag"),
        side : THREE.DoubleSide,
        transparent : true
    });
    this.shaderMat.derivatives = true;

    THREE.Mesh.call( this, this.geo, this.shaderMat );
    this.rotation.x = -Math.PI/2;

    this.createGeometry();

    var geo = new THREE.PlaneGeometry(500, 500, 30, 30);
    for(var jj = 0; jj < geo.vertices.length; jj++){
        var vertice = geo.vertices[jj];
        vertice.z -=  -3 + 0.6 * Math.sqrt( Math.max(220* 220 - (vertice.x* vertice.x+ vertice.y* vertice.y), 0) )

    }
    geo.verticesNeedUpdate = true;
    geo.normalsNeedUpdate  = true;
    geo.computeFaceNormals();
    geo.computeVertexNormals();


    this.geo.merge(geo);

};

EarthSnow.prototype = Object.create(THREE.Mesh.prototype);
EarthSnow.prototype.constructor = EarthSnow;

EarthSnow.prototype.onStart = function(){
    this.uniforms.uTime.value = 30;
};

EarthSnow.prototype.update = function(dt){
    this.time += dt;
    this.uniforms.uHorizontalScale.value = 0.95 + 0.05 * Math.cos(this.time * 8);
    this.uniforms.uTime2.value = this.time;
    this.updateGeometry(dt);
};

EarthSnow.prototype.createGeometry = function(){
    for(var ii = 0; ii < this.geo.vertices.length; ii++){
        var vertice = this.geo.vertices[ii];
        if(!vertice.o){
            vertice.o = new THREE.Vector3().copy(vertice);
        }

        var rate = (1.3 - Math.abs( Math.sqrt(vertice.x* vertice.x+ vertice.y* vertice.y )/150) );// * 100;
        if(rate < 0) rate = 0;
        if(rate >   1.0) {
            rate = 1.0;
            this.selectedVertices.push(vertice);
        }
        rate *= 150;


        vertice.z = rate * ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.02, vertice.o.y * 0.02, ( vertice.o.z - this.speed) * 0.0012), -1, 1, 0.92, 1.0) + ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.02, vertice.o.y * 0.02, ( vertice.o.z - this.speed) * 0.0012), -1, 1, 0, 5)  ;
    }



    this.geo.verticesNeedUpdate = true;
    this.geo.normalsNeedUpdate  = true;
    this.geo.computeFaceNormals();
    this.geo.computeVertexNormals();
};

EarthSnow.prototype.updateGeometry = function(dt){
    this.speed += 1;

    this.selectedVertices.forEach(function( vertice ){
        var rate = 160;
        var rate2 = 350;
        vertice.z =
            (rate  - rate2)* ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.02, vertice.o.y * 0.02, ( vertice.o.z - this.speed) * 0.0012), -1, 1, 0.92, 1.0) + ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.02, vertice.o.y * 0.02, ( vertice.o.z - this.speed) * 0.0012), -1, 1, 0, 5)
        +   rate2 * ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.2, vertice.o.y * 0.2, ( vertice.o.z - this.speed ) * 0.012), -1, 1, 0.92, 1.0) + ksUtils.range(simplexNoise.noise3D(vertice.o.x * 0.02, vertice.o.y * 0.2, ( vertice.o.z - this.speed ) * 0.0012), -1, 1, 0, 5)
        ;
    }.bind(this));

    this.geo.verticesNeedUpdate = true;
    this.geo.normalsNeedUpdate  = true;
    this.geo.computeFaceNormals();
    this.geo.computeVertexNormals();

};


module.exports = EarthSnow;