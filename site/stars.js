let Stars = function () {
    let _ = Object.create (null);

    _.make = function () {
        return Shape.new ({
            buffers: function () {
                // create the stars database from the loaded file
                let stars = JSON.parse (TextFile.get ("Stars").text);

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
                    0, 1, 2,
                    0, 2, 1,

                    0, 2, 3,
                    0, 3, 4,
                    0, 4, 5
                ];

                // the full point buffer
                let pointBuffer = [];

                // walk over the stars
                for (let star of stars) {
                    // get the ra and declination of the star
                    let ra = angleToRadians (angleFromString (star.RA));
                    let dec = angleToRadians (angleFromString (star.Dec));

                    ra = 0; dec = 0;

                    // build a transformation for the star points
                    let transform = Float4x4.chain (
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
