"use strict";

var shortid     = require('shortid'),
    Download    = require('download'),
    probe       = require('node-ffprobe'),
    Jimp        = require('jimp'),
    async       = require('async'),
    mkdirp      = require('mkdirp'),
    path        = require('path'),
    appRoot     = require('app-root-path').path,
    fs          = require('fs-extra'),
    render      = require('./render');

const AEPEXT    = process.env.AEPEXT    || '.aep';
const OUTEXT    = process.env.OUTEXT    || '.mp4';
const IMAGEFILE = process.env.IMAGEFILE || 'image.jpg';
const TRACKFILE = process.env.TRACKFILE || 'track.mp3';
const PROJFILE  = process.env.PROJFILE  || 'project' + AEPEXT;
const IMGSIZEX  = 1280;
const IMGSIZEY  = 720;

const AERENDER_TEMPLATE = process.env.AERENDER_TEMPLATE || 'h264';
const AERENDER_PATH     = process.env.AERENDER_PATH;

class Project {

    constructor(name, comp, assets) {
        this.uid = shortid();
        this.name = name;
        this.comp = comp;
        this.assets = assets;

        this.framerate = process.env.AERENDER_FRAMERATE || 60;
        this.workpath = null;
        this.audiodata = null;
        this.output = null;
    }

    start(callback) {
        var self = this;

        // generate paths
        let assetsdir   = process.env.ASSETSDIR || path.join(appRoot, 'assets');
        let resultsdir  = process.env.RESULTSDIR || path.join(appRoot, 'results');
        let projectsdir = process.env.PROJECTSDIR || path.join(assetsdir, 'projects');
        let workpath    = path.join(appRoot, process.env.TEMPDIR || 'temp', this.uid);

        this.workpath = workpath;
        this.output   = path.join( workpath, 'result' + OUTEXT );

        // create working dir
        mkdirp.sync(workpath);

        async.waterfall([
            function(callback) {
                console.log("copying project file...");
                fs.copy(
                    path.join(projectsdir, self.name + AEPEXT),
                    path.join(workpath, PROJFILE),
                    callback
                );
            }, 
            function(callback) {
                console.log("downloading assets...");
                self.downloadAssets(callback);
            },
            function(callback) {
                console.log("starting render...");

                render(AERENDER_PATH, {
                    project: path.join(workpath, PROJFILE),
                    comp: self.comp,
                    template: AERENDER_TEMPLATE,
                    frames: self.calculateLength(),
                    output: self.output
                }, callback)
            },
            // function(callback) {
            //     console.log("moving to results dir...");
            //     fs.move(self.output, path.join(resultsdir, shortid() + OUTEXT), callback);
            // }
        ], function (err, result) {
            if (err) return console.log(err);
            callback({ result: self.output, length: self.audiodata.format.duration });
        });
    }

    downloadAssets(callback) {
        var self = this;
        
        // empty/not full assets
        if (!this.assets || !this.assets.image || !this.assets.track) {
            return callback({ msg: "Assets resources not provided" });
        }

        // download assets in parallel, and process them
        async.parallel([
            function(callback) {
                new Download({mode: '777'})
                    .get(self.assets.image, self.workpath)
                    .rename('tempimage')
                    .run(function(err, data) {
                        if (err) return callback(err);
                        self.processImage('tempimage', callback);
                    });
            },
            function(callback) {
                new Download({mode: '777'})
                    .get(self.assets.track, self.workpath)
                    .rename('temptrack')
                    .run(function(err, data) {
                        if (err) return callback(err);
                        self.processTrack('temptrack', callback);
                    });
            }
        ], function(err) {
            callback(err);
        });

    } 

    processImage(name, callback) {
        var self = this;

        console.log("processing image...");

        let filename = path.join(this.workpath, name);
        let resultfile = path.join(this.workpath, IMAGEFILE);

        // resize image, and save to right format
        Jimp.read(filename, function (err, image) {
            if (err) return callback(err);
            image.cover(IMGSIZEX, IMGSIZEY);  
            image.write(resultfile, callback);
        });
    }

    processTrack(name, callback) {
        var self = this;

        console.log("processing track...");

        let filename = path.join(this.workpath, name);
        let resultfile = path.join(this.workpath, TRACKFILE);

        // fetch track audio data
        probe(filename, function(err, probeData) {
            if (err) callback(err);
            self.audiodata = probeData;
            fs.move(filename, resultfile, callback);
        });
    }

    calculateLength() {
        return Math.floor( this.audiodata.format.duration * this.framerate );
    }
}

module.exports = Project;
