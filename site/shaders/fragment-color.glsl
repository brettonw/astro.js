precision highp float;

uniform float outputAlpha;
uniform vec3 modelColor;

void main(void) {
    gl_FragColor = vec4 (modelColor, outputAlpha);
}
