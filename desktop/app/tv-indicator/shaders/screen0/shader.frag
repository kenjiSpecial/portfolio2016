uniform float uTime;
uniform float uState;
uniform sampler2D texture;
uniform sampler2D transformTexture;

varying vec2 vUv;

float sideWidth      = 62.;
float sideHeight     = 54.;

float snoise( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 getCol(float XPos, float rate){
    float yPos0 = 0.333 + cos(uTime * 2.0) * 0.04;//15;
    float yPos1 = 0.666 + cos(uTime * 3.0) * 0.06;
    yPos0 = mix(yPos0, 0.333, rate );
    yPos1 = mix(yPos1, 0.666, rate );
    float yPos;

/**
    float xPos0 = 0.25 + sin(uTime * 1.0) * 0.3;
    float xPos1 = 0.75 - sin(uTime * 2.0) * 0.3;
    float xPos; */


    if(vUv.y < yPos0){
        yPos = 0.333 * vUv.y / yPos0;
    }else if(vUv.y < yPos1){
        yPos = 0.333 + 0.333 *  (vUv.y - yPos0) / (yPos1 - yPos0);
    }else{
        yPos = 0.666 + 0.334 * (vUv.y - yPos1) / (1.0 - yPos1);
    }


/**
    if(vUv.x < xPos0){
        xPos = 0.333 * vUv.x / xPos0;
    }else if(vUv.x < xPos1){
        xPos = 0.333 + 0.333 *  (vUv.x - xPos0) / (xPos1 - xPos0);
    }else{
        xPos = 0.666 + 0.334 * (vUv.x - xPos1) / (1.0 - xPos1);
    } */

    return texture2D( texture, vec2( XPos, yPos )).rgb;
}

void main(){
    float halfSideWidth  = sideWidth/2.;
    float halfSideHeight = sideHeight/2.;

    float n;
    if(uState == 0.0){
        n = 0.04;
        gl_FragColor = vec4(n, n, n, 1.0 );
    }else if(uState < 10.){
        float rate;
        if(uState <= 0.1){
            float lineHeight = 1.;
            rate = uState/0.1;
            float xRate = abs(vUv.x - 0.5)/0.5;

            if(xRate < rate && vUv.y > 0.5-lineHeight/sideHeight && vUv.y < 0.5+lineHeight/sideHeight ){
                float nRate = abs(vUv.y - 0.5)/(lineHeight/sideHeight);
                n = clamp(0.04 + 1.2-1.2 * nRate, 0.04, 0.9);
            }else{
                n = 0.04;
            }
            gl_FragColor = vec4(n, n, n, 1.0 );
        }else if(uState <= 0.2){
            float lineHeight = 1. + 32. * (uState - 0.1)/0.1;
            float nRate = abs(vUv.y - 0.5)/(lineHeight/sideHeight);
            n = clamp(0.04 + 1.2-1.2 * nRate, 0.04, 0.9);
            gl_FragColor = vec4(n, n, n, 1.0 );
        }else if(uState <= 0.4){
            float lineHeight = 1. + 32.;
            float nRate = abs(vUv.y - 0.5)/(lineHeight/sideHeight);
            float WhiteVal = clamp(0.04 + 1.2-1.2 * nRate, 0.04, 0.9);
            float curRate = (uState - 0.2)/0.2;
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)) ) * curRate + WhiteVal * (1.-curRate);
            gl_FragColor = vec4(n, n, n, 1.0 );
        }else if(uState < 1.0){
            float xPos;
            float rate = (uState - 0.4) / (1.0 - 0.4);
            if(vUv.x > rate) xPos = rate;
            else             xPos = vUv.x;
            //vUv.x = xPos;

            vec3 texel = getCol( xPos, 0.); //texture2D( texture, vec2( xPos, vUv.y ));
            texel.r = clamp(texel.r + 0.6, 0., 1.);
            texel.g = clamp(texel.g + 0.6, 0., 1.);
            texel.b = clamp(texel.b + 0.6, 0., 1.);
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
            float colR, colG, colB;
               colR = (texel.r * n);
               colG = (texel.g * n);
               colB = (texel.b * n);

            gl_FragColor = vec4( colR, colG, colB, 1.); //vec4(n, n, n, 1.0 );
        }else if (uState == 1.0){
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
            vec3 texel = getCol(vUv.x, 0.); //texture2D( texture, vec2( vUv.x, vUv.y ));

            texel.r = clamp(texel.r + 0.6, 0., 1.);
            texel.g = clamp(texel.g + 0.6, 0., 1.);
            texel.b = clamp(texel.b + 0.6, 0., 1.);
            float colR = (texel.r * n);
            float colG = (texel.g * n);
            float colB = (texel.b * n);


            gl_FragColor = vec4( colR, colG, colB, 1.);
        }else if(uState <= 2.0){
            float rate = uState - 1.;
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) ) * (1.0 + 0.2 * rate );
            vec3 texel = getCol(vUv.x, rate); //texture2D( texture, vec2( vUv.x, vUv.y ));
            texel.r = clamp(texel.r + 0.6 - 0.3 * rate, 0., 1.);
            texel.g = clamp(texel.g + 0.6 - 0.3 * rate, 0., 1.);
            texel.b = clamp(texel.b + 0.6 - 0.3 * rate, 0., 1.);
            float colR = (texel.r * n);
            float colG = (texel.g * n);
            float colB = (texel.b * n);

            gl_FragColor = vec4( colR, colG, colB, 1.);
        }else if(uState <= 3.0){
            float rate = uState - 2.;
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) ) * (1.0 + 0.2 * rate );
            vec2 uv = vUv;
            uv.y = mix( vUv.y, (uv.y - 0.5) * 0.1 + 0.5, rate);
            vec3 texel = texture2D( texture, vec2( uv.x, uv.y )).rgb;
            texel.r = clamp(texel.r + 0.6 - 0.3 * rate, 0., 1.);
            texel.g = clamp(texel.g + 0.6 - 0.3 * rate, 0., 1.);
            texel.b = clamp(texel.b + 0.6 - 0.3 * rate, 0., 1.);
            float colR = (texel.r * n);
            float colG = (texel.g * n);
            float colB = (texel.b * n);

            gl_FragColor = vec4( colR, colG, colB, 1.);
        }

    }else{
      n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
      gl_FragColor = vec4( 2. * n, 2. * n, 2. * n, 1.); //vec4(n, n, n, 1.0 );

    }


}