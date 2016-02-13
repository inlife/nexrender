'use strict';

const path  = require('path');
const fs    = require('fs-extra');

/**
 * verify that project rendered:
 * file result.$EXT exists, and its size > 0
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log("verifying project...");

        // read stats for file
        fs.stat( path.join( 
            project.workpath, 
            project.resultname 
        ), (err, stats) => {
            if (err) return reject(err);
            return (stats.size < 1) ? reject(new Error('empty render file')) : resolve(project); 
        })
    });
};