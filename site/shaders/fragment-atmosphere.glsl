precision highp float;

uniform mat4 normalMatrix;
uniform sampler2D textureSampler;
uniform float outputAlpha;
uniform vec3 lightDirection;
uniform vec3 cameraPosition;
uniform float atmosphereDepth;


varying vec3 model;
varying vec3 normal;
varying vec2 texture;

void main(void) {
	vec3 v = normalize (cameraPosition - model);
    vec3 n = normalize ((normalMatrix * vec4 (normal, 0)).xyz);

	float cosLightNormalAngle = dot(n, lightDirection);
	float cosViewNormalAngle = dot(n, v);

	// compute an approximation to how much air the view vector goes through, so we can use that to
	// fog the pixel with the daytime blend color
	float earthRadius = 1.0;
	float totalRadius = earthRadius + atmosphereDepth;
	float earthEdgeAtmosphereTravelDistance = sqrt((totalRadius * totalRadius) - (earthRadius * earthRadius));
	float delta = earthEdgeAtmosphereTravelDistance - atmosphereDepth;
	float cosEarthEdgeAngle = earthEdgeAtmosphereTravelDistance / totalRadius;
	float atmosphereTravelDistance = 1.0 - ((cosViewNormalAngle - cosEarthEdgeAngle) / (1.0 - cosEarthEdgeAngle));
	if (atmosphereTravelDistance > 1.0) {
		atmosphereTravelDistance = cosViewNormalAngle / cosEarthEdgeAngle;
	}

	float daytimeScale = clamp((cosLightNormalAngle + 0.2) * 2.5, 0.0, 1.0);
    //daytimeScale *= daytimeScale;

	// the sky color is faded out according to the proximity to the day/night boundary
	vec3 daytimeLightColor = mix(vec3 (1.0, 0.85, 0.7), vec3 (0.7, 0.85, 1.0), daytimeScale);
	float atmosphere = atmosphereTravelDistance * atmosphereTravelDistance * outputAlpha * sqrt (daytimeScale);
	gl_FragColor = vec4 (daytimeLightColor, atmosphere);
}
