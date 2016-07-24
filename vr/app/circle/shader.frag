varying vec2 vUv;

void main(){
    float alpha;
    float dis = distance(vec2(0.5, 0.5), vUv);
    alpha = clamp( (0.5*0.5-dis)*10. , 0.0, 0.8);

    gl_FragColor = vec4(0.2, 0.2, 0.2, alpha);
}