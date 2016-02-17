'use strict';

const fs        = require('fs-extra');
const path      = require('path');
const async     = require('async');

/**
 * This task renames assets from their original name
 * to one, that is provided under "asset.name"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] renaming assets...`);

        // initialize empty call-queue array
        let calls = [];

        // iterate over each file and create rename(move) callback
        for (let asset of project.assets) {
            let src = path.join( project.workpath, asset.src.substring( asset.src.lastIndexOf('/') + 1 ));
            let dst = path.join( project.workpath, asset.name );

            calls.push((callback) => {
                fs.move(src, dst, callback);
            });
        }

        // run rename(move) callbacks in parallel
        async.parallel(calls, (err, results) => {
            return (err) ? reject(err) : resolve(project);
        })
    });
};
