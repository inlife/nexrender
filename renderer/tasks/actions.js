'use strict';

const path  = require('path');
const fs    = require('fs-extra');
const dir   = require('node-dir');
const async = require('async');

// action storage
let actions = {};

// register actions
(function() {
    // set actions dir
    let actionsdir = path.join(__dirname, '..', 'actions');

    // read every file and load it into actions storage
    let files = fs.readdirSync(actionsdir);

    for (let filename of files) {
        if (filename.indexOf('.js') !== -1) {
            let action = require( path.join(actionsdir, filename) );

            // push plugin to storage
            actions[action.name] = action;
        }
    }

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
        if (actions.hasOwnProperty('copy-to-results')) {
            calls.push((callback) => {
                actions['copy-to-results'].plugin(project, {}, callback);
            });
        }

        // iterate over activated actions for project
        for (let action of project.actions) {
            if (!actions.hasOwnProperty(action.name)) continue;

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
