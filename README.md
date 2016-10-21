# Astro-JS
 Earth-centric astronomy

Deployed at: http://astro-js.azurewebsites.net/ (though the free Azure website connection is severely constrained 
and may not serve up the high resolution textures correctly).

<center><img src="http://astro-js.azurewebsites.net/site/img/sample.png" alt="Drawing" style="width: 320px;"/></center>

### Building
This project uses ant for building, with the "dev" target being the default:
 
    ant | ant dev | ant rel

### Build Dependencies
* node/npm
* gcc (for the C-preprocessor)
* uglifyjs (for Minification)
* yuidoc (for Documentation)

### UglifyJS2
For ES6 compatibility, you have to use the "harmony" branch of UglifyJS2:

    git clone git://github.com/mishoo/UglifyJS2.git
    cd UglifyJS2
    git checkout harmony
    npm link .
    
### YUIDoc
YUIDoc only reads the comments, so it doesn't impose any code structure:
 
    npm install -g yuidocjs
    
It would be better if I could point it at a single file. Syntax reference at 
http://yui.github.io/yuidoc/
.

The theme is "lucid", from https://www.npmjs.com/package/yuidoc-lucid-theme

    npm install -g yuidoc-lucid-theme
    
I also tried:
* JSDoc, which wanted very specific code structure, and wouldn't bend to my will, and
* ESDoc, which crashed on my code.

### Building a scene
...
