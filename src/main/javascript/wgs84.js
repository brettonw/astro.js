let makeWgs84 = function (name, steps) {

    // flattening, f = (a - b) / a
    // from WGS84 (http://earth-info.nga.mil/GandG/publications/tr8350.2/wgs84fin.pdf)
    // 1 / f = 298.257223563
    // a = 6378137.0 (meters)
    // b = (-f * a) + a
    // we want to compute the ovoid using b/f for the y components of the outline

    LOG (LogLevel.INFO, "Make WGS84...");
    // generate an outline, and then revolve it
    let outline = [];
    let normal = [];
    let stepAngle = Math.PI / steps;
    for (let i = 0; i <= steps; ++i) {
        let angle = stepAngle * i;

        // using an angle setup so that 0 is (0, 1), and Pi is (0, -1) means switching (x, y) so we
        // get an outline that can be revolved around the x=0 axis
        let value = Float2.fixNum([Math.sin (angle), Math.cos (angle)]);
        outline.push (value);
        normal.push (value);
    }

    // revolve the surface, the outline is a half circle, so the revolved surface needs to be twice
    // as many steps to go all the way around
    return makeRevolve(name, outline, normal, steps * 2, function (uvY) { return uvY; });
};
