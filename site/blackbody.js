let Blackbody = function () {
    let _ = Object.create (null);

    let blackbodySource = [];
    let CIE_x = [0.0014D, 0.0042D, 0.0143D, 0.0435D, 0.1344D, 0.2839D, 0.3483D, 0.3362D, 0.2908D, 0.1954D, 0.0956D, 0.032D, 0.0049D, 0.0093D, 0.0633D, 0.1655D, 0.2904D, 0.4334D, 0.5945D, 0.7621D, 0.9163D, 1.0263D, 1.0622D, 1.0026D, 0.8544D, 0.6424D, 0.4479D, 0.2835D, 0.1649D, 0.0874D, 0.0468D, 0.0227D, 0.0114D, 0.0058D, 0.0029D, 0.0014D, 7.0E-4D, 3.0E-4D, 2.0E-4D, 1.0E-4D, 0.0D];
    let CIE_y = [0.0D, 1.0E-4D, 4.0E-4D, 0.0012D, 0.004D, 0.0116D, 0.023D, 0.038D, 0.06D, 0.091D, 0.139D, 0.208D, 0.323D, 0.503D, 0.71D, 0.862D, 0.954D, 0.995D, 0.995D, 0.952D, 0.87D, 0.757D, 0.631D, 0.503D, 0.381D, 0.265D, 0.175D, 0.107D, 0.061D, 0.032D, 0.017D, 0.0082D, 0.0041D, 0.0021D, 0.001D, 5.0E-4D, 3.0E-4D, 1.0E-4D, 1.0E-4D, 0.0D, 0.0D];
    let CIE_z = [0.0065D, 0.0201D, 0.0679D, 0.2074D, 0.6456D, 1.3856D, 1.7471D, 1.7721D, 1.6692D, 1.2876D, 0.813D, 0.4652D, 0.272D, 0.1582D, 0.0782D, 0.0422D, 0.0203D, 0.0087D, 0.0039D, 0.0021D, 0.0017D, 0.0011D, 8.0E-4D, 3.0E-4D, 2.0E-4D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D];
    return _;
} ();

public class blackbody_color extends Applet {
    Canvas color_canvas;
    Canvas plot_canvas;
    Scrollbar blackbody_scrollbar;
    double[] blackbody_source;
    double[] CIE_x = new double[]{0.0014D, 0.0042D, 0.0143D, 0.0435D, 0.1344D, 0.2839D, 0.3483D, 0.3362D, 0.2908D, 0.1954D, 0.0956D, 0.032D, 0.0049D, 0.0093D, 0.0633D, 0.1655D, 0.2904D, 0.4334D, 0.5945D, 0.7621D, 0.9163D, 1.0263D, 1.0622D, 1.0026D, 0.8544D, 0.6424D, 0.4479D, 0.2835D, 0.1649D, 0.0874D, 0.0468D, 0.0227D, 0.0114D, 0.0058D, 0.0029D, 0.0014D, 7.0E-4D, 3.0E-4D, 2.0E-4D, 1.0E-4D, 0.0D};
    double[] CIE_y = new double[]{0.0D, 1.0E-4D, 4.0E-4D, 0.0012D, 0.004D, 0.0116D, 0.023D, 0.038D, 0.06D, 0.091D, 0.139D, 0.208D, 0.323D, 0.503D, 0.71D, 0.862D, 0.954D, 0.995D, 0.995D, 0.952D, 0.87D, 0.757D, 0.631D, 0.503D, 0.381D, 0.265D, 0.175D, 0.107D, 0.061D, 0.032D, 0.017D, 0.0082D, 0.0041D, 0.0021D, 0.001D, 5.0E-4D, 3.0E-4D, 1.0E-4D, 1.0E-4D, 0.0D, 0.0D};
    double[] CIE_z = new double[]{0.0065D, 0.0201D, 0.0679D, 0.2074D, 0.6456D, 1.3856D, 1.7471D, 1.7721D, 1.6692D, 1.2876D, 0.813D, 0.4652D, 0.272D, 0.1582D, 0.0782D, 0.0422D, 0.0203D, 0.0087D, 0.0039D, 0.0021D, 0.0017D, 0.0011D, 8.0E-4D, 3.0E-4D, 2.0E-4D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D, 0.0D};
    Image offscreen;
    Image offscreen_color;
    Image background;
    Color display_color;
    double[][] xyzw = new double[][]{{0.67D, 0.33D}, {0.21D, 0.71D}, {0.14D, 0.08D}, {0.31D, 0.316D}};

    public blackbody_color() {
    }

    public void init() {
        super.init();
        this.ccInit();
        this.blackbody_source = new double[41];
        this.offscreen = this.createImage(201, 120);
        this.offscreen_color = this.createImage(90, 120);
        this.background = this.createImage(201, 120);
        this.drawBackground();
        this.computeBlackbody(this.getTemperature(), this.blackbody_source);
        this.scaleCurve(this.blackbody_source, 1.0D / this.curveMax(this.blackbody_source), this.blackbody_source);
        this.display_color = this.getColorOfCurve(this.blackbody_source);
        this.paintCanvases();
    }

    public void destroy() {
        super.destroy();
    }

    public void start() {
        super.start();
    }

    public void stop() {
        super.stop();
    }

    public void paint(Graphics g) {
        super.paint(g);
        this.paintCanvases();
    }

    void ccInit() {
        this.resize(321, 186);
        this.setLayout((LayoutManager)null);
        this.plot_canvas = new Canvas();
        this.plot_canvas.move(110, 10);
        this.plot_canvas.resize(201, 120);
        this.plot_canvas.setBackground(Color.white);
        this.add(this.plot_canvas);
        this.color_canvas = new Canvas();
        this.color_canvas.move(10, 10);
        this.color_canvas.resize(90, 120);
        this.add(this.color_canvas);
        Label blackbody_label = new Label("Color Temperature");
        blackbody_label.move(10, 140);
        blackbody_label.resize(200, 20);
        this.add(blackbody_label);
        this.blackbody_scrollbar = new Scrollbar(0, 0, 1, 0, 281);
        this.blackbody_scrollbar.move(10, 160);
        this.blackbody_scrollbar.resize(301, 16);
        this.add(this.blackbody_scrollbar);
    }

    void ccHandleEventMapExceptions(Throwable thrown) {
        if(thrown instanceof ClassNotFoundException) {
            System.err.println("EXCEPTION: Can\'t find class for EventMapper: " + thrown.getMessage());
        } else if(thrown instanceof NoSuchMethodException) {
            System.err.println("EXCEPTION: Can\'t find method for event map: " + thrown.getMessage());
        } else {
            System.err.println("EXCEPTION: Unexpected exception during event map: " + thrown.getMessage());
            thrown.printStackTrace();
        }

    }

    /** @deprecated */
    public boolean handleEvent(Event event) {
        Object arg = event.arg;
        boolean eventHandled = false;
        if(event.target == this.blackbody_scrollbar && (event.id == 605 || event.id == 602 || event.id == 601 || event.id == 604 || event.id == 603)) {
            this.on_blackbody_scrollbar_SCROLL_ABSOLUTE(event);
            eventHandled = true;
        }

        if(!eventHandled) {
            super.handleEvent(event);
        }

        return false;
    }

    double getColorTemperature(double scrollbar_pos) {
        return scrollbar_pos <= 200.0D?2000.0D + scrollbar_pos * 50.0D:12000.0D + (scrollbar_pos - 200.0D) * 100.0D;
    }

    double getTemperature() {
        return this.getColorTemperature((double)this.blackbody_scrollbar.getValue());
    }

    Color normalizeRGBColor(double red, double green, double blue) {
        double max = red;
        if(green > red) {
            max = green;
        }

        if(blue > max) {
            max = blue;
        }

        red /= max;
        green /= max;
        blue /= max;
        return new Color((float)red, (float)green, (float)blue);
    }

    double[] normalizeXYZColor(double X, double Y, double Z) {
        double[] result = new double[3];
        double xw = this.xyzw[3][0];
        double yw = this.xyzw[3][1];
        double Xw = xw / yw;
        double Yw = 1.0D;
        double Zw = (1.0D - xw - yw) / yw;
        result[0] = X + (Xw - X) * 0.005D;
        result[1] = Y + (Yw - Y) * 0.005D;
        result[2] = Z + (Zw - Z) * 0.005D;
        return result;
    }

    Color xyzToColor(double X, double Y, double Z) {
        double[][] XYZtoRGB = new double[3][3];
        double xr = this.xyzw[0][0];
        double xg = this.xyzw[1][0];
        double xb = this.xyzw[2][0];
        double xw = this.xyzw[3][0];
        double yr = this.xyzw[0][1];
        double yg = this.xyzw[1][1];
        double yb = this.xyzw[2][1];
        double yw = this.xyzw[3][1];
        double Cr = 1.0D / yw * (xw * (yg - yb) - yw * (xg - xb) + xg * yb - xb * yg);
        double Cg = 1.0D / yw * (xw * (yb - yr) - yw * (xb - xr) - xr * yb + xb * yr);
        double Cb = 1.0D / yw * (xw * (yr - yg) - yw * (xr - xg) + xr * yg - xg * yr);
        XYZtoRGB[0][0] = (yg - yb - xb * yg + yb * xg) / Cr;
        XYZtoRGB[0][1] = (xb - xg - xb * yg + xg * yb) / Cr;
        XYZtoRGB[0][2] = (xg * yb - xb * yg) / Cr;
        XYZtoRGB[1][0] = (yb - yr - yb * xr + yr * xb) / Cg;
        XYZtoRGB[1][1] = (xr - xb - xr * yb + xb * yr) / Cg;
        XYZtoRGB[1][2] = (xb * yr - xr * yb) / Cg;
        XYZtoRGB[2][0] = (yr - yg - yr * xg + yg * xr) / Cb;
        XYZtoRGB[2][1] = (xg - xr - xg * yr + xr * yg) / Cb;
        XYZtoRGB[2][2] = (xr * yg - xg * yr) / Cb;
        double red = X * XYZtoRGB[0][0] + Y * XYZtoRGB[0][1] + Z * XYZtoRGB[0][2];
        double green = X * XYZtoRGB[1][0] + Y * XYZtoRGB[1][1] + Z * XYZtoRGB[1][2];
        double blue = X * XYZtoRGB[2][0] + Y * XYZtoRGB[2][1] + Z * XYZtoRGB[2][2];
        if(red >= 0.0D && green >= 0.0D && blue >= 0.0D) {
            return this.normalizeRGBColor(red, green, blue);
        } else {
            double[] normalizedColor = this.normalizeXYZColor(X, Y, Z);
            return this.xyzToColor(normalizedColor[0], normalizedColor[1], normalizedColor[2]);
        }
    }

    Color getColorOfCurve(double[] curve) {
        double X = 0.0D;
        double Y = 0.0D;
        double Z = 0.0D;

        for(int i = 0; i < 41; ++i) {
            double curve_i = curve[i];
            X += this.CIE_x[i] * curve_i;
            Y += this.CIE_y[i] * curve_i;
            Z += this.CIE_z[i] * curve_i;
        }

        return this.xyzToColor(X, Y, Z);
    }

    void drawSpectrum(Graphics graphics, int y, int height) {
        for(int i = 0; i < 200; ++i) {
            double lambda = 380.0D + 2.0D * (double)i;
            double base = Math.floor(lambda * 0.1D) * 10.0D;
            double delta = (lambda - base) * 0.1D;
            int index = i / 5;
            int plus1 = index + 1;
            double X = this.CIE_x[index] + (this.CIE_x[plus1] - this.CIE_x[index]) * delta;
            double Y = this.CIE_y[index] + (this.CIE_y[plus1] - this.CIE_y[index]) * delta;
            double Z = this.CIE_z[index] + (this.CIE_z[plus1] - this.CIE_z[index]) * delta;
            graphics.setColor(this.xyzToColor(X, Y, Z));
            graphics.fillRect(i, y, 1, height);
        }

    }

    void drawBackground() {
        Graphics graphics = this.background.getGraphics();
        graphics.setColor(Color.white);
        graphics.fillRect(0, 0, 400, 200);
        graphics.setColor(Color.lightGray);

        int y;
        for(y = 0; y <= 200; y += 5) {
            if((y - 10) % 50 != 0) {
                graphics.drawLine(y, 0, y, 100);
            }
        }

        for(y = 0; y <= 100; y += 5) {
            if(y % 100 != 0) {
                graphics.drawLine(0, y, 200, y);
            }
        }

        graphics.setColor(Color.black);

        for(y = 0; y <= 200; y += 5) {
            if((y - 10) % 50 == 0) {
                graphics.drawLine(y, 0, y, 100);
            }
        }

        for(y = 0; y <= 100; y += 5) {
            if(y % 100 == 0) {
                graphics.drawLine(0, y, 200, y);
            }
        }

        this.drawSpectrum(graphics, 102, 18);
    }

    void plotCurve(double[] curve, Color color, Graphics graphics) {
        int x1 = 0;
        int y1 = (int)(100.5D - curve[0] * 100.0D);
        graphics.setColor(color);

        for(int i = 1; i < 41; ++i) {
            int x2 = x1 + 5;
            int y2 = (int)(100.5D - curve[i] * 100.0D);
            graphics.drawLine(x1, y1, x2, y2);
            graphics.fillOval(x1 - 1, y1 - 1, 3, 3);
            x1 = x2;
            y1 = y2;
        }

        graphics.fillOval(x1 - 1, y1 - 1, 3, 3);
    }

    double curveArea(double[] curve) {
        double area = 0.0D;

        for(int i = 0; i < 41; ++i) {
            area += curve[i];
        }

        return area;
    }

    double curveMax(double[] curve) {
        double max = 0.0D;

        for(int i = 0; i < 41; ++i) {
            max = curve[i] > max?curve[i]:max;
        }

        return max;
    }

    void scaleCurve(double[] curve, double multiplier, double[] result) {
        for(int i = 0; i < 41; ++i) {
            result[i] = curve[i] * multiplier;
        }

    }

    void computeBlackbody(double color_temperature, double[] blackbody) {
        double h = 6.626176E-34D;
        double k = 1.380662E-23D;
        double c = 2.997925E8D;
        double hc = h * c;
        double pi = 3.141593D;
        double c1 = 2.0D * pi * hc * c;
        double c2 = hc / k;

        for(int i = 0; i < 41; ++i) {
            double wavelength = ((double)i * 10.0D + 380.0D) * 1.0E-9D;
            blackbody[i] = c1 / (Math.pow(wavelength, 5.0D) * (Math.pow(Math.exp(1.0D), c2 / (wavelength * color_temperature)) - 1.0D));
        }

    }

    void paintMainCanvas() {
        Graphics offscreen_graphics = this.offscreen.getGraphics();
        offscreen_graphics.drawImage(this.background, 0, 0, (ImageObserver)null);
        this.plotCurve(this.blackbody_source, Color.black, offscreen_graphics);
        this.plot_canvas.getGraphics().drawImage(this.offscreen, 0, 0, (ImageObserver)null);
    }

    void paintColorCanvas() {
        Graphics offscreen_graphics = this.offscreen_color.getGraphics();
        FontMetrics metrics = offscreen_graphics.getFontMetrics();
        int height = metrics.getHeight();
        int y = height * 3 / 2;
        offscreen_graphics.setColor(this.display_color);
        offscreen_graphics.fillRect(0, 0, 90, 120);
        offscreen_graphics.setColor(Color.black);
        offscreen_graphics.drawString(this.getTemperature() + "K", 6, y);
        this.color_canvas.getGraphics().drawImage(this.offscreen_color, 0, 0, (ImageObserver)null);
    }

    void paintCanvases() {
        this.paintMainCanvas();
        this.paintColorCanvas();
    }

    public void on_blackbody_scrollbar_SCROLL_ABSOLUTE(Event event) {
        this.computeBlackbody(this.getTemperature(), this.blackbody_source);
        this.scaleCurve(this.blackbody_source, 1.0D / this.curveMax(this.blackbody_source), this.blackbody_source);
        this.display_color = this.getColorOfCurve(this.blackbody_source);
        this.paintCanvases();
    }
}
