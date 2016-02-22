uniform sampler2D tNormal;
uniform sampler2D tNoise;
uniform sampler2D tDiffuse;
uniform sampler2D tInteraction;
uniform float uTime;
uniform float uHorizontalScale;

varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vTransformNormal;
varying vec3 vWorldPosition;

#pragma glslify: range = require(ks-glsl-utils/range);

void main(){
    vUv = uv;
    vec3 pos = position;


    float rad = length(vec2(uv.x-0.5, uv.y-0.5));
    float dis = rad - clamp(0.015 * uTime, 0., 0.5);
    float rate = 1.0 - clamp(dis, 0.0, 1.0);

    pos.x *= rate * rate * uHorizontalScale;
    pos.y *= rate * rate;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vTransformNormal = normalMatrix * normal;

    gl_Position = projectionMatrix * mvPosition;

}