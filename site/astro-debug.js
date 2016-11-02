"use strict;"
// class hierarchy


// default values...


var TestContainer = function () {
    var _ = Object.create (null);

    // test design philosophy is to be verbose on failure, and silent on pass
    let assertEquals = function (msg, a, b) {
        a = (!isNaN (a)) ? Utility.fixNum (a) : a;
        b = (!isNaN (b)) ? Utility.fixNum (b) : b;
        if (a != b) {
            LogLevel.say (LogLevel.ERROR, "(FAIL ASSERTION) " + msg + " (" + a + " == " + b + ")");
            return false;
        }
        return true;
    };

    let assertArrayEquals = function (msg, a, b) {
        if (a.length == b.length) {
            for (let i = 0; i < a.length; ++i) {
                if (!assertEquals(msg + "[" + i + "]", a[i], b[i])) {
                    return false;
                }
            }
            return true;
        } else {
            LogLevel.say (LogLevel.ERROR, msg + " (mismatched arrays, FAIL ASSERTION)");
            return false;
        }
    };

    let tests = [
        function () {
            LogLevel.say (LogLevel.INFO, "Blah blah...");
        }
    ];

    _.runTests = function () {
        LogLevel.say (LogLevel.INFO, "Running Tests...");
        for (let test of tests) {
            test ();
        }
        LogLevel.say (LogLevel.INFO, "Finished Running Tests.");
    };

    return _;
} ();

TestContainer.runTests();
