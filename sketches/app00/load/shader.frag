varying vec2 vUv;

uniform vec2 uWindow;
uniform float uTime;
uniform float uRate;

float snoise( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(1.,1.))) * 2560. );
}

void main() {
    float rateX = mix( uWindow.x, 1., uRate);
    float rateY = mix( uWindow.y, 1., uRate);
    float rateCol = 0.4; //mix( 0.0, 0.3, uRate);
    float n1 = snoise( vec2( floor(vUv.x * rateX) * cos(uTime/10.), floor(vUv.y *rateY ) *sin(uTime/10.)  ) ) * rateCol;
    gl_FragColor = vec4( n1, n1, n1, 1.0 );
}