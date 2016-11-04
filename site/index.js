"use strict;"

let starsScene;
let solarSystemScene;

let standardUniforms = Object.create(null);

let showStarsCheckbox;
let showConstellationsCheckbox;
let showCloudsCheckbox;
let showAtmosphereCheckbox;
let zoomRange;
let fovRange;
let timeRange;
let dayRange;

let starsNode;
let constellationsNode;
let cloudsNode;
let atmosphereNode;

let timeDisplay;

let solarSystem = Object.create (null);

let scaleRange = function (range, deadZone) {
    let rangeValue = range.value;
    let rangeMax = range.max;
    let rangeMid = rangeMax / 2;
    rangeValue -= rangeMid;
    rangeValue *= (1 + deadZone);
    let rawOffset = Math.max (0, Math.abs (rangeValue) - (deadZone * rangeMid));
    return (Math.sign (rangeValue) * rawOffset) / rangeMid;
};

// interesting points in time
let currentTime;
let geo_2016_11_1_1200 = computeJ2000 (utc (2016, 11, 1, 18, 0, 0));
let eclipse2017 = computeJ2000 (utc (2017, 8, 21, 18, 0, 0));
let dscovrMoonTransit2015 = computeJ2000 (utc (2015, 7, 16, 0, 0, 0));

let refreshTimeoutId = 0;
let draw = function (deltaPosition) {
    // ensure the draw function is called about once per minute to keep the display refreshed
    if (refreshTimeoutId != 0) {
        clearTimeout (refreshTimeoutId);
    }
    refreshTimeoutId = setTimeout(function () { draw ([0, 0]); }, 1000 * 60);

    // determine how to set the clock
    let timeType = document.getElementById ("timeTypeSelect").value;
    switch (timeType) {
        case "paused": break;
        case "current": currentTime = computeJ2000 (new Date ()); break;
        case "eclipse-2017": currentTime = eclipse2017; break;
        case "DSCOVR-2015": currentTime = dscovrMoonTransit2015;
        case "2016111-1200": currentTime = geo_2016_11_1_1200;
    }
    let hourDelta = scaleRange(timeRange, 0.025) * 2.0;
    let dayDelta = scaleRange(dayRange, 0.025) * 180.0;
    let displayTime = currentTime + dayDelta + hourDelta;
    updateSolarSystem (displayTime);
    Thing.updateAll(displayTime);

    // XXX convert from our display time to a Javascript Date
    timeDisplay.innerHTML = displayTime.toFixed(4) + " (" + currentTime.toFixed (4) + ", " + (dayDelta + hourDelta).toFixed (4) + ")";

    // set up the view parameters
    let zoomRangeValue = zoomRange.value;
    zoomRangeValue *= 0.01;
    let zoomRangeValueInverse = 1.0 - zoomRangeValue;

    let fovRangeValue = fovRange.value;
    fovRangeValue *= 0.01;
    let fovRangeValueInverse = 1.0 - fovRangeValue;
    starsNode.alpha = Math.sqrt (fovRangeValueInverse);
    let fov = 1.0 + (59.0 * fovRangeValueInverse);

    // get the selected camera and tease out the parameters for it
    let cameraSelect = document.getElementById ("cameraSelect").value;
    let cameraSelectSplit = cameraSelect.split(";");
    let cameraFrom = cameraSelectSplit[0];
    let lookFromNode = Node.get (cameraFrom);
    let cameraTo = cameraSelectSplit[1];
    let lookAtNode = Node.get (cameraTo);
    let cameraUp = Utility.defaultValue (cameraSelectSplit[2], "y-up");

    // get the "to" node origin
    let lookAtTransform = lookAtNode.getTransform ();
    let lookAtPoint = Float4x4.preMultiply ([0, 0, 0, 1], lookAtTransform);
    //console.log ("LOOK AT: " + Float3.str (lookAtPoint));

    // update the orbit camera if we should
    if (cameraFrom == "camera") {
        if (!(cameraTo in lookFromNode.currentPosition)) {
            lookFromNode.currentPosition[cameraTo] = [0, 0];
        }

        // update the current controller position and clamp or wrap accordingly
        let currentPosition = Float2.add (lookFromNode.currentPosition[cameraTo], deltaPosition);
        currentPosition[0] = Utility.unwind (currentPosition[0], 2);
        currentPosition[1] = Math.max (Math.min (currentPosition[1], 0.9), -0.9);
        lookFromNode.currentPosition[cameraTo] = currentPosition;

        // compute a few image composition values based off ensuring a sphere is fully in view
        // XXX for now, we assume the bound on the observed object is 1, but I need to get bounds
        // XXX on the nodes to be really effective
        let boundRadius = 1.0;
        let goalOpposite = boundRadius / ((zoomRangeValue * 0.9) + 0.1);
        let sinTheta = Utility.sin (fov / 2.0);
        let distance = goalOpposite / sinTheta;
        //console.log ("Hypotenuse = " + hypotenuse);

        // setup the transformation matrix
        lookFromNode.transform = Float4x4.chain (
            Float4x4.translate ([distance, 0, 0]),
            Float4x4.rotateZ (currentPosition[1] * Math.PI * 0.5),
            Float4x4.rotateY (currentPosition[0] * Math.PI * -1),
            Float4x4.translate (lookAtPoint)
        );
    }

    // get the "from" node origin
    let lookFromTransform = lookFromNode.getTransform ();
    let lookFromPoint = Float4x4.preMultiply ([0, 0, 0, 1], lookFromTransform);
    //console.log ("LOOK FROM: " + Float3.str (lookFromPoint));

    // figure the up vector
    let up = [0, 1, 0];
    if (cameraUp != "y-up") {
        let upNode = Node.get (cameraUp);
        let upTransform = upNode.getTransform ();
        let upPoint = Float4x4.preMultiply ([0, 0, 0, 1], upTransform);
        up = Float3.normalize (Float3.subtract (upPoint, lookFromPoint));
    }

    // compute the view matrix
    let viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, up);

    // update the visibility layers
    starsNode.enabled = showStarsCheckbox.checked;
    constellationsNode.enabled = showConstellationsCheckbox.checked;

    // ordinarily, webGl will automatically present and clear when we return control to the
    // event loop from the draw function, but we overrode that to have explicit control.
    // webGl still presents the buffer automatically, but the back buffer is not cleared
    // until we do it...
    context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

    // draw the scene
    let starsViewMatrix = Float4x4.copy (viewMatrix);
    starsViewMatrix[12] = starsViewMatrix[13] = starsViewMatrix[14] = 0.0;
    standardUniforms.CAMERA_POSITION = [0, 0, 0];
    standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (fov, context.viewportWidth / context.viewportHeight, 1000, starSphereRadius * 1.1);
    standardUniforms.VIEW_MATRIX_PARAMETER = starsViewMatrix;
    standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.identity ();
    starsScene.traverse (standardUniforms);

    // update the visibility layers
    cloudsNode.enabled = showCloudsCheckbox.checked;
    atmosphereNode.enabled = showAtmosphereCheckbox.checked;

    // set up to draw the solar system
    standardUniforms.VIEW_MATRIX_PARAMETER = viewMatrix;
    standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.identity ();

    // compute the camera position and set it in the standard uniforms
    let vmi = Float4x4.inverse (viewMatrix);
    standardUniforms.CAMERA_POSITION = [vmi[12], vmi[13], vmi[14]];
    //console.log ("CAMERA AT: " + Float3.str (standardUniforms.CAMERA_POSITION));

    // look at where the camera is and set the near and far planes accordingly
    // set up the projection matrix
    let cameraPositionDistance = Float3.norm (standardUniforms.CAMERA_POSITION);
    let moonR = solarSystem.moonR * 1.1;
    let nearPlane = Math.max (0.1, cameraPositionDistance - moonR);
    let farPlane = cameraPositionDistance + moonR;
    standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (fov, context.viewportWidth / context.viewportHeight, nearPlane, farPlane);
    solarSystemScene.traverse (standardUniforms);
};

let selectCamera = function () {
    let cameraSelect = document.getElementById ("cameraSelect").value;
    let cameraSelectSplit = cameraSelect.split (";");
    let cameraFov = Utility.defaultValue (cameraSelectSplit[3], 0.5);
    fovRange.value = fovRange.max * cameraFov;
    draw ([0, 0]);
};


let buildScene = function () {
    makeRevolve ("cylinder",
        [[1.0, 1.0], [1.0, -1.0], [1.0, -1.0], [0.8, -1.0], [0.8, -1.0], [0.8, 1.0], [0.8, 1.0], [1.0, 1.0]],
        [[1.0, 0.0], [1.0, 0.0], [0.0, -1.0], [0.0, -1.0], [-1.0, 0.0], [-1.0, 0.0], [0.0, 1.0], [0.0, 1.0]],
        36);
    makeBall ("ball", 72);
    makeBall ("ball-small", 36);

    starsScene = Node.new ({
        state: function (standardUniforms) {
            context.disable (context.DEPTH_TEST);
            context.depthMask (false);
        },
    });

    // stars are in their own scene so they can be drawn to track the camera
    // rotate by 180 degrees on the x axis to account for our coordinate system, then Y by 180
    // degrees to orient correctly. then flip it inside out and scale it up
    let starsTransform = Float4x4.chain (
        Float4x4.rotateX (Math.PI),
        Float4x4.rotateY (Math.PI),
        Float4x4.scale (-starSphereRadius)
    );
    starsNode = Node.new ({
        name: "stars",
        transform: starsTransform,
        state: function (standardUniforms) {
            Program.get ("texture").use ();
            standardUniforms.TEXTURE_SAMPLER = "starfield";
            standardUniforms.OUTPUT_ALPHA_PARAMETER = starsNode.alpha;
        },
        shape: "ball"
    });
    starsScene.addChild (starsNode);

    constellationsNode = Node.new ({
        name: "constellations",
        state: function (standardUniforms) {
            Program.get ("overlay").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = starsNode.alpha * 0.25;
            standardUniforms.TEXTURE_SAMPLER = "constellations";
        },
        shape: "ball",
        children: false
    });
    starsNode.addChild (constellationsNode);

    let sunNode = Node.new ({
        name: "sun",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            Program.get ("color").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            standardUniforms.MODEL_COLOR = [255, 241, 234];
        },
        shape: "ball",
        children: false
    });
    starsScene.addChild (sunNode);

    Thing.new ("sun", "sun", function (time) {
        // get the node
        let node = Node.get (this.node);

        let R = sunDistance * solarSystem.sunR;
        let sunPosition = Float3.scale (solarSystem.sunDirection, R);

        // compute the relative scale of the sun to reflect the changing distance in our orbit
        let sunScale = (sunRadius / earthRadius) * (sunDistance / R);

        // compute the position of the sun, and update the lighting direction
        node.transform = Float4x4.multiply (Float4x4.scale (sunScale), Float4x4.translate (sunPosition));
        standardUniforms.LIGHT_DIRECTION = solarSystem.sunDirection;
    });

    // now the solar system
    solarSystemScene = Node.new ({
        state: function (standardUniforms) {
            context.enable (context.DEPTH_TEST);
            context.depthMask (true);
        }
    });

    // add a root camera node
    let cameraNode = Node.new ({
        name: "camera",
        transform: Float4x4.translate([0.0, 0.0, 8.0]),
        children: false
    });
    cameraNode.currentPosition = Object.create (null);
    solarSystemScene.addChild (cameraNode);

    let moonNode = Node.new ({
        name: "moon",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            Program.get ("basic-texture").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            standardUniforms.TEXTURE_SAMPLER = "moon";
            standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
            standardUniforms.AMBIENT_CONTRIBUTION = 0.1;
            standardUniforms.DIFFUSE_CONTRIBUTION = 0.9;
            standardUniforms.SPECULAR_CONTRIBUTION = 0.05;
            standardUniforms.SPECULAR_EXPONENT = 8.0;
        },
        shape: "ball-small",
        children: false
    });
    solarSystemScene.addChild (moonNode);

    Thing.new ("moon", "moon", function (time) {
        // get the node
        let node = Node.get (this.node);

        // set the moon position and orientation in transform
        node.transform = Float4x4.chain (
            Float4x4.scale (moonScale),
            Float4x4.rotateXAxisTo (solarSystem.moonDirection),
            Float4x4.translate (Float3.scale (solarSystem.moonDirection, solarSystem.moonR)));
    });

    let worldNode = Node.new ({
        name: "world",
        transform: Float4x4.identity ()
    });
    solarSystemScene.addChild (worldNode);

    let useTest = false;

    let testNode = Node.new ({
        name: "test",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            Program.get ("hardlight").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            standardUniforms.TEXTURE_SAMPLER = "earth-plate-carree";
            standardUniforms.MODEL_COLOR = [1.1, 1.1, 1.1];
            standardUniforms.AMBIENT_CONTRIBUTION = 0.5;
            standardUniforms.DIFFUSE_CONTRIBUTION = 0.5;
        },
        shape: "ball",
        enabled: useTest,
        children: false
    });
    worldNode.addChild (testNode);

    let earthRenderNode = Node.new ({
        enabled:(!useTest)
    });
    worldNode.addChild (earthRenderNode);

    let earthNode = Node.new ({
        name: "earth",
        state: function (standardUniforms) {
            Program.get ("earth").use ()
                .setDayTxSampler ("earth-day")
                .setNightTxSampler ("earth-night")
                .setSpecularMapTxSampler ("earth-specular-map");
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
        },
        shape: "ball"
    });
    earthRenderNode.addChild (earthNode);

    // add geostationary satellites (orbit over equator at altitude of ~35,780 km)
    // * MSG _MSG3_ "Meteosat 2nd Generation (aka SEVIRI)" (000.0E) (infrared channels 4)
    // * MET _MET7_ "Meteosat VISSR (aka IODC)" (057.0E) (infrared channel 2)
    // * GOES _GOES13_ "US GOES East" (075.0W) (infrared channel 2)
    // * GOES _GOES15_ "US GOES West" (135.0W) (infrared channel 2)
    // * MTSAT _MTSAT3_ "Himawari 8" (140.7E)
    let addGeoSatellite = function (name, longitude) {
        let geoAltitude = 35780 / earthRadius;
        let geoTransform = Float4x4.chain (
            Float4x4.scale (0.01),
            Float4x4.translate ([geoAltitude, 0, 0]),
            // very slight inclinations
            //Float4x4.rotateZ (Utility.degreesToRadians (0.18)),
            Float4x4.rotateY (Utility.degreesToRadians (180 + longitude))
        );
        let geoNode = Node.new ({
            name: name,
            transform: geoTransform,
            state: function (standardUniforms) {
                Program.get ("basic").use ();
                standardUniforms.MODEL_COLOR = [1.0, 0.5, 0.5];
            },
            shape: "ball-small",
            children: false
        });
        earthRenderNode.addChild (geoNode);
    };
    addGeoSatellite ("MSG3", 0.0);
    addGeoSatellite ("MET7", 57.0);
    addGeoSatellite ("GOES13", -75.0);
    addGeoSatellite ("GOES15", -135.0);
    addGeoSatellite ("MTSAT3", 140.7);

    // add some geo markers
    let addGeoMarker = function (name, radius, latitude, longitude) {
        let geoMarkerTransform = Float4x4.chain (
            Float4x4.scale (0.02),
            Float4x4.translate ([radius, 0, 0]),
            Float4x4.rotateZ (Utility.degreesToRadians (latitude)),
            Float4x4.rotateY (Utility.degreesToRadians (180 + longitude))
        );
        let geoMarkerNode = Node.new ({
            name: name,
            transform: geoMarkerTransform,
            children: false
        });
        earthNode.addChild (geoMarkerNode);
    };
    addGeoMarker ("baltimore", 1.001, 39.2904, -76.6122);
    addGeoMarker ("b-z", 1.001, 39.2904, -76.0);
    addGeoMarker ("b-y", 1.1, 39.2904, -76.6122);

    // clouds at 40km is a bit on the high side..., but it shows well
    let cloudHeight = (40 + earthRadius) / earthRadius;
    cloudsNode = Node.new ({
        name: "clouds",
        transform: Float4x4.scale (cloudHeight),
        state: function (standardUniforms) {
            Program.get ("clouds").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.90;
            standardUniforms.TEXTURE_SAMPLER = "clouds";
        },
        shape: "ball",
        children: false
    });
    earthRenderNode.addChild (cloudsNode);

    // atmosphere at 160km is actually in about the right place
    let atmosphereDepth = (160 + earthRadius) / earthRadius;
    atmosphereNode = Node.new ({
        name: "clouds",
        transform: Float4x4.scale (atmosphereDepth),
        state: function (standardUniforms) {
            Program.get ("atmosphere").use ()
                .setAtmosphereDepth (atmosphereDepth - 1.0);
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.5;
        },
        shape: "ball",
        children: false
    });
    earthRenderNode.addChild (atmosphereNode);

    Thing.new ("world", "world", function (time) {
        // get the node
        let node = Node.get (this.node);


        // where D is the number of UT1 days since J2000
        //let D = floor (time);
        let gmst = computeGmstFromJ2000 (time);
        node.transform = Float4x4.rotateY (Utility.degreesToRadians (gmst));
    });

    let dscovrNode = Node.new ({
        name: "DSCOVR",
        transform:Float4x4.identity,
        /*
        state: function (standardUniforms) {
            Program.get ("basic").use ();
            standardUniforms.MODEL_COLOR = [1.0, 0.5, 0.5];
        },
        shape: "ball-small",
        */
        children:false
    });
    solarSystemScene.addChild (dscovrNode);

    Thing.new ("DSCOVR", "DSCOVR", function (time) {
        // get the node, and set the L1 transform - because our system is scaled around the
        // earth/moon region, we scale this down to fit...
        let node = Node.get (this.node);
        node.transform = Float4x4.translate (Float3.scale (solarSystem.L1, 0.5));
    });

    //LogLevel.set (LogLevel.TRACE);
    draw ([0, 0]);
};

let mouseWheel = function (event) {
    console.log ("e: " + event.wheelDelta);
    if (event.wheelDelta > 0) {
        fovRange.stepUp (1);
    } else if (event.wheelDelta < 0) {
        fovRange.stepDown (1);
    }
    draw ([0, 0]);
    return (event.returnValue = false);
};

let onBodyLoad = function () {
    MouseTracker.new ("render-canvas", OnReady.new (null, function (deltaPosition) {
        draw (deltaPosition);
    }), 0.01);
    document.addEventListener ("mousewheel", mouseWheel, false);

    Render.new ("render-canvas");

    // a few common context details, clear color, backface culling, and blend modes
    context.clearColor (0.0, 0.0, 0.0, 1.0);
    context.enable (context.CULL_FACE);
    context.cullFace (context.BACK);
    context.blendFunc (context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
    context.enable (context.BLEND);

    // a little bit of setup for lighting
    standardUniforms.AMBIENT_LIGHT_COLOR = [1.0, 1.0, 1.0];
    standardUniforms.LIGHT_COLOR = [1.0, 1.0, 1.0];

    showStarsCheckbox = document.getElementById ("showStarsCheckbox");
    showConstellationsCheckbox = document.getElementById ("showConstellationsCheckbox");
    showCloudsCheckbox = document.getElementById("showCloudsCheckbox");
    showAtmosphereCheckbox = document.getElementById("showAtmosphereCheckbox");
    zoomRange = document.getElementById("zoomRange");
    fovRange = document.getElementById("fovRange");
    timeRange = document.getElementById ("timeRange");
    dayRange = document.getElementById ("dayRange");
    timeDisplay = document.getElementById("timeDisplay");

    // load the basic shaders from the original soure
    LoaderShader.new ("http://webgl-js.azurewebsites.net/site/shaders/@.glsl")
        .addVertexShaders ("basic")
        .addFragmentShaders([ "basic", "basic-texture", "color", "overlay", "texture" ])
        .go (null, OnReady.new (null, function (x) {
            Program.new ("basic");
            Program.new ("basic-texture", { vertexShader: "basic" });
            Program.new ("color", { vertexShader: "basic" });
            Program.new ("overlay", { vertexShader: "basic" });
            Program.new ("texture", { vertexShader: "basic" });

            // load the astro specific shaders, and build the programs
            LoaderShader.new ("shaders/@.glsl")
                .addFragmentShaders([ "earth", "clouds", "atmosphere", "hardlight" ])
                .go (null, OnReady.new (null, function (x) {
                    Program.new ("earth", { vertexShader: "basic" });
                    Program.new ("clouds", { vertexShader: "basic" });
                    Program.new ("atmosphere", { vertexShader: "basic" });
                    Program.new ("hardlight", { vertexShader: "basic" });

                    // load the textures
                    LoaderPath.new ({ type:Texture, path:"textures/@.png"})
                        .addItems (["clouds", "earth-day", "earth-night", "earth-specular-map", "moon"], { generateMipMap: true })
                        .addItems (["starfield", "constellations"])
                        .go (null, OnReady.new (null, function (x) {
                            LoaderPath.new ({ type:Texture, path:"textures-test/@.png"})
                                .addItems ("earth-plate-carree")
                                .go (null, OnReady.new (null, function (x) {
                                    buildScene ();
                                }));
                        }));

                }));
        }));

};
