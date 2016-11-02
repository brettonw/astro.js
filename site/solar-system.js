// radii in km so I can do some reasoning about scales...
const earthRadius = 6378.1370;
const sunRadius = 695700.0;
const earthOrbit = 149597870.700;

const sunDistance = earthOrbit / earthRadius;

// compute the drawDistance so that the actual sun scale is usually about 1
const sunDrawDistance = (sunDistance * earthRadius) / sunRadius;

const moonRadius = 1737.1;
//let moonOrbit = 384405.0;
const moonScale = moonRadius / earthRadius; // approx 0.273

let updateSolarSystem = function (time) {
    // cos and sin routines that work on degrees (unwraps intrinsically)
    let cos = Utility.cos;
    let sin = Utility.sin;

    // compute the julian century
    let jc = time / 36525;

    // compute the ecliptic obliquity (degrees)
    let eclipticObliquity = 23.439291 - (0.0130042 * jc);

    // SUN
    {
        // compute the mean longitude and mean anomaly of the sun (degrees)
        let meanLongitude = 280.460 + (36000.77 * jc);
        let meanAnomaly = 357.5277233 + (35999.05034 * jc);

        // compute the ecliptic longitude of the sun (degrees)
        let eclipticLongitude = meanLongitude + (1.914666471 * sin (meanAnomaly)) + (0.019994643 * sin (meanAnomaly + meanAnomaly));

        // compute the distance to the sun in astronomical units
        solarSystem.sunR = 1.000140612 - (0.016708617 * cos (meanAnomaly)) - (0.000139589 * cos (meanAnomaly + meanAnomaly));

        // compute geocentric equatorial direction, note that these are re-ordered to reflect the
        // rotation of the solar system coordinate frame into my Y-up viewing frame
        let sinEclipticLongitude = sin (eclipticLongitude);
        let I = cos (eclipticLongitude);
        let J = cos (eclipticObliquity) * sinEclipticLongitude;
        let K = sin (eclipticObliquity) * sinEclipticLongitude;
        solarSystem.sunDirection = Float3.normalize ([-I, K, J]);
    }

    // MOON
    {
        let eclipticLongitude = 218.32 + (481267.8813 * jc)
            + (6.29 * sin (134.9 + (477198.85 * jc)))
            - (1.27 * sin (259.2 - (413335.38 * jc)))
            + (0.66 * sin (235.7 + (890534.23 * jc)))
            + (0.21 * sin (269.9 + (954397.70 * jc)))
            - (0.19 * sin (357.5 + (35999.05 * jc)))
            - (0.11 * sin (186.6 + (966404.05 * jc)));

        let eclipticLatitude =
            (5.13 * sin (93.3 + (483202.03 * jc)))
            + (0.28 * sin (228.2 + (960400.87 * jc)))
            - (0.28 * sin (318.3 + (6003.18 * jc)))
            - (0.17 * sin (217.6 - (407332.20 * jc)));

        let horizontalParallax = 0.9508
            + (0.0518 * cos (134.9 + (477198.85 * jc)))
            + (0.0095 * cos (259.2 - (413335.38 * jc)))
            + (0.0078 * cos (235.7 + (890534.23 * jc)))
            + (0.0028 * cos (269.9 + (954397.70 * jc)));

        // compute the distance from the earth to the moon, in earth radii
        solarSystem.moonR = 1.0 / sin (horizontalParallax);

        // compute the geocentric equatorial direction to the moon
        let cosEclipticLongitude = cos (eclipticLongitude);
        let sinEclipticLongitude = sin (eclipticLongitude);
        let cosEclipticLatitude = cos (eclipticLatitude);
        let sinEclipticLatitude = sin (eclipticLatitude);
        let cosEclipticObliquity = cos (eclipticObliquity);
        let sinEclipticObliquity = sin (eclipticObliquity);

        // note that these are re-ordered to reflect the rotation of the solar system coordinate
        // frame into my Y-up viewing frame
        let I = cosEclipticLatitude * cosEclipticLongitude;
        let J = ((cosEclipticObliquity * cosEclipticLatitude * sinEclipticLongitude) - (sinEclipticObliquity * sinEclipticLatitude));
        let K = ((sinEclipticObliquity * cosEclipticLatitude * sinEclipticLongitude) + (cosEclipticObliquity * sinEclipticLatitude));
        solarSystem.moonDirection = Float3.normalize ([-I, K, J]);
    }

    // L1
    {
        // DSCOVR is tracking the L1 point, and seems to be oriented with the geocentric coordinate
        // frame (or the ecliptic, I'm not sure). This is an approximation of that position, at 0.01
        // astronomical units. The actual satellite has a Lissajous orbit around the Earth/Sun line,
        // varying approximately +/- 10 degrees over a 6 month period. I'm unable to find a detailed
        // summary of how to compute the position of the satellite, so I'm just going with L1
        let r = 0.01;
        solarSystem.L1 = Float3.scale (solarSystem.sunDirection, (r * solarSystem.sunR * earthOrbit) / earthRadius);
    }
};
