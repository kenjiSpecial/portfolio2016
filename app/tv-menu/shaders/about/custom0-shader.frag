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

        float xPos_ = (vUv.x - 0.5 )* 1.0; // + 0.5 * ; //  + cos( vUv.y * 10. + uTime * 3. ) * 0.3 * 0.1 * sin(uTime * 3. + vUv.y * 3.14 * 6.);
        float yPos_ = (vUv.y - 0.5 )* 1.0; //( cos(uTime * 0.6 + vUv.y * .3) + 1. ) /2.;
        float theta = mod((atan(yPos_, xPos_) + 3.14 + uTime), 3.14/3.);
        float length = mod(distance(xPos_, yPos_) * 3., 1.);
        float xPos = theta;
        float yPos = length;

        vec3 col = texture2D( texture1, vec2( xPos, yPos )).rgb;
        colR = col.r;
        colG = col.g;
        colB = col.b;
        vec3 mixCol = mix( baseTexel.rgb, vec3(colR, colG, colB), rate);

        color = vec3( n * mixCol );
    }else if(uState == 1.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );

        float xPos_ = (vUv.x - 0.5 )* 1.0; // + 0.5 * ; //  + cos( vUv4/.y * 10. + uTime * 3. ) * 0.3 * 0.1 * sin(uTime * 3. + vUv.y * 3.14 * 6.);
        float yPos_ = (vUv.y - 0.5 )* 1.0; //( cos(uTime * 0.6 + vUv.1y * .3) + 1. ) /2.;

        float theta = mod((atan(yPos_, xPos_) + 3.14 + uTime/10.), 3.14/6.) * 1.;///3.14 * 4.; ///(2. + 1.5 * cos(uTime)));
        float length = mod(distance(xPos_, yPos_) * 0.8, 1.);

        float theta1 = mod((atan(yPos_, xPos_) + 3.14 + uTime/10.), 3.14/3.) * 1.;///3.14 * 4.; ///(2. + 1.5 * cos(uTime)));
        float length1 = mod(distance(xPos_, yPos_) * 1.2, 1.);


        float xPos = theta;
        float yPos = length;

        vec3 col = texture2D( texture1, vec2( xPos, yPos )).rgb;
        colR = texture2D( texture1, vec2( xPos, yPos )).r;
        colG = texture2D( texture1, vec2( theta1, length1 )).g;
        colB = col.b;

        color = vec3( colR * n, colG * n, colB * n );
    }else if(uState < 2.){
    n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        float rate = uState - 1.;

        float xPos_ = (vUv.x - 0.5 )* 1.0; // + 0.5 * ; //  + cos( vUv.y * 10. + uTime * 3. ) * 0.3 * 0.1 * sin(uTime * 3. + vUv.y * 3.14 * 6.);
        float yPos_ = (vUv.y - 0.5 )* 1.0; //( cos(uTime * 0.6 + vUv.y * .3) + 1. ) /2.;
        float theta = mod((atan(yPos_, xPos_) + 3.14 + uTime), 3.14/3.);
        float length = mod(distance(xPos_, yPos_) * 3., 1.);
        float inXPos = theta;
        float inYPos = length;

        float xPos = mix(inXPos, vUv.x, rate);
        float yPos = mix(inYPos, vUv.y, rate);

        vec3 col = texture2D( texture1, vec2( xPos, yPos )).rgb;
        colR = col.r;
        colG = col.g;
        colB = col.b;

        color = vec3( colR * n, colG * n, colB * n );
    }else if(uState == 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        color = vec3(n * texture2D( texture1, vUv.xy ).rgb);
    }


    gl_FragColor = vec4(color, 1.);


}