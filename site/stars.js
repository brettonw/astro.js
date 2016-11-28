let Stars = function () {
    let _ = Object.create (null);

    _.make = function () {
        return Shape.new ({
            buffers: function () {
                // create the stars database from the loaded file
                let stars = JSON.parse (TextFile.get ("Stars").text);

                // the min and max V values, so we can interpolate the sizes
                let minV = -1.5, maxV = 8;
                let deltaV = maxV - minV;

                // a basic star triangle list
                let theta = Math.PI / 3.0;
                let cTh = Math.cos (theta);
                let sTh = Math.sin (theta);
                let starPoints = [
                    [ 1.0,  0.0, 0.0, 1.0],
                    [ cTh,  sTh, 0.0, 1.0],
                    [-cTh,  sTh, 0.0, 1.0],
                    [-1.0,  0.0, 0.0, 1.0],
                    [-cTh, -sTh, 0.0, 1.0],
                    [ cTh, -sTh, 0.0, 1.0]
                ];
                let starFaceIndices = [
                    0, 2, 1,
                    0, 3, 2,
                    0, 4, 3,
                    0, 5, 4
                ];

                // the full point buffer
                let pointBuffer = [];

                // walk over the stars
                for (let star of stars) {
                    // get the ra and declination of the star, accounting for our reversed and rotated
                    // coordinate frames
                    let ra = (Math.PI / -2.0) + angleToRadians (angleFromString (star.RA));
                    let dec = -angleToRadians (angleFromString (star.Dec));

                    // compute the size of this star, the dimmest will be 0.0001, the
                    // brightest 0.003
                    let interpolant = ((star.V - minV) / deltaV);
                    let size = (0.003 * (1.0 - interpolant)) + (0.0001 * interpolant);
                    // build a transformation for the star points
                    let transform = Float4x4.chain (
                        Float4x4.scale (size),
                        Float4x4.translate ([0.0, 0.0, 1.0]),
                        Float4x4.rotateX (dec),
                        Float4x4.rotateY (ra)
                    );

                    // transform the star points
                    let points = [];
                    for (let point of starPoints) {
                        point = Float3.copy (Float4x4.preMultiply (point, transform));
                        points.push (point);
                    }

                    // push the points into the final star points buffer
                    for (let index of starFaceIndices) {
                        pointBuffer.push (points[index]);
                    }

                    //break;
                }

                // flatten the buffer as the return result
                return {
                    position: Utility.flatten (pointBuffer)
                };
            }
        }, "stars");

    };

    return _;
} ();
