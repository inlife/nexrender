'use strict';

const path  = require('path');
const fs    = require('fs-extra');
const dir   = require('node-dir');
const async = require('async');

// plugin storage
let plugins = {};

// register plugins
(function() {
    // set plugins dir
    let pluginsdir = path.join(__dirname, '..', 'plugins');

    // read every file and load it into plugins storage
    dir.readFiles(pluginsdir, (err, cnt, filename, next) => {
        let plugin = require(filename);

        // push plugin to storage
        plugins[plugin.name] = plugin;

        // go to next plugin file
        next();
    });
})();

/**
 * run post render actions from plugins folder
 * upload, copy to local folder, email, etc.
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log("applying plugins...");

        // initialize empty call-queue array
        let calls = [];

        for (let action of project.postActions) {
            if (!plugins[action.name]) continue;

            calls.push((callback) => {
                plugins[action.name].plugin(project, action, callback);
            });
        }

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            return (err) ? reject(err) : resolve(project);
        });
    });
};