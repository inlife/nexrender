'use strict';

/**
 * Parameters for rendering
 */
let mixfile     = 'deep_60s.mp3';
let background  = '2016-aug-deep.jpg';
let datascript  = '2016-aug-deep.js';
let duration    = 3600; // set max duration for 1 minute (equal to audio length)

let aepxfile  = 'nm05ae12.aepx';
let audio     = 'mp3';

/**
 * Settings for renderer
 * DONT FORGET TO CHANGE aebinary ACCORDING TO YOUR SYSTEM
 * On Windows might look like: 'C:\\Program Files\\Adobe\\After Effects CC\\aerender.exe'
 */
const aebinary  = '/Applications/Adobe After Effects CC/aerender';
const port      = 23234;

/**
 * Dependencies
 */
const http      = require('http');
const url       = require('url');
const path      = require('path');
const fs        = require('fs');

const Project   = require('nexrender').Project;
const renderer  = require('nexrender').renderer;

/**
 * HTTP server
 */
let server = http.createServer((req, res) => {

    let uri         = url.parse(req.url).pathname;
    let filename    = path.join(process.cwd(), uri);

    fs.exists(filename, (exists) => {
        if(!exists) {
            res.writeHead(404, {"Content-Type": "text/plain"});
            res.write("404 Not Found\n");
            
            return res.end();
        }

        fs.readFile(filename, "binary", function(err, file) {
            if(err) {    
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.write(err + "\n");
                return res.end();
            }

            // send 200
            res.writeHead(200);
            res.write(file, "binary");
            return res.end();
        });
    });
});

/**
 * Renderer
 */
server.listen(port, () => {

    console.log('Started local static server at port:', port);

    // addtional info about configuring project can be found at:
    // https://github.com/Inlife/nexrender/wiki/Project-model
    let project = new Project({
        "template": "project.aepx",
        "composition": "main",
        "type": "default",
        "settings": {
            // dont forget to setup the right output module; info:
            // The default outputModule for Windows users is "Lossless" & the default outputExt is "avi"
            // You can create custom modules from Edit -> Templates -> Output Modules but the name and outputExt have to be in sync
            // Go to Composition -> Add Output Module to create customModule names
            // https://helpx.adobe.com/after-effects/using/basics-rendering-exporting.html#output_modules_and_output_module_settings
            "outputModule": "h264",
            "startFrame": 0,
            "endFrame": duration,
            "outputExt": "mp4"
        },
        "assets": [
            { "type": "project", "name": "project.aepx",    "src": `http://localhost:${port}/assets/${aepxfile}`}, 
            { "type": "image",   "name": "background.jpg",  "src": `http://localhost:${port}/assets/${background}`, "filters": [ {"name":"cover", "params": [1280, 720] }] },
            { "type": "image",   "name": "nm.png",          "src": `http://localhost:${port}/assets/nm.png` },
            { "type": "audio",   "name": `audio.${audio}`,  "src": `http://localhost:${port}/assets/${mixfile}` },
            { "type": "script",  "name": "data.js",         "src": `http://localhost:${port}/assets/${datascript}` }
        ]
    });

    console.log(project);

    // start rendering
    renderer.render(aebinary, project).then(() => {
        // success
        server.close();
        console.log('rendering finished');
    }).catch((err) => {
        // error
        console.error(err);
        server.close();
    });

});
