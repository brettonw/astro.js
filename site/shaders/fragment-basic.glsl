precision highp float;

uniform mat4 normalMatrix;
uniform sampler2D textureSampler;
uniform float outputAlpha;
uniform vec3 lightDirection;
uniform vec3 cameraPosition;

varying vec3 model;
varying vec3 normal;
varying vec2 texture;

void main(void) {
    // basic ambient + lambertian
	vec3 viewVector = normalize (cameraPosition - model);
    vec3 normalVector = normalize ((normalMatrix * vec4 (normal, 0.0)).xyz);

	float cosLightNormalAngle = dot(normalVector, lightDirection);
	float cosViewNormalAngle = dot(normalVector, viewVector);

    //float lighting = (clamp (dot (normal, lightDirection), 0.0, 1.0) * 0.95) + 0.05;
    float diffuse = clamp (cosLightNormalAngle, 0.0, 1.0) * 0.90;
    float ambient = 0.1;
    float lighting = diffuse + ambient;

    vec3 textureColor = texture2D(textureSampler, texture).rgb;
    float textureColorScale = 1.0 - step (10.0 / 255.0, textureColor.r);

    float specularExp = 8.0;
    vec3 reflection = reflect(-lightDirection, normalVector);
    float specularMultiplier = clamp(dot(reflection, viewVector), 0.0, 1.0);
    vec3 specularColor = vec3(1.0, 0.9, 0.8) * (pow(specularMultiplier, specularExp) * 0.33 * textureColorScale);

    vec3 litTextureColor = lighting * textureColor;
    vec3 finalColor = clamp (litTextureColor + specularColor, 0.0, 1.0);

    gl_FragColor = vec4 (finalColor, outputAlpha);
}
