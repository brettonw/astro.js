const daysPerJulianCentury = 36525.0;

// radii in km so I can do some reasoning about scales...
const earthRadius = 6378.1370;
const sunRadius = 695700.0;
const earthOrbit = 149597870.700;

const sunDistance = earthOrbit / earthRadius;
const starSphereRadius = sunDistance + 1.0;

const moonRadius = 1737.1;
//let moonOrbit = 384405.0;
const moonScale = moonRadius / earthRadius; // approx 0.273
const moonSiderealMonth = daysPerJulianCentury / 27.321662; // one rotation per, on average...

let updateSolarSystem = function (time) {
    // cos and sin routines that work on degrees (unwraps intrinsically)
    let cos = Utility.cos;
    let sin = Utility.sin;

    // compute the julian century, time is already a J2000 date
    let jc = time / daysPerJulianCentury;

    // SUN
    {
        let  computeSunPosition = function (t_jc) {
            let result = Object.create (null);

            // compute the mean longitude and mean anomaly of the sun (degrees)
            let meanLongitude = 280.460 + (36000.77 * t_jc);
            let meanAnomaly = 357.5277233 + (35999.05034 * t_jc);

            // compute the ecliptic longitude of the sun (degrees)
            let eclipticLongitude = meanLongitude + (1.914666471 * sin (meanAnomaly)) + (0.019994643 * sin (meanAnomaly + meanAnomaly));

            // compute the distance to the sun in astronomical units
            result.r = 1.000140612 - (0.016708617 * cos (meanAnomaly)) - (0.000139589 * cos (meanAnomaly + meanAnomaly));

            // compute the ecliptic obliquity (degrees)
            let eclipticObliquity = 23.439291 - (0.0130042 * t_jc);

            // compute geocentric equatorial direction, note that these are re-ordered to reflect the
            // rotation of the solar system coordinate frame into my Y-up viewing frame
            let sinEclipticLongitude = sin (eclipticLongitude);
            let I = cos (eclipticLongitude);
            let J = cos (eclipticObliquity) * sinEclipticLongitude;
            let K = sin (eclipticObliquity) * sinEclipticLongitude;
            result.direction = Float3.normalize ([-I, K, J]);

            return result;
        };

        let sunPosition = computeSunPosition (jc);
        solarSystem.sunR = sunPosition.r;
        solarSystem.sunDirection = sunPosition.direction;
    }

    // MOON
    {
        // function to compute the moon position at a time
        let computeMoonPosition = function (t_jc) {
            let result = Object.create (null);

            let eclipticLongitude = 218.32 + (481267.8813 * t_jc)
                + (6.29 * sin (134.9 + (477198.85 * t_jc)))
                - (1.27 * sin (259.2 - (413335.38 * t_jc)))
                + (0.66 * sin (235.7 + (890534.23 * t_jc)))
                + (0.21 * sin (269.9 + (954397.70 * t_jc)))
                - (0.19 * sin (357.5 + (35999.05 * t_jc)))
                - (0.11 * sin (186.6 + (966404.05 * t_jc)));

            let eclipticLatitude =
                (5.13 * sin (93.3 + (483202.03 * t_jc)))
                + (0.28 * sin (228.2 + (960400.87 * t_jc)))
                - (0.28 * sin (318.3 + (6003.18 * t_jc)))
                - (0.17 * sin (217.6 - (407332.20 * t_jc)));

            let horizontalParallax = 0.9508
                + (0.0518 * cos (134.9 + (477198.85 * t_jc)))
                + (0.0095 * cos (259.2 - (413335.38 * t_jc)))
                + (0.0078 * cos (235.7 + (890534.23 * t_jc)))
                + (0.0028 * cos (269.9 + (954397.70 * t_jc)));

            // compute the distance from the earth to the moon, in earth radii
            result.r = 1.0 / sin (horizontalParallax);

            // compute the ecliptic obliquity (degrees)
            let eclipticObliquity = 23.439291 - (0.0130042 * t_jc);

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
            result.direction = Float3.normalize ([-I, K, J]);

            return result;
        };

        let moonPosition = computeMoonPosition(jc);
        solarSystem.moonR = moonPosition.r;
        solarSystem.moonDirection = moonPosition.direction;

        // XXX this is wrong, but pretty close... I need to rotate the moon on its axis, and then
        // XXX rotate its axis in the right place. For the moment, this shows the affect of
        // XXX libration due to the eccentricity of the moon's orbit, but does not PERFECTLY match
        // XXX any reference values I can find.

        // XXX I *think* I am only missing the moon's axial tilt... it's only about 1.5 degrees
        // XXX OR... the angle is bigger, because the moon is rotated about 1.5 degrees off the
        // XXX ecliptic. If the angle is greater, it's probably effectively a rotation around the
        // XXX X-axis, giving a small apparent error, because my result right now matches several
        // XXX reference sources pretty closely (just not perfectly)

        // XXX I am unable to find any computation for the moon's orientation that is an explicit
        // XXX statement of its physical rotation around its own axis from some starting point...
        // XXX clearly I am thinking about this problem very differently than other people do

        // compute the moon position at J2000, and spew an angle on the y-axis to use as a J2000
        // origin
        /*
        let moonPositionJ2000 = computeMoonPosition(0);
        let angle = Math.atan2(moonPositionJ2000.direction[0], moonPositionJ2000.direction[2]);
        angle = Utility.radiansToDegrees (angle) - 90.0;
        console.log("moonPositionJ2000 = " + angle + " degrees");

        // the angle is 42.427549902001715
        */

        // compute the current rotation of the moon as a function of the rotational period. I
        // *think* this should be the sideral month, and I got the libration for the J2000 origin
        // from a Java App at http://jgiesen.de/moonlibration/index.htm
        solarSystem.moonTheta = Utility.degreesToRadians (42.427549902001715 + -6.77 + (360.0 * moonSiderealMonth * jc));

    }

    // positions for rendering eclipse
    {
        // figure a coordinate system for the sun
        let zAxis = solarSystem.sunDirection;
        let xAxis = Float3.normalize (Float3.cross ([0, 1, 0], zAxis));
        let yAxis = Float3.normalize (Float3.cross (zAxis, xAxis));

        // project the moon into the solar coordinate system, both in earth radii
        let sp = Float3.scale (solarSystem.sunDirection, (solarSystem.sunR * sunDistance));
        solarSystem.sunPosition = [sp[0], sp[1], sp[2], sunRadius / earthRadius];
        let mp = Float3.scale (solarSystem.moonDirection, solarSystem.moonR);
        solarSystem.moonPosition = [mp[0], mp[1], mp[2], moonRadius / earthRadius];
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
