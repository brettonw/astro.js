// https://en.wikipedia.org/wiki/International_Earth_Rotation_and_Reference_Systems_Service
// https://en.wikipedia.org/wiki/Axial_tilt#Obliquity_of_the_ecliptic_.28Earth.27s_axial_tilt.29
// celestial coordinates for axial tilt (aka sun angle) is 23.439281 degrees
// 1 earth rotation is 86,164.098903691 seconds of mean solar time
// 1 earth year is 365.2564 days
// 1 lunar orbit around earth is 29.53 days

// starmaps: https://svs.gsfc.nasa.gov/3895
// earth night textures: http://visibleearth.nasa.gov/view.php?id=79765
//                       http://visibleearth.nasa.gov/view.php?id=55167
// earth day textures: http://visibleearth.nasa.gov/view_cat.php?categoryID=1484&p=1
//                      http://laps.noaa.gov/albers/sos/sos.html
// earth cloud textures: http://visibleearth.nasa.gov/view.php?id=57747
// realtime cloud coverage: http://weather.msfc.nasa.gov/GOES/getsatellite.html
//                          http://weather.msfc.nasa.gov/GOES/satlinks.html
//                          http://cloudsgate2.larc.nasa.gov/index.html
//                          http://cimss.ssec.wisc.edu/
//                          http://eosweb.ssec.wisc.edu/cgi-bin/eosdb.cgi
//                          http://www.ssec.wisc.edu/
//                          http://www.ssec.wisc.edu/data/geo-new/#/animation?satellite=goes-east&end_datetime=latest&n_images=1&coverage=conus&channel=04&image_quality=gif
//                          http://modis-atmos.gsfc.nasa.gov/MOD35_L2/acquiring.html
//                          https://ladsweb.nascom.nasa.gov/data/search.html
//                          https://github.com/jmozmoz/cloudmap
// XXXX THIS ONE! XXX https://apollo.open-resource.org/mission:log:2014:06:17:new-fresh-global-cloudmap-distribution-service-xplanet

// MODIS imagery: https://cdn.earthdata.nasa.gov/conduit/upload/946/MODIS_True_Color.pdf
// realtime terr and aqua MODIS imagery: https://lance.modaps.eosdis.nasa.gov/cgi-bin/imagery/realtime.cgi?date=2016275

// YYY THIS ONE YYY - special... http://www.ospo.noaa.gov/Products/imagery/
// VISIBLE:    http://www.ospo.noaa.gov/data/imagery/gmgsi/GLOBCOMPVIS.2016100315.gif (update every 3 hours, change 2016100315 to 2016100318, 2016100321, etc.
// LONG WAVE:  http://www.ospo.noaa.gov/data/imagery/gmgsi/GLOBCOMPLIR.2016100315.gif
// SHORT WAVE: http://www.ospo.noaa.gov/data/imagery/gmgsi/GLOBCOMPSIR.2016100315.gif

// interesting: http://www.ncdc.noaa.gov/gibbs/
// ftp://geo.msfc.nasa.gov/Weather/
// ftp://geo.msfc.nasa.gov/Weather/TLE/  (I can get track information here)

// moon position: http://www.geoastro.de/elevazmoon/basics/index.htm
// http://astro.wsu.edu/worthey/astro/html/lec-celestial-sph.html
// http://www.stjarnhimlen.se/comp/tutorial.html
// https://www.astronomyhouston.org/sites/default/files/presentations/HAS_Novice_Program_Celestial_Coordinates.pdf

// reference image: http://svs.gsfc.nasa.gov/12321
// http://svs.gsfc.nasa.gov/4404


// mean earth radius: 6,378.1370 km
// midlevel clouds to cirrus layer is 2,000m to 6,000m
// mean moon radius:1737.1
// mean moon orbit radius is 362,600km to 405,400km away (using 384405 as mean)
// mean sun radius: 695,700km
// mean sun distance: 149,597,870.700km

// celestial coordinate system uses vernal equinox as its origin, RA measures eastward, counter-
// clockwise (viewed from above), in the direction of Earth's rotation (measured in hours, minutes,
// seconds, fractional seconds), DEC measures angle positively from equator to north pole
// (measured in angles degrees). So, the Sun's RA/DEC position
// * vernal equinox is (0 hours, 0 degrees)
// * summer solstice is (6 hours, 23.5 degrees)
// * autumnal equinox is (12 hours, 0 degrees)
// * winter solstice is (18 hours, -23.5 degrees)

// ecliptic plane is at 23.5 degrees ()

// sidereal period (rotation of Earth around sun) of Earth is 365.25 days ()

// we will work in J2000

/**
 *
 * @param angle
 * @returns {number}
 */
let angleToRadians = function (angle) {
    let seconds = angle.seconds;
    let minutes = angle.minutes + (seconds / 60.0);
    let circleFraction;
    if ("hours" in angle) {
        let hours = angle.hours + (minutes / 60.0);
        circleFraction = (hours / 24.0);
    } else if ("degrees" in angle) {
        let degrees = angle.degrees + (minutes / 60.0);
        circleFraction = degrees / 360.0;
    }
    return angle.sign * circleFraction * 2.0 * Math.PI;
};

let angleToDegrees = function (angle) {
    let seconds = angle.seconds;
    let minutes = angle.minutes + (seconds / 60);
    let circleFraction;
    if ("hours" in angle) {
        let hours = angle.hours + (minutes / 60);
        circleFraction = (hours / 24.0);
    } else if ("degrees" in angle) {
        let degrees = angle.degrees + (minutes / 60);
        circleFraction = degrees / 360.0;
    }
    return angle.sign * circleFraction * 360.0;
};

let testHourAngleToRadians = function () {
    let affirm = function (description, value, expect) {
        let pass = Math.abs (value - expect) < 1.0e-6;
        if (!pass) {
            console.log (description + ", got (" + value + "), expected (" + expect + "): FAIL");
        }
    };

    affirm ("1h", angleToRadians ({ hours: 1, minutes: 0, seconds: 0 }), (1 / 24) * (2 * Math.PI));
    affirm ("2h", angleToRadians ({ hours: 2, minutes: 0, seconds: 0 }), (2 / 24) * (2 * Math.PI));

    affirm ("1h 30m", angleToRadians ({
        hours: 1,
        minutes: 30,
        seconds: 0
    }), (1.5 / 24) * (2 * Math.PI));
    affirm ("1h 31m", angleToRadians ({
        hours: 1,
        minutes: 31,
        seconds: 0
    }), ((1 + (31 / 60)) / 24) * (2 * Math.PI));

    affirm ("1h 30m 30s", angleToRadians ({
        hours: 1,
        minutes: 30,
        seconds: 30
    }), ((1 + (30 / 60) + (30 / (60 * 60))) / 24) * (2 * Math.PI));
    affirm ("1h 30m 31s", angleToRadians ({
        hours: 1,
        minutes: 30,
        seconds: 31
    }), ((1 + (30 / 60) + (31 / (60 * 60))) / 24) * (2 * Math.PI));
} ();

String.prototype.test = function (re) {
    return re.test (this);
};

let angleFromString = function (string) {
    // ε = 23° 26′ 21″.406 − 46″.836769 T − 0″.0001831 T2 + 0″.00200340 T3 − 0″.576×10−6 T4 − 4″.34×10−8 T5
    // ε = 23° 26′ 21.45″ − 46.815″ T − 0.0006″ T2 + 0.00181″ T3
    // "1h 30m 31s"
    let result = Object.create (null);
    let signIndex = string.indexOf ("-");
    if (signIndex >= 0) {
        result.sign = -1.0;
        string = string.substr (signIndex + 1);
    } else {
        result.sign = 1.0;
    }
    let components = string.split (/[″"s]\s*/i);
    let fractional = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
    components = components[0].split (/[′'m]\s*/i);
    result.seconds = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0) + fractional;

    if (string.test (/[°d]/)) {
        components = components[0].split (/[°d]\s*/i);
        result.minutes = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
        result.degrees = parseFloat (components[0]);
    } else {
        components = components[0].split (/[h]\s*/i);
        result.minutes = parseFloat (((components.length > 1) && (components[1].length > 0)) ? components[1] : 0);
        result.hours = parseFloat (components[0]);
    }
    return result;
};

let bareObjectToString = function (bareObject) {
    let result = "";
    let first = true;
    for (component in bareObject) {
        if (!first) {
            result += " ";
        }
        result += component + ": " + bareObject[component];
        first = false;
    }
    return result;
};

let testHourAngleFromString = function () {
    let affirm = function (angleString, expect) {
        let test = angleFromString (angleString);
        let pass = true;
        for (component in test) {
            pass &= ((component in expect) && (expect[component] == test[component]));
        }
        if (!pass) {
            console.log (angleString + ", got (" + bareObjectToString (test) + "), expected (" + bareObjectToString (expect) + "): FAIL");
        }
    };
    affirm ("23° 26′ 21″.406", { degrees: 23, minutes: 26, seconds: 21.406 });
    affirm ("23° 26′ 21.45″", { degrees: 23, minutes: 26, seconds: 21.45 });
    affirm ("1h 30m 31s", { hours: 1, minutes: 30, seconds: 31 });
    affirm ("46.836769″", { hours: 0, minutes: 0, seconds: 46.836769 });
    affirm ("46″.836769", { hours: 0, minutes: 0, seconds: 46.836769 });
} ();

let eclipticPlaneObliquity = function (t) {
    // Astronomical Almanac for 2010
    // ε = 23° 26′ 21″.406 − 46″.836769 T − 0″.0001831 T2 + 0″.00200340 T3 − 0″.576×10−6 T4 − 4″.34×10−8 T5
    let e = angleToRadians (angleFromString ("23° 26′ 21.406″"));
    e -= (angleToRadians (angleFromString ("0° 0′ 46.836769″"))) * t;
    e -= (angleToRadians (angleFromString ("0° 0′ 0.0001831″"))) * t * t;
    e -= (angleToRadians (angleFromString ("0° 0′ 0.00200340″"))) * t * t * t;
    e -= (angleToRadians (angleFromString ("0° 0′ 5.76e−7″"))) * t * t * t * t;
    e -= (angleToRadians (angleFromString ("0° 0′ 4.34e−8″"))) * t * t * t * t * t;
    return e;
} (16 / 100);
console.log ("Ecliptic Plane Obliquity: " + eclipticPlaneObliquity + "rad");

let utc = function (year, month, day, hour, minutes, seconds) {
    let now = new Date ();
    now.setUTCFullYear (year, month - 1, day);
    now.setUTCHours (hour, minutes, seconds);
    return now;
};

let computeJ2000 = function (date) {
    let hours = date.getUTCHours ();
    let minutes = date.getUTCMinutes ();
    let seconds = date.getUTCSeconds ()
    let h = hours + (minutes / 60) + (seconds / 3600);
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    let y = date.getUTCFullYear ();
    let f = Math.floor;
    return 367 * y - f (7 * (y + f ((m + 9) / 12)) / 4) + f (275 * m / 9) + d - 730531.5 + (h / 24);
};

let computeGmstFromJ2000 = function (jd) {
    let jc = jd / 36525;
    let gmst = 67310.54841 + (((876600 * 60 * 60) + 8640184.812866) * jc) + (0.093104 * jc * jc) - (6.2e-6 * jc * jc * jc);
    return Utility.unwindDegrees (gmst / 240);
};

let computeGmstFromDate = function (date) {
    return computeGmstFromJ2000 (computeJ2000 (date));
};

let testJ2000 = function () {
    let affirm = function (description, got, expected, epsilon) {
        epsilon = (typeof epsilon !== "undefined") ? epsilon : 1.0e-6;
        if (Math.abs (got - expected) > epsilon) {
            console.log (description + ": got (" + got + "), expected (" + expected + ") - FAIL");
        }
    };
    // october 19, 2016, 13:30
    // julian date for 10/19/2016 @ 13:30 is 2457681.062500
    let time = computeJ2000 (utc (2016, 10, 19, 13, 30, 0));
    affirm ("10/19/2016 @ 13:30", time + 2451545, 2457681.062500);
    if (Math.abs (time + 2451545 - 2457681.062500) > 1.0e-6) {
        console.log ("test J2000: got (" + (time + 2451545) + "), expected (2457681.0625)");
    }

    time = computeJ2000 (utc (1992, 8, 20, 12, 14));
    let T_uti = time / 36525;
    affirm ("8/20/1992 @ 12:14", T_uti, -0.073647919);

    let GMST = 67310.54841 + (((876600 * 60 * 60) + 8640184.812866) * T_uti) + (0.093104 * T_uti * T_uti) - (6.2e-6 * T_uti * T_uti * T_uti);
    let gmst_also = ((((-6.2e-6 * T_uti + 0.093104) * T_uti + 184.812866) * T_uti + 67310.54841) + 3.1644e9 * T_uti);
    affirm ("GMST", GMST, -232984181.0909255);
    affirm ("GMST", GMST, gmst_also);
    GMST = Utility.unwind (GMST, 86400);
    affirm ("GMST manageable", GMST, -49781.0909255);
    GMST /= 240;
    affirm ("GMST to degrees", GMST, 152.578878810);

    affirm ("compute GMST", computeGmstFromDate (utc (2016, 10, 19, 13, 30, 0), GMST));

    affirm ("check GMST again", computeGmstFromDate (utc (1995, 10, 1, 0, 0, 0)), 9.257, 1.0e-3);
} ();

// compute an approximation of L1/L2
let lagrange1 = function () {
    let M1 = 1.989e30;
    let M2 = 5.972e24;
    let R = 149597870.700;
    let r_ = Math.pow (M2 / (3 * M1), 0.3333333);
    let r = r_ * R;
    return r;
    console.log ("r_ = " + r_ + "; r = " + r + ";");
} ();
