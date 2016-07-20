function decodeFloat(x, y, z, w) {
    var UINT8_VIEW = new Uint8Array(4);
    var FLOAT_VIEW = new Float32Array(UINT8_VIEW.buffer);
    UINT8_VIEW[0] = Math.floor(w);
    UINT8_VIEW[1] = Math.floor(z);
    UINT8_VIEW[2] = Math.floor(y);
    UINT8_VIEW[3] = Math.floor(x);

    return FLOAT_VIEW[0]
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var r = hex >> 16;
    var g = (hex & 0x00FF00) >> 8;
    var b = hex & 0x0000FF;

    if (r > 0) r--;
    if (g > 0) g--;
    if (b > 0) b--;

    return [r, g, b];
};

function getCol(posX){
    var rate = (posX + 120)/240

    var col;
    var rad = 10 * Math.random();
    if(rate < 0.2){
        col = {r: 160, g: 160, b: 220 + rad};
    }else if(rate < 0.4){
        col = {r: 160, g: 220 + rad, b: 160};
    }else if(rate < 0.6){
        col = {r: 220 + rad, g: 220 + rad, b: 160};
    }else if(rate < 0.8){
        col = {r: 220 + rad, g: 180 + rad, b: 160};
    }else{
        col = {r: 220 + rad, g: 160, b: 160};
    }

    return col;
}


var ParticleContainer = function (maxParticles, particleSystem) {
    this.PARTICLE_COUNT = maxParticles || 100000;
    //this.PARTICLE_CURSOR = 0;
    this.time = 0;
    this.DPR = window.devicePixelRatio;
    this.GPUParticleSystem = particleSystem;

    var particlesPerArray = Math.floor(this.PARTICLE_COUNT / this.MAX_ATTRIBUTES);

    THREE.Object3D.apply(this, arguments);

    this.position.set(-120 + 240 *Math.random(), 150 *Math.random()-40, -100 * Math.random());

    this.particles = [];
    this.particleShaderGeo = new THREE.BufferGeometry();

    this.particleVertices = new Float32Array(this.PARTICLE_COUNT * 3); // position
    this.particlePositionsStartTime = new Float32Array(this.PARTICLE_COUNT * 4); // position
    this.particleVelColSizeLife = new Float32Array(this.PARTICLE_COUNT * 4);

    var random = Math.random() * 4;
    this.particleRandom = random;


    var randomCol = getCol(this.position.x);

    for (var i = 0; i < this.PARTICLE_COUNT; i++) {
        this.particlePositionsStartTime[i * 4 + 0] = 0; //x
        this.particlePositionsStartTime[i * 4 + 1] = 0; //y
        this.particlePositionsStartTime[i * 4 + 2] = 0.0; //z
        this.particlePositionsStartTime[i * 4 + 3] = 0.1 * Math.random() + random ; //startTime

        this.particleVertices[i * 3 + 0] = 0; //x
        this.particleVertices[i * 3 + 1] = 0; //y
        this.particleVertices[i * 3 + 2] = 0.0; //z

        var theta = Math.random() * 2 * Math.PI;
        var velLength = 128 * Math.random();

        this.particleVelColSizeLife[i * 4 + 0] = decodeFloat( 128 + parseInt(velLength * Math.cos(theta)), 128+ parseInt(velLength * Math.sin(theta)), 0, Math.random() * 200); //vel
        this.particleVelColSizeLife[i * 4 + 1] = decodeFloat(randomCol.r, randomCol.g, randomCol.b, 254); //color
        this.particleVelColSizeLife[i * 4 + 2] = 10 * Math.random() + 2; //size
        this.particleVelColSizeLife[i * 4 + 3] = 2.0 + 0.5 * Math.random(); //lifespan
    }

    this.particleShaderGeo.addAttribute('position', new THREE.BufferAttribute(this.particleVertices, 3));
    this.particleShaderGeo.addAttribute('particlePositionsStartTime', new THREE.BufferAttribute(this.particlePositionsStartTime, 4).setDynamic(true));
    this.particleShaderGeo.addAttribute('particleVelColSizeLife', new THREE.BufferAttribute(this.particleVelColSizeLife, 4).setDynamic(true));

    this.posStart = this.particleShaderGeo.getAttribute('particlePositionsStartTime')
    this.velCol = this.particleShaderGeo.getAttribute('particleVelColSizeLife');

    this.particleShaderMat = this.GPUParticleSystem.particleShaderMat;

    this.particleSystem = new THREE.Points(this.particleShaderGeo, this.particleShaderMat); //new THREE.MeshBasicMaterial({color: 0xffff00}));
    //this.particleSystem.frustumCulled = false;
    this.add(this.particleSystem);
}

ParticleContainer.prototype = Object.create(THREE.Object3D.prototype);
ParticleContainer.prototype.constructor = ParticleContainer; //THREE.GPUParticleContainer;

ParticleContainer.prototype.start = function() {
    this.count = 1;
    for (var i = 0; i < this.PARTICLE_COUNT; i++) {
        this.particlePositionsStartTime[i * 4 + 3] = 0.1 * Math.random() + this.particleRandom * this.count + 3.0 * (this.count-1); //startTime
    }
    this.posStart.needsUpdate = true;
    this.timerId = setTimeout( this.reset.bind(this), (this.particleRandom + 3.0) * 1000 )
};

ParticleContainer.prototype.reset = function(){
    this.count++;

    for (var i = 0; i < this.PARTICLE_COUNT; i++) {
        this.particlePositionsStartTime[i * 4 + 3] = 0.1 * Math.random() + this.particleRandom * this.count + 3.0 * (this.count-1); //startTime
    }
    this.posStart.needsUpdate = true;
    this.timerId = setTimeout( this.reset.bind(this), (this.particleRandom + 3.0) * 1000 )
}

ParticleContainer.prototype.update = function(time) {

    this.time = time;
    this.particleSystem.material.uniforms['uTime'].value = time;

    //this.geometryUpdate();
};

ParticleContainer.prototype.geometryUpdate = function() {
    if (this.particleUpdate == true) {
        this.particleUpdate = false;

        // if we can get away with a partial buffer update, do so
        if (this.offset + this.count < this.PARTICLE_COUNT) {
            this.posStart.updateRange.offset = this.velCol.updateRange.offset = this.offset * 4;
            this.posStart.updateRange.count = this.velCol.updateRange.count = this.count * 4;
        } else {
            this.posStart.updateRange.offset = 0;
            this.posStart.updateRange.count = this.velCol.updateRange.count = (this.PARTICLE_COUNT * 4);
        }

        this.posStart.needsUpdate = true;
        this.velCol.needsUpdate = true;

        this.offset = 0;
        this.count = 0;
    }
}

ParticleContainer.prototype.turnOff = function(){
    clearTimeout(this.timerId);
}


module.exports = ParticleContainer;