precision highp float;

uniform mat4 normalMatrix;
uniform sampler2D textureSampler;
uniform float outputAlpha;
uniform vec3 lightDirection;

varying vec3 model;
varying vec3 normal;
varying vec2 texture;

void main(void) {
    vec3 n = normalize ((normalMatrix * vec4 (normal, 0)).xyz);
    float lighting = clamp (dot (normal, lightDirection), 0.0, 1.0);
    vec3 textureColor = texture2D(textureSampler, texture).rgb;
    float alpha = sqrt (dot (textureColor, textureColor)) / sqrt (3.0);
    vec3 litTextureColor = lighting * textureColor;
    gl_FragColor = vec4 (litTextureColor, outputAlpha * alpha);
}
