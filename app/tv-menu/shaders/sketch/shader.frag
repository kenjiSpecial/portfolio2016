uniform float uTime;
uniform float uState;
uniform sampler2D texture;
uniform sampler2D texture1;
uniform sampler2D workTexture;

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
uniform float uColG;
uniform float workType;

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


vec3 getColor( float rate ){
    float ty = uTime * speed;
    float yt = vUv.y - ty;

    float offset = snoise2(vec2(yt*3.0,0.0))*0.2;
    offset = pow( offset*distortion1,3.0)/max(distortion1,0.001);
    offset += snoise2(vec2(yt*50.0,0.0))*distortion2*0.01;
    vec2 adjusted = vec2(fract(vUv.x + offset),fract(vUv.y- distance ) );

    if(adjusted.y > uRandom && adjusted.y  < uRandom + uRandom1){
        adjusted.x = mod(adjusted.x + uRandom2, 1.);
    }

    adjusted = mix(adjusted, vUv, rate);

    vec3 rawCol = texture2D(texture1, adjusted).rgb;

    vec3 col = vec3( (rawCol.r + rawCol.g + rawCol.b)/3. );
    if(adjusted.y > uRandom && adjusted.y  < uRandom + uRandom1){
            col.g *= uColG;
    }

    vec3 outputCol = mix(col, rawCol, rate);

    return outputCol;
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


vec3 getNextCol(){
    vec2 customUv;
    if(workType < 6.){
        float unit1 = 0.33333;
        float unit2 = 0.5;
        customUv.x = floor(mod(workType, 3.)) * unit1 + unit1 * vUv.x;
        customUv.y = (1. - floor(workType/3.))* unit2 + unit2 * vUv.y;
    }else{
        customUv = vUv;
    }

    vec3 col = texture2D(workTexture, customUv).rgb;
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
        vec3 col = getColor(0.); //texture2D( texture1, vec2( xPos, yPos )).rgb;

        vec3 mixCol = mix( baseTexel.rgb, col, rate);
        color = vec3( n * mixCol );
    }else if(uState == 1.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = getColor(0.);
        color = vec3( col * n);
    }else if(uState < 2.){
       float rate = uState - 1.;
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = getColor(rate);
        color = vec3( col * n);
    }else if(uState == 2.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = texture2D(texture1, vUv).rgb;
        color = vec3( col * n);
    }else if(uState < 3.){
        float rate = uState - 2.;
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = texture2D(texture1, vUv).rgb * n;
        vec3 nextCol = getNextCol() * (1. - n/3.);
        color = mix(col, nextCol, rate);
    }else if(uState == 3.){
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        vec3 col = getNextCol() * (1. - n/3.);
        color = vec3(col );
    }else if(uState < 4.){
        float rate = uState - 3.;
        n = snoise(vec2( vUv.x * 600.  *cos(uTime), vUv.y * 600. *sin(uTime)  ) );
        //vec3 col = getNextCol() ));
        vec2 uv = vec2(vUv.x, vUv.y);
        float a = sin(uTime * 1.0)*0.5 + 0.5;
        float b = sin(uTime * 0.5)*0.5 + 0.5;
        float c = sin(uTime * 0.35)*0.5 + 0.5;
        float d = sin(uTime * 1.5)*0.5 + 0.5;

        float y0 = mix(a, b, uv.x);
        float y1 = mix(c, d, uv.x);
        float x0 = mix(a, c, uv.y);
        float x1 = mix(b, d, uv.y);


        uv.x = Hermite(0., 1., 3.*x0, 3.*x1, uv.x);
        uv.y = Hermite(0., 1., 3.*y0, 3.*y1, uv.y);

        vec2 uuV = mix(vUv, uv, rate);
        vec3 col = texture2D(workTexture, uuV).rgb;
        color = vec3(col * (1. - n/3. * (1.-rate) ));
    }else if(uState == 4.){
        float a = sin(uTime * 1.0)*0.5 + 0.5;
        float b = sin(uTime * 0.5)*0.5 + 0.5;
        float c = sin(uTime * 0.35)*0.5 + 0.5;
        float d = sin(uTime * 1.5)*0.5 + 0.5;

        vec2 uv = vec2(vUv.x, vUv.y);
        float y0 = mix(a, b, uv.x);
        float y1 = mix(c, d, uv.x);
        float x0 = mix(a, c, uv.y);
        float x1 = mix(b, d, uv.y);

        uv.x = Hermite(0., 1., 3.*x0, 3.*x1, uv.x);
        uv.y = Hermite(0., 1., 3.*y0, 3.*y1, uv.y);

        vec3 col = texture2D(workTexture, uv).rgb;
        color = vec3(col );
    }



    gl_FragColor = vec4(color, 1.);


}