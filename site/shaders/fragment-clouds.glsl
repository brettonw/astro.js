precision highp float;

uniform mat4 normalMatrix;
uniform sampler2D textureSampler;
uniform float outputAlpha;
uniform vec3 lightDirection;

varying vec3 model;
varying vec3 normal;
varying vec2 texture;

void main(void) {
    vec3 normalVector = normalize ((normalMatrix * vec4 (normal, 0.0)).xyz);
	float cosLightNormalAngle = dot(normalVector, lightDirection);
	float daytimeScale = clamp((cosLightNormalAngle + 0.2) * 2.5, 0.0, 1.0);
    float alpha = texture2D(textureSampler, texture).r;

    // note: we dim the clouds just a tad to match imagery from EPIC (http://epic.gsfc.nasa.gov/)
	vec3 daytimeLightColor = mix(vec3 (1.0, 0.85, 0.7), vec3 (1.0, 1.0, 1.0), daytimeScale) * daytimeScale * 0.95;
    gl_FragColor = vec4 (daytimeLightColor, outputAlpha * alpha);
}
