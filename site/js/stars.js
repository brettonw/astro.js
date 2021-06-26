let Stars = function () {
    let _ = Object.create (null);

    _.make = function (name, includeMinV, includeMaxV) {
        return Shape.new ({
            buffers: function () {
                // the min and max V values, so we can interpolate the sizes
                let minV = -1.5, maxV = 8;
                let deltaV = maxV - minV;

                // a basic star triangle list
                let starFaceIndices = [];
                let starPoints = [];
                let makeStar = function (count) {
                    let theta = 2.0 * Math.PI / count;
                    //let cTh = Math.cos (theta);
                    //let sTh = Math.sin (theta);
                    for (let i = 0; i < count; ++i) {
                        let angle = theta * i;
                        starPoints.push([ Math.cos (angle),  Math.sin (angle),  0.0,  1.0]);
                    }
                    starPoints.push([ 0.0,  0.0,  0.0,  1.0]);

                    for (let i = 0; i < count; ++i) {
                        starFaceIndices.push(count, (i + 1) % count, i);
                    }
                };

                // 7 points on a star is a nice compromise between too symmetrical and nice and round
                makeStar(7);

                // the full point buffer
                let positionBuffer = [];
                let colorBuffer = [];
                let indexBuffer = [];

                // walk over the stars
                let count = 0;
                let addStar = function (star) {
                    if ((star.V >= includeMinV) && (star.V < includeMaxV)) {
                        count++;
                        // get the right ascension and declination of the star, accounting for
                        // our reversed and rotated coordinate frames
                        let ra = (Math.PI / -2.0) + angleToRadians (angleFromString (star.RA));
                        let dec = -angleToRadians (angleFromString (star.Dec));

                        // compute the size of this star, the dimmest will be 0.0005, the
                        // brightest 0.005
                        let interpolant = ((star.V - minV) / deltaV);
                        let size = (0.005 * (1.0 - interpolant)) + (0.0005 * interpolant);
                        // build a transformation for the star points
                        let transform = Float4x4.chain (
                            Float4x4.scale (size),
                            Float4x4.translate ([0.0, 0.0, 1.0]),
                            Float4x4.rotateX (dec),
                            Float4x4.rotateY (ra)
                        );

                        // transform the star points
                        let pointsBase = positionBuffer.length;
                        for (let point of starPoints) {
                            point = Float3.copy (Float4x4.preMultiply (point, transform));
                            positionBuffer.push (point);
                        }

                        // compute the color for the star, and push the colors into the final
                        // star color buffer
                        let alpha = 0.25 + (0.75 * (1.0 - interpolant));
                        let color = ("K" in star) ? Blackbody.colorAtTemperature (star.K) : [1.0, 0.5, 0.5];
                        for (let i = 1; i < starPoints.length; ++i) {
                            colorBuffer.push ([color[0], color[1], color[2], 0.1]);
                        }
                        //colorBuffer.push ([1.0, 1.0, 1.0, alpha]);
                        color = Float3.scale (Float3.add ([2.0, 2.0, 2.0], color), 0.3333);
                        colorBuffer.push ([color[0], color[1], color[2], alpha]);

                        // push the indices into the final star points buffer
                        for (let index of starFaceIndices) {
                            indexBuffer.push (index + pointsBase);
                        }
                    }
                }

                // create the stars database from the loaded files
                let stars = JSON.parse (TextFile.get ("Stars").text);
                for (let star of stars) addStar (star);

                // technically the M objects could be much larger, but for now we'll just treat them as stars
                let messiers = JSON.parse (TextFile.get ("Messier").text);
                for (let messier of messiers) addStar (messier);
                LogLevel.info ("Star count (" + name + "): " + count);

                // flatten the buffer as the return result
                return {
                    position: Utility.flatten (positionBuffer),
                    color: Utility.flatten (colorBuffer),
                    index: indexBuffer
                };
            }
        }, name);

    };

    return _;
} ();
