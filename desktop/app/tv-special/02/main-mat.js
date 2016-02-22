var THREE = require('three');
window.THREE = THREE;
var glslify = require('glslify');

import SnowWrapperObject from './snow-wrapper-object';

export default class SkinnedMesh extends THREE.ShaderMaterial {
    constructor() {
        var bgImage = window.app.assets.texture['spBg'].image;

        var uniforms = {
            uTime : {type :"f", value: 0 },
            uState : {type: "f", value: 0 },
            uOpacity : {type: "f", value: 0 },
            uuOpacity : {type: "f", value: 0.9 + 0.1 * Math.random() },
            texture :   { type: "t",  value: null },
            bgTexture : { type: "t", value: window.app.assets.texture['spBg']},
            bgSize    : { type: "v2", value: new THREE.Vector2( bgImage.width, bgImage.height )},
            windowSize: { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) }
        }

        var opts = {
            uniforms : uniforms,
            vertexShader   : glslify('../shaders/common.vert'),
            fragmentShader : glslify('../shaders/01/shader.frag'),
            side           : THREE.DoubleSide,
            transparent    : true
        };

        super(opts);

        this.uniforms = uniforms;

        this.rTextureWidth  = window.innerWidth;
        this.rTextureHeight = window.innerWidth * 54/62; //window.innerWidth * 54/62;
        this.rTexture = new THREE.WebGLRenderTarget( this.rTextureWidth, this.rTextureHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        });

        this.uniforms.texture.value = this.rTexture;


        this.cameraRTT = new THREE.PerspectiveCamera(50, 62/54, 1, 10000);
        this.cameraRTT.position.set( 0, 0, 1000 );
        this.cameraRTT.lookAt(new THREE.Vector3(0, 0, 0));

        this.sceneRTT = new THREE.Scene();

        var ambientLight = new THREE.AmbientLight( 0x080808 );
        this.sceneRTT.add( ambientLight );

        this.snowWrapperObject = new SnowWrapperObject();
        this.sceneRTT.add(this.snowWrapperObject);

        this.mouseX = 0;
        this.mouseY = 0;
    }

    reset (){
        this.uniforms.uTime.value = 0;
        this.uniforms.uOpacity.value = 0;

        this.start();
    }


    start(){
        this.snowWrapperObject.start();

        TweenLite.to(this.uniforms.uOpacity, 1.2, {value: 1, delay: 0.4, onComplete: function(){
            this.dispatchEvent ( {type: "tweenComplete"} );
        }.bind(this)});
    }

    onUpdate (dt, renderer ){
        var mouseX= this.mouseX || 0;
        var mouseY= this.mouseY || 0;

        this.cameraRTT.position.x += ( (mouseX - window.innerWidth/2) /2 - this.cameraRTT.position.x ) * 0.08;
        this.cameraRTT.position.y += ( (mouseY - window.innerHeight/2) - this.cameraRTT.position.y ) * 0.08;

        this.cameraRTT.lookAt( this.sceneRTT.position );

        this.uniforms.uuOpacity.value = 0.1 * Math.random() + 0.6;

        this.uniforms.uTime.value += dt;

        this.snowWrapperObject.update(dt);
        renderer.render(this.sceneRTT, this.cameraRTT, this.rTexture, true);
    }
    onResize (renderer){
        /**
        this.uniforms.windowSize.value = new THREE.Vector2(window.innerWidth, window.innerHeight);
        this.rTextureWidth  = window.innerWidth;
        this.rTextureHeight = window.innerHeight;

        this.rTexture.setSize( window.innerWidth, window.innerHeight );

        this.cameraRTT.aspect = window.innerWidth / window.innerHeight;
        this.cameraRTT.updateProjectionMatrix();
         */
    }
    onMouseMove(mouseX, mouseY){
        this.mouseX = mouseX * window.innerWidth;
        this.mouseY = (mouseY + 1.4) * window.innerHeight/2;
    }
    turnOff(){
        //this.particleSystem.turnOff();
        TweenLite.to(this.uniforms.uOpacity, 0.6, {value: 0, onComplete: function(){
            this.dispatchEvent ( {type: "turnOffSpecial"} );
        }.bind(this)});
    }
}
