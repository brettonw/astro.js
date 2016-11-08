precision highp float;

uniform mat4 normalMatrix;
uniform float outputAlpha;

uniform vec3 lightDirection;
uniform vec3 cameraPosition;

uniform sampler2D dayTxSampler;
uniform sampler2D nightTxSampler;
uniform sampler2D specularMapTxSampler;

varying vec3 model;
varying vec3 normal;
varying vec2 texture;

vec3 multiplyColors (const in vec3 left, const in vec3 right) {
    vec3 result = vec3 (left.r * right.r, left.g * right.g, left.b * right.b);
    return result;
}

vec3 screenColor (const in vec3 left, const in vec3 right) {
    vec3 one = vec3 (1.0, 1.0, 1.0);
    vec3 result = one - (multiplyColors (one - left, one - right));
    return result;
}

void main(void) {
    // compute the core vectors we'll need
	vec3 viewVector = normalize (cameraPosition - model);
    vec3 normalVector = normalize ((normalMatrix * vec4 (normal, 0.0)).xyz);

    // standard cosines we'll need
	float cosLightNormalAngle = dot(normalVector, lightDirection);
	float cosViewNormalAngle = dot(normalVector, viewVector);

    // the mapping from day to night
    float daytimeScale = clamp((cosLightNormalAngle + 0.2) * 2.5, 0.0, 1.0);
    daytimeScale *= daytimeScale;

    // get the texture map day color. The maps we are using (from Blue Marble at
    // http://visibleearth.nasa.gov/view_cat.php?categoryID=1484&p=1) are very saturated, so we
    // screen in a bit of a hazy blue based on images from EPIC (http://epic.gsfc.nasa.gov/)
    vec3 dayTxColor = texture2D(dayTxSampler, texture).rgb;
    vec3 hazyBlue = vec3(0.04, 0.07, 0.12);
    dayTxColor = screenColor (dayTxColor, hazyBlue);

    // get the texture map night color, scaled to black as the view angle fades away
    vec3 nightTxColor = texture2D(nightTxSampler, texture).rgb;
    nightTxColor = nightTxColor * cosViewNormalAngle;

    // the two colors are blended by the daytime scale
    vec3 groundColor = mix (nightTxColor, dayTxColor, sqrt (daytimeScale));

    // compute the specular contribution
    float specularExp = 8.0;
    vec3 reflection = reflect(-lightDirection, normalVector);
    float specularMultiplier = clamp(dot(reflection, viewVector), 0.0, 1.0);
    float specularMapTxValue = texture2D(specularMapTxSampler, texture).r;
    vec3 specularColor = vec3(1.0, 0.9, 0.8) * (pow(specularMultiplier, specularExp) * 0.3 * specularMapTxValue);

    vec3 finalColor = clamp (groundColor + specularColor, 0.0, 1.0);

    gl_FragColor = vec4 (finalColor, outputAlpha);
}
