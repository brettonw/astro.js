precision highp float;

uniform sampler2D textureSampler;
uniform float outputAlpha;

varying vec2 texture;

void main(void) {
    vec3 textureColor = texture2D(textureSampler, texture).rgb;
    gl_FragColor = vec4 (textureColor, outputAlpha);
}
