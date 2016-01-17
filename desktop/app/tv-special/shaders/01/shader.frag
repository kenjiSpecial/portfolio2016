varying vec2 vUv;

uniform float uTime;
uniform float uState;
uniform float uMouse;
uniform float uOpacity;
uniform float uuOpacity;

uniform sampler2D texture;
uniform sampler2D bgTexture;


void main(){
    vec3 col = mix( vec3(0., 0., 0.), ( texture2D(texture, vUv).rgb + texture2D(bgTexture, vUv).rgb* uuOpacity ), uOpacity);
    gl_FragColor = vec4( col, 1.);
}
