var fs = require("fs");
var browserify = require("browserify");
var path = require("path");
var babelify = require("babelify");

browserify("./src/index.js")
    .ignore('dataframe-js')
    .transform('babelify', {
        presets: ["@babel/preset-env"],
    })
    .bundle((err, buf) => {
        if (err) {
            console.trace(err);
            throw err;
        }
        const contentCode = buf.toString();
        const templateCode = fs.readFileSync(path.join(__dirname, './src/template.user.js')).toString();
        var outputCode = templateCode.replace('/*{%code%}*/', contentCode);
        var timestamp = Date.now().toString();
        timestamp = timestamp.substring(1, timestamp.length - 3);
        outputCode = outputCode.replace('{%timestamp%}', timestamp);
        fs.writeFileSync(path.join(__dirname, './dist/min.js'), outputCode)
    });