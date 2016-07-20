uniform float uTime;
uniform float uState;
uniform sampler2D texture;
uniform sampler2D texture1;

varying vec2 vUv;

float sideWidth      = 62.;
float sideHeight     = 54.;

float snoise( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
    float halfSideWidth  = sideWidth/2.;
    float halfSideHeight = sideHeight/2.;

    float n;
    vec3  color;
    vec4 texel, baseTexel;
    float colR, colG, colB;

    if(uState == 0.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        texel = texture2D( texture, vec2( vUv.x, vUv.y  + 0.6));

        color = vec3( n * texel.r, n * texel.g, n * texel.b );
    }else if(uState < 1.){
        float rate = uState;
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        baseTexel = texture2D( texture, vec2( vUv.x, vUv.y));

        float xPos = mod( -uTime/3. + vUv.x * 1. + 0.8 * cos(-uTime/3.) * sin( vUv.x * (1.-vUv.x) * 6.28 + 1.57), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);
        float yPos = mod(vUv.y * 1. + 1.2 * sin(cos(uTime/1.) * vUv.y * (1.-vUv.y) * vUv.x * (1.-vUv.x) * 6.28), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);

        colR = texture2D( texture1, vec2( xPos+ 0.1 * cos(uTime * 2.) * rate, yPos )).r;
        colG = texture2D( texture1, vec2( xPos , yPos+ 0.1 * cos(uTime * 3.) * rate )).g;
        colB = texture2D( texture1, vec2( xPos , yPos- 0.1 * sin(uTime * 1.) * rate )).b;

        vec3 mixCol = mix( baseTexel.rgb, vec3(colR, colG, colB), rate);
        color = vec3( n * mixCol );
    }else if(uState == 1.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        float xPos = mod( -uTime/3. + vUv.x * 1. + 0.8 * cos(-uTime/3.) * sin( vUv.x * (1.-vUv.x) * 6.28 + 1.57), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);
        float yPos = mod(vUv.y * 1. + 1.2 * sin(cos(uTime/1.) * vUv.y * (1.-vUv.y) * vUv.x * (1.-vUv.x) * 6.28), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);

        colR = texture2D( texture1, vec2( xPos + 0.1 * cos(uTime * 2.), yPos )).r;
        colG = texture2D( texture1, vec2( xPos, yPos + 0.1 * cos(uTime * 3.) )).g;
        colB = texture2D( texture1, vec2( xPos, yPos - 0.1 * sin(uTime * 1.) )).b;

        color = vec3( colR * n, colG * n, colB * n );
    }else if(uState < 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        float rate = uState - 1.;

//        float inXPos = mod(vUv.x * 1. + 0.8 * cos(-uTime/3.) * sin( vUv.x * (1.-vUv.x) * 6.28 + 1.57), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);
//        float inYPos = mod(vUv.y * 1. + 1.2 * sin(-uTime * cos(uTime/1.) * vUv.y * (1.-vUv.y) * vUv.x * (1.-vUv.x) * 6.28), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);
        float inXPos = mod( -uTime/3. + vUv.x * 1. + 0.8 * cos(-uTime/3.) * sin( vUv.x * (1.-vUv.x) * 6.28 + 1.57), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);
        float inYPos = mod(vUv.y * 1. + 1.2 * sin(cos(uTime/1.) * vUv.y * (1.-vUv.y) * vUv.x * (1.-vUv.x) * 6.28), 1.); //mod( cos( sin(uTime * 0.6 + vUv.y * .3) + 1. ) * 10. + 10., 1.);


        float xPos = mix(inXPos, vUv.x, rate);
        float yPos = mix(inYPos, vUv.y, rate);

        colR = texture2D( texture1, vec2( xPos+ 0.1 * cos(uTime * 2.) * (1. -rate), yPos )).r;
        colG = texture2D( texture1, vec2( xPos , yPos+ 0.1 * cos(uTime * 3.) * (1.-rate) )).g;
        colB = texture2D( texture1, vec2( xPos , yPos- 0.1 * sin(uTime * 1.) * (1.-rate) )).b;

        color = vec3( colR * n, colG * n, colB * n );
    }else if(uState == 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        color = vec3(n * texture2D( texture1, vUv.xy ).rgb);
    }


    gl_FragColor = vec4(color, 1.);


}