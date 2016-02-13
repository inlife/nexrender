'use strict';

const fs        = require('fs-extra');
const path      = require('path');
const async     = require('async');

/**
 * This task renames assets from their original name
 * to one, that is provided under "asset.name"
 */
module.exports = function(packed) {
    return new Promise((resolve, reject) => {

        console.log("renaming assets...");

        // unpack vars
        let project = packed[0],
            files   = packed[1];

        // initialize empty call-queue array
        let calls = [];

        // iterate over each file and create rename(move) callback
        for (let i = 0; i < files.length; i++) {
            let src = files[i].path;
            let dst = path.join( project.workpath, project.assets[i].name );

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