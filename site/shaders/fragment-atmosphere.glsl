#version 300 es

precision highp float;

uniform float outputAlpha;
uniform vec3 lightDirection;
uniform vec3 cameraPosition;
uniform float atmosphereDepth;

uniform vec4 sunPosition;
uniform vec4 moonPosition;

in vec3 model;
in vec3 normal;
in vec2 uv;

out vec4 fragmentColor;

#define PI 3.14159265358979323846
#define INFLECTION_PT 0.7886751345948128

vec3 v3 (const in vec4 v4) {
    return vec3 (v4.x, v4.y, v4.z);
}

float linearStep (const float edge0, const float edge1, const float x) {
    return clamp ((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float hermite (const float x) {
    return x * x * (3.0 - (2.0 * x));
}

float mystep (const float edge0, const float edge1, const float x) {
    float y = linearStep (edge0, edge1, x);
    return (y < INFLECTION_PT) ? (hermite (INFLECTION_PT) * y / INFLECTION_PT) : hermite(y);
}

float sunVisible (const in vec4 moonPosition, const in vec4 sunPosition) {
    // compute an estimate of the visibility of the sun as a function of the moon as a blocker

    // the positions are reported in 4d space as a 3d location , with the 4th dimension as the
    // radius, start by projecting them for the current fragment

    vec3 sunDelta = v3 (sunPosition) - model;
    float sunDeltaLength = length (sunDelta);
    vec3 A = v3 (moonPosition);
    vec3 moonDelta = A - model;
    float moonDeltaLength = length (moonDelta);
    float projectionRatio = moonDeltaLength / sunDeltaLength;
    vec3 B = model + (sunDelta * projectionRatio);

    // compute the delta and radius values that we'll need
    float d = length (B - A);
    float rA = moonPosition.w;
    float rB = sunPosition.w * projectionRatio;

    // we'll need the areas of the two circles
    float aArea = rA * rA * PI;
    float bArea = rB * rB * PI;

    // compute my interpolated shortcut approximation
    float baseline = max (0.0, (bArea - aArea) / bArea);
    float edge0 = abs (rA - rB);
    float edge1 = rA + rB;
    float visibility = baseline + (mystep(edge0, edge1, d) * (1.0 - baseline));
    return visibility;
}

vec3 smoothmix (const in vec3 a, const in vec3 b, const in float t) {
    return mix (a, b, smoothstep (0.0, 1.0, t));
}

void main(void) {
	vec3 v = normalize (cameraPosition - model);
    vec3 n = normalize (normal);

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

    float daytimeScale = clamp((cosLightNormalAngle + 0.2) * 2.5, 0.0, 1.0) * sunVisible (moonPosition, sunPosition);
    //daytimeScale *= daytimeScale;

	// the sky color is faded out according to the proximity to the day/night boundary
	vec3 daytimeLightColor = smoothmix (vec3 (1.0, 0.85, 0.7), vec3 (0.7, 0.85, 1.0), daytimeScale);
	float atmosphere = atmosphereTravelDistance * atmosphereTravelDistance * outputAlpha * daytimeScale;
    fragmentColor = vec4 (daytimeLightColor, atmosphere);
}
