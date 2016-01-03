uniform float uTime;
uniform float uState;
uniform sampler2D texture;
uniform sampler2D texture1;

varying vec2 vUv;

float sideWidth      = 62.;
float sideHeight     = 54.;


float noiseLevel = 0.5;
uniform float distortion1;
uniform float distortion2;
uniform float speed;
uniform float uRandom;
uniform float uRandom1;
uniform float uRandom2;
uniform float uColR;
uniform float uColG;

float scanLineThickness = 25.;
float scanLineIntensity = 0.5;
float scanLineOffset = 0.;
float distance = 0.;

float snoise( vec2 co ){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Start Ashima 2D Simplex Noise

const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);

vec3 mod289(vec3 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
	return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
	return mod289(((x*34.0)+1.0)*x);
}


float snoise2(vec2 v)	{
	vec2 i  = floor(v + dot(v, C.yy) );
	vec2 x0 = v -   i + dot(i, C.xx);

	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;

	i = mod289(i); // Avoid truncation effects in permutation
	vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))+ i.x + vec3(0.0, i1.x, 1.0 ));

	vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
	m = m*m ;
	m = m*m ;

	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;

	m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

	vec3 g;
	g.x  = a0.x  * x0.x  + h.x  * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

// End Ashima 2D Simplex Noise

const float tau = 6.28318530718;

//	use this pattern for scan lines

vec2 pattern(vec2 pt) {
	float s = 0.0;
	float c = 1.0;
	vec2 tex = pt * 100.;
	vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * (1.0/scanLineThickness);
	float d = point.y;

	return vec2(sin(d + scanLineOffset * tau + cos(pt.x * tau)), cos(d + scanLineOffset * tau + sin(pt.y * tau)));
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

/**
void main() {
	vec2 p = vv_FragNormCoord;
	float ty = TIME*speed;
	float yt = p.y - ty;

	//smooth distortion
	float offset = snoise(vec2(yt*3.0,0.0))*0.2;
	// boost distortion
	offset = pow( offset*distortion1,3.0)/max(distortion1,0.001);
	//add fine grain distortion
	offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;
	//combine distortion on X with roll on Y
	vec2 adjusted = vec2(fract(p.x + offset),fract(p.y-uTime) );
	vec4 result = IMG_NORM_PIXEL(inputImage, adjusted);
	vec2 pat = pattern(adjusted);
	vec3 shift = scanLineIntensity * vec3(0.3 * pat.x, 0.59 * pat.y, 0.11) / 2.0;
	result.rgb = (1.0 + scanLineIntensity / 2.0) * result.rgb + shift + (rand(adjusted * TIME) - 0.5) * noiseLevel;
	gl_FragColor = result;

} */


vec3 getColor(){
    float ty = uTime * speed;
    float yt = vUv.y - ty;

    float offset = snoise2(vec2(yt*3.0,0.0))*0.2;
    offset = pow( offset*distortion1,3.0)/max(distortion1,0.001);
    offset += snoise2(vec2(yt*50.0,0.0))*distortion2*0.01;
    vec2 adjusted = vec2(fract(vUv.x + offset),fract(vUv.y- distance ) );
    adjusted = floor(adjusted * 20.)/20.;
    if(adjusted.y > uRandom && adjusted.y  < uRandom + uRandom1){
        adjusted.x = mod(adjusted.x + uRandom2, 1.);
    }
    vec3 col = texture2D(texture1, adjusted).rgb;

    col = vec3( (col.r + col.g + col.b)/3. );
    if(adjusted.y > uRandom && adjusted.y  < uRandom + uRandom1){
            col.r *= uColR;
            col.g *= uColR;
    }
    return col;
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

        float xPos = vUv.x; // + cos( vUv.y * 10. + uTime * 3. ) * 0.3 + 0.1 * sin(uTime * 3. + vUv.y * 3.14 * 6.);
        float yPos = vUv.y; //( cos(uTime * 0.6 + vUv.y * .3) + 1. ) /2.;
        vec3 col = getColor(); //texture2D( texture1, vec2( xPos, yPos )).rgb;

        vec3 mixCol = mix( baseTexel.rgb, col, rate);
        color = vec3( n * mixCol );
    }else if(uState == 1.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = getColor();
        color = vec3( col * n);
    }else if(uState < 2.){
       float rate = uState - 1.;
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 inCol = getColor();
        vec3 rowCol = texture2D(texture1, vUv).rgb;
        vec3 col = mix( inCol, rowCol, rate );
        color = vec3( col * n);
    }else if(uState == 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = texture2D(texture1, vUv).rgb;
        color = vec3( col * n);
    }
    /**
    else if(uState < 2.){
    n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        float rate = uState - 1.;
        float inXPos = vUv.x + cos( vUv.y * 10. + uTime * 3. ) * 0.3 + 0.1 * sin(uTime * 3. + vUv.y * 3.14 * 6.);
        float inYPos = ( cos(uTime * 0.6 + vUv.y * .3) + 1. ) /2.;
        float xPos = mix(inXPos, vUv.x, rate);
        float yPos = mix(inYPos, vUv.y, rate);

        colR = texture2D( texture1, vec2( xPos, yPos )).r;
        colG = texture2D( texture1, vec2( xPos + 0.1 * cos(uTime * 3.) * (1.-rate), yPos )).g;
        colB = texture2D( texture1, vec2( xPos - 0.1 * cos(uTime * 1.) * (1.-rate), yPos )).b;

        color = vec3( colR * n, colG * n, colB * n );
    }else if(uState == 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        color = vec3(n * texture2D( texture1, vUv.xy ).rgb);
    } */


    gl_FragColor = vec4(color, 1.);


}