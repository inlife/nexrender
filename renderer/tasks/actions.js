'use strict';

const path  = require('path');
const fs    = require('fs-extra');
const dir   = require('node-dir');
const async = require('async');

// plugin storage
let actions = {};

// register actions
(function() {
    // set actions dir
    let actionsdir = path.join(__dirname, '..', 'actions');

    // read every file and load it into actions storage
    dir.readFiles(actionsdir, (err, cnt, filename, next) => {
        let plugin = require(filename);

        // push plugin to storage
        actions[plugin.name] = plugin;

        // go to next plugin file
        next();
    });
})();

/**
 * run post render actions from actions folder
 * upload, copy to local folder, email, etc.
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] applying actions...`);

        // initialize empty call-queue array
        let calls = [];

        // call copy to results plugin by default
        calls.push((callback) => {
            actions['copy-to-results'].plugin(project, {}, callback);
        });

        // iterate over activated actions for project
        for (let action of project.actions) {
            if (!actions[action.name]) continue;

            // and call them
            calls.push((callback) => {
                actions[action.name].plugin(project, action, callback);
            });
        }

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            return (err) ? reject(err) : resolve(project);
        });
    });
};
