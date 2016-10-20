precision highp float;

uniform mat4 normalMatrix;
uniform vec3 cameraPosition;
uniform float outputAlpha;
uniform sampler2D textureSampler;
uniform vec3 modelColor;
uniform vec3 ambientLightColor;
uniform float ambientContribution;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform float diffuseContribution;
uniform float specularContribution;
uniform float specularExponent;

// inputs expected from the vertex shader
varying vec3 model;
varying vec3 normal;
varying vec2 texture;

vec3 multiplyColors (const in vec3 left, const in vec3 right) {
    vec3 result = vec3 (left.r * right.r, left.g * right.g, left.b * right.b);
    return result;
}

void main(void) {
    // figure out what color the surface is
    vec3 textureColor = texture2D(textureSampler, texture).rgb;
    vec3 surfaceColor = multiplyColors (textureColor, modelColor);

    // compute the ambient contribution to the surface lighting
    vec3 ambientColor = multiplyColors (ambientContribution * ambientLightColor, surfaceColor);

    // compute the diffuse contribution to the surface lighting
    vec3 normalVector = normalize ((normalMatrix * vec4 (normal, 0.0)).xyz);
	float diffuseMultiplier = clamp (dot(normalVector, lightDirection) * diffuseContribution, 0.0, 1.0);
    vec3 diffuseColor = multiplyColors (diffuseMultiplier * lightColor, surfaceColor);

    // compute the specular contribution to the surface lighting
    vec3 reflection = reflect(-lightDirection, normalVector);
	vec3 viewVector = normalize (cameraPosition - model);
    float specularMultiplier = clamp(dot(reflection, viewVector), 0.0, 1.0);
    vec3 specularColor = lightColor * (pow(specularMultiplier, specularExponent) * specularContribution);

    vec3 finalColor = clamp (ambientColor + diffuseColor + specularColor, 0.0, 1.0);

    gl_FragColor = vec4 (finalColor, outputAlpha);
}
