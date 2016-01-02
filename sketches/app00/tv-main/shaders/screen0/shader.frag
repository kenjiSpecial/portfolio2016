#define pi 3.1415926

uniform float uTime;
uniform float uState;
uniform float uMouse;

uniform sampler2D texture;
uniform sampler2D portfolioTexture;

varying vec2 vUv;


float sideWidth      = 62.;
float sideHeight     = 54.;

float snoise( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float h00(float x) { return 2.*x*x*x - 3.*x*x + 1.; }
float h10(float x) { return x*x*x - 2.*x*x + x; }
float h01(float x) { return 3.*x*x - 2.*x*x*x; }
float h11(float x) { return x*x*x - x*x; }

float Hermite(float p0, float p1, float m0, float m1, float x)
{
	return p0*h00(x) + m0*h10(x) + p1*h01(x) + m1*h11(x);
}

float terrain(float x) {
    //Used Shadershop
    //return ((sin( (sin( (x - -1.33) / 0.76 / 1.23 ) * 0.8 - 0.69) / 0.58 )) * (((((sin( (((x - -1.33) / 0.76 - -3.0) / 2.61 - -0.38) / 1.52 ) * 2.25) * (sin( (((x - -1.33) / 0.76 - -3.0) / 2.61 - -0.47) / 1.61 ) * 1.03))) * (sin( ((x - -1.33) / 0.76 - -3.0) / 2.61 / 0.44 ) * 1.48)) * 1.08)) * 0.78;
	//You actually should look after sigma.
    float v = 0.;
    x *= 3.;
    #define l 13.
    for (float n = 0.; n < l; n++) {
        v += ((sin((x*sin(n/2.142))+(n/1.41)))/l)*3.;
    }
    return pow(v,3.);
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



            vec4 texel = texture2D( texture, vec2( xPos, vUv.y ));
            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
            float colR, colG, colB;
//            if(rate < vUv.x){
//               colR = n;
//               colG = n;
//               colB = n;
//            }else{
               colR = (texel.r * n);
               colG = (texel.g * n);
               colB = (texel.b * n);
            //}


            gl_FragColor = vec4( colR, colG, colB, 1.); //vec4(n, n, n, 1.0 );
        }else{
            float colR, colG, colB;

            if(uMouse == 1.){

                vec2 uv = vec2(vUv.x, vUv.y);
                float a = sin(uTime * 1.0)*0.5 + 0.5;
                float b = sin(uTime * 1.5)*0.5 + 0.5;
                float c = sin(uTime * 2.0)*0.5 + 0.5;
                float d = sin(uTime * 2.5)*0.5 + 0.5;

                float y0 = mix(a, b, uv.x);
                float y1 = mix(c, d, uv.x);
                float x0 = mix(a, c, uv.y);
                float x1 = mix(b, d, uv.y);

                uv.x = Hermite(0., 1., 3.*x0, 3.*x1, uv.x);
                uv.y = Hermite(0., 1., 3.*y0, 3.*y1, uv.y);

//                vec3 color = texture2D(texture, vec2(uv.x, uv.y)).xyz;
                //vec3 texCol = texture2D(texture, vUv).rgb;
//                vec4 portfoliCol = texture2D(portfolioTexture, vUv).rgba;
                vec2 rPos = uv+(terrain((uv.y*20.)+(uTime*10.))/20.);
                vec2 gPos = uv+(terrain((uv.y*22.)+(uTime*10.))/21.);
                vec2 bPos = uv+(terrain((uv.y*14.)+(uTime*10.))/22.);

                colR = texture2D(texture,rPos).r;
                colG = texture2D(texture,gPos).g;
                colB = texture2D(texture,bPos).b;

            }else if(uMouse == 0.){
                vec4 col = texture2D(texture, vUv);
                vec2 rPos = vUv+(terrain((vUv.y*20.)+(uTime*10.))/80.);
                vec2 gPos = vUv+(terrain((vUv.y*22.)+(uTime*10.))/61.);
                vec2 bPos = vUv+(terrain((vUv.y*14.)+(uTime*10.))/92.);
                 colR = texture2D(texture,rPos).r;
                 colG = texture2D(texture,gPos).g;
                 colB = texture2D(texture,bPos).b;
            }else{

                vec2 uv = vec2(vUv.x, vUv.y);
                float a = sin(uTime * 1.0)*0.5 + 0.5;
                float b = sin(uTime * 1.5)*0.5 + 0.5;
                float c = sin(uTime * 2.0)*0.5 + 0.5;
                float d = sin(uTime * 2.5)*0.5 + 0.5;

                float y0 = mix(a, b, uv.x);
                float y1 = mix(c, d, uv.x);
                float x0 = mix(a, c, uv.y);
                float x1 = mix(b, d, uv.y);

                uv.x = Hermite(0., 1., 3.*x0, 3.*x1, uv.x);
                uv.y = Hermite(0., 1., 3.*y0, 3.*y1, uv.y);

                vec3 color = texture2D(texture, vec2(uv.x, uv.y)).xyz;
                vec3 texCol = texture2D(texture, vUv).rgb;

                vec4 col = texture2D(texture, vUv);
                vec2 rPos = vUv+(terrain((vUv.y*20.)+(uTime*10.))/80.);
                vec2 gPos = vUv+(terrain((vUv.y*22.)+(uTime*10.))/61.);
                vec2 bPos = vUv+(terrain((vUv.y*14.)+(uTime*10.))/92.);

                float col0R = texture2D(texture,rPos).r;
                float col0G = texture2D(texture,gPos).g;
                float col0B = texture2D(texture,bPos).b;

                vec2 rrPos = uv+(terrain((uv.y*20.)+(uTime*10.))/20.);
                vec2 ggPos = uv+(terrain((uv.y*22.)+(uTime*10.))/21.);
                vec2 bbPos = uv+(terrain((uv.y*14.)+(uTime*10.))/22.);

                //vec4 portfoliCol = texture2D(portfolioTexture, vUv).rgba;
                float col1R = texture2D(texture, rrPos).r;
                float col1G = texture2D(texture, ggPos).g;
                float col1B = texture2D(texture, bbPos).b;

                colR = col0R * (1.-uMouse) + col1R * uMouse;
                colG = col0G * (1.-uMouse) + col1G * uMouse;
                colB = col0B * (1.-uMouse) + col1B * uMouse;
            }


            n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
            colR = (colR * n);
            colG = (colG * n);
            colB = (colB * n);

            gl_FragColor = vec4( colR, colG, colB, 1.); //vec4(n, n, n, 1.0 );
        }

    }else{
      n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
      gl_FragColor = vec4( 1.5 * n, 1.5 * n, 1.5 * n, 1.); //vec4(n, n, n, 1.0 );

    }


}
