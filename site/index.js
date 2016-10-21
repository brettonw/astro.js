"use strict;"

let scene;

//let currentTime = computeJ2000 (utc (2016, 3, 21, 6, 0, 0));
//let currentTime = computeJ2000 (utc (2016, 10, 19, 7, 0, 0));
let currentTime = computeJ2000 (new Date ());

let currentPosition = [0, 0];

let standardUniforms = Object.create(null);

let showConstellationsCheckbox;
let showCloudsCheckbox;
let showAtmosphereCheckbox;
let fovRange;
let framingRange;

let starsNode;
let constellationsNode;
let cloudsNode;
let atmosphereNode;

let draw = function (deltaPosition) {
    if (Float2.normSq (deltaPosition) == 0) {
        // advance the clock by an hour
        //currentTime += 0.125;
        // update all the things...
        Thing.updateAll(currentTime);
    }

    // update the current position and clamp or wrap accordingly
    currentPosition = Float2.add (currentPosition, deltaPosition);
    while (currentPosition[0] > 1) {
        currentPosition[0] -= 2;
    }
    while (currentPosition[0] < -1) {
        currentPosition[0] += 2;
    }
    currentPosition[1] = Math.min (currentPosition[1], 0.9);
    currentPosition[1] = Math.max (currentPosition[1], -0.9);

    // set up the projection matrix (earth radius is 1 and we want it to occupy about 75% of the
    // view in the vertical direction - the view is probably wider than that)
    let fovRangeValue = fovRange.value;
    fovRangeValue *= 0.01;
    fovRangeValue *= fovRangeValue;
    fovRangeValue = 1.0 - fovRangeValue;
    starsNode.alpha = fovRangeValue;
    fovRangeValue = 0.5 + (59.5 * fovRangeValue);

    let framingRangeValue = framingRange.value;
    framingRangeValue *= 0.01;
    framingRangeValue = 0.1 + (0.9 * framingRangeValue);

    let fov = fovRangeValue;
    let halfFov = fov / 2.0;
    let goalOpposite = 1.0 / framingRangeValue;
    let sinTheta = Math.sin(Utility.degreesToRadians (halfFov));
    let hypotenuse = goalOpposite / sinTheta;
    //console.log("Setting Projection at: " + hypotenuse);
    // I'm cheating with the near/far, I know the moon and anything orbiting it is the farthest out
    // we'll want to see on the near side, and the starfield on the far side
    let nearPlane = Math.max (0.1, hypotenuse - 80.0);
    let farPlane = hypotenuse + 211.0;
    standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (fov, context.viewportWidth / context.viewportHeight, nearPlane, farPlane, Float4x4.create ());

    // compute the view parameters as up or down, and left or right
    let upAngle = currentPosition[1] * Math.PI * 0.5;
    let viewOffset = Float2.scale ([Math.cos (upAngle), Math.sin (upAngle)], -hypotenuse);

    // setup the view matrix
    let viewMatrix = Float4x4.identity ();
    Float4x4.rotateX (viewMatrix, upAngle);
    viewMatrix  = Float4x4.multiply (Float4x4.translate ([0, viewOffset[1], viewOffset[0]]), viewMatrix);
    Float4x4.rotateY (viewMatrix,currentPosition[0] * Math.PI);
    //viewMatrix = Float4x4.multiply (Float4x4.scale ([ 2, 2, 2 ]), viewMatrix);
    //viewMatrix  = Float4x4.multiply (Float4x4.translate ([ -0.5, -0.5, -0.5 ]), viewMatrix);
    standardUniforms.VIEW_MATRIX_PARAMETER = viewMatrix;
    standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.identity ();

    // compute the camera position and set it in the standard uniforms
    let vmi = Float4x4.inverse (viewMatrix);
    standardUniforms.CAMERA_POSITION = [vmi[12], vmi[13], vmi[14]];

    // update the visibility layers
    constellationsNode.enabled = showConstellationsCheckbox.checked;
    cloudsNode.enabled = showCloudsCheckbox.checked;
    atmosphereNode.enabled = showAtmosphereCheckbox.checked;

    // draw the scene
    scene.traverse (standardUniforms);
};

let buildScene = function () {
    makeRevolve ("cylinder",
        [[1.0, 1.0], [1.0, -1.0], [1.0, -1.0], [0.8, -1.0], [0.8, -1.0], [0.8, 1.0], [0.8, 1.0], [1.0, 1.0]],
        [[1.0, 0.0], [1.0, 0.0], [0.0, -1.0], [0.0, -1.0], [-1.0, 0.0], [-1.0, 0.0], [0.0, 1.0], [0.0, 1.0]],
        36);
    makeBall ("ball", 72);
    makeBall ("ball-small", 36);

    scene = Node.new ({
        name: "root",
        state: function (standardUniforms) {
            // ordinarily, webGl will automatically present and clear when we return control to the
            // event loop from the draw function, but we overrode that to have explicit control.
            // webGl still presents the buffer automatically, but the back buffer is not cleared
            // until we do it...
            context.clearColor (0.0, 0.0, 0.0, 1.0);
            context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

            // back face culling enabled
            context.enable (context.CULL_FACE);
            context.cullFace (context.BACK);

            // extensions I want for getting gradient infomation inside the fragment shaders
            //context.getExtension ("OES_standard_derivatives");
            //context.getExtension ("EXT_shader_texture_lod");

            // oh for &#^%'s sake, alpha blending should be standard
            context.blendFunc (context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
            context.enable (context.BLEND);

            // a little bit of setup for lighting
            standardUniforms.AMBIENT_LIGHT_COLOR = [1.0, 1.0, 1.0];
            standardUniforms.LIGHT_COLOR = [1.0, 1.0, 1.0];
        }
    });

    let starsTransform = Float4x4.identity ();
    // rotate by 180 degrees on the x axis to account for our coordinate system, then Y by 180
    // degrees to orient correctly. then flip it inside out and scale it up
    starsTransform = Float4x4.multiply (starsTransform, Float4x4.rotateX (Float4x4.identity (), Math.PI));
    starsTransform = Float4x4.multiply (starsTransform, Float4x4.rotateY (Float4x4.identity (), Math.PI));
    starsTransform = Float4x4.multiply (starsTransform, Float4x4.scale (-210));
    starsNode = Node.new ({
        name: "stars",
        transform: starsTransform,
        state: function (standardUniforms) {
            context.disable (context.DEPTH_TEST);
            context.depthMask (false);
            Program.get ("texture").use ();
            standardUniforms.TEXTURE_SAMPLER = "starfield";
            standardUniforms.OUTPUT_ALPHA_PARAMETER = starsNode.alpha;
        },
        shape: "ball"
    });
    scene.addChild (starsNode);

    let starfieldNode = Node.new ({
        name: "starfield",
        state: function (standardUniforms) {
            Program.get ("texture").use ();
            standardUniforms.TEXTURE_SAMPLER = "starfield";
        },
        shape: "ball",
        children: false
    });
    starsNode.addChild (starfieldNode);

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

    // radii in km so I can do some reasoning about scales...
    let earthRadius = 6378.1370;
    let sunRadius = 695700.0;
    let earthOrbit = 149597870.700;
    let moonRadius = 1737.1;
    let moonOrbit = 384405.0;

    let sunDrawDistance = 200;
    let sunDistance = earthOrbit / earthRadius;
    let sunScale = (sunRadius / earthRadius);
    let drawScale = sunDrawDistance / sunDistance;
    sunScale *= drawScale; // approx 0.93
    let sunNode = Node.new ({
        name: "sun",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            Program.get ("color").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            standardUniforms.MODEL_COLOR = [255, 241, 234];
        },
        shape: "sphere2",
        children: false
    });
    scene.addChild (sunNode);

    Thing.new ("sun", "sun", function (time) {
        // get the node
        let node = Node.get (this.node);


        let n = time;

        // compute the mean longitude of the sun, corrected for aberration of light
        let L = 280.459 + (0.98564736 * n);

        // compute the mean anomaly of the sun
        let g = 357.529 + (0.98560028 * n);

        // unwind L & g
        L = Utility.unwindDegrees (L);
        g - Utility.unwindDegrees (g);

        // compute the ecliptic longitude of the sun
        let eclipticLongitude = L + (1.914666471 * Utility.sin (g)) + (0.019994643 * Utility.sin (g + g));
        //console.log ("Sun at: " + eclipticLongitude + "°");

        // compute the distance to the sun in astronomical units
        let R = 1.00014 - (0.01671 * Utility.cos (g)) - (0.00014 * Utility.cos (g + g));

        // compute the ecliptic obliquity
        let eclipticObliquity = 23.439 - (0.00000036 * n);

        // compute rectangular equatorial coordinates
        // XXX temporary - I am using a coordinate system where Z goes into the view, and Y is up
        // XXX temporary - I will adjust this later by adding a general rotation at the top of the
        // XXX temporary - view frame
        let X = R * Utility.cos (eclipticLongitude);
        let Y = R * Utility.cos (eclipticObliquity) * Utility.sin (eclipticLongitude);
        let Z = R * Utility.sin (eclipticObliquity) * Utility.sin (eclipticLongitude);

        let sunDirection = Float3.normalize ([-X, Z, Y]);
        let sunPosition = Float4.scale (sunDirection, sunDrawDistance);
        // compute the position of the sun, and update the lighting conversation
        node.transform = Float4x4.multiply (Float4x4.scale (sunScale), Float4x4.translate (sunPosition));
        standardUniforms.LIGHT_DIRECTION = sunDirection;
    });


    let worldNode = Node.new ({
        name: "world",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            context.enable (context.DEPTH_TEST);
            context.depthMask (true);
        }
    });
    scene.addChild (worldNode);

    let useTest = false;

    let testNode = Node.new ({
        name: "test",
        transform: Float4x4.identity (),
        state: function (standardUniforms) {
            context.enable (context.DEPTH_TEST);
            context.depthMask (true);
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
        shape: "ball",
        children: false
    });
    earthRenderNode.addChild (earthNode);

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
        let LST = 0;//(time - Math.floor (time)) * 360;
        node.transform = Float4x4.rotateY (Float4x4.identity (), Utility.degreesToRadians (gmst + LST));
    });

    let moonScale = moonRadius / earthRadius; // approx 0.273
    let moonDistance = moonOrbit / earthRadius; // approx 60.268
    let moonNode = Node.new ({
        name: "moon",
        transform: Float4x4.multiply (Float4x4.scale (moonScale), Float4x4.translate ([-moonDistance, 0, 0])),
        state: function (standardUniforms) {
            context.enable (context.DEPTH_TEST);
            context.depthMask (true);
            Program.get ("basic-texture").use ();
            standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            standardUniforms.TEXTURE_SAMPLER = "moon";
            standardUniforms.MODEL_COLOR = [1.1, 1.1, 1.1];
            standardUniforms.AMBIENT_CONTRIBUTION = 0.05;
            standardUniforms.DIFFUSE_CONTRIBUTION = 1.25;
            standardUniforms.SPECULAR_CONTRIBUTION = 0.05;
            standardUniforms.SPECULAR_EXPONENT = 8.0;
        },
        shape: "ball-small",
        children: false
    });
    scene.addChild (moonNode);

    Thing.new ("moon", "moon", function (time) {
        // get the node
        let node = Node.get (this.node);

        // https://en.wikipedia.org/wiki/Position_of_the_Sun
        // for J2000...
        let UT1 = 24 * 60 * 60;
        const millisecondsPerDay = UT1 * 1000;
        let julianDate = (time / millisecondsPerDay) + 2440587.5;
        let julianDay = julianDate - 2451545.0;
    });

    //LogLevel.set (LogLevel.TRACE);
    draw ([0, 0]);
};

let onBodyLoad = function () {
    MouseTracker.new ("render-canvas", OnReady.new (null, function (deltaPosition) {
        draw (deltaPosition);
    }), 0.01);
    Render.new ("render-canvas");

    showConstellationsCheckbox = document.getElementById("showConstellationsCheckbox");
    showCloudsCheckbox = document.getElementById("showCloudsCheckbox");
    showAtmosphereCheckbox = document.getElementById("showAtmosphereCheckbox");
    fovRange = document.getElementById("fovRange");
    framingRange = document.getElementById("framingRange");

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
