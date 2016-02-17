'use strict';

const path  = require('path');
const fs    = require('fs-extra');
const dir   = require('node-dir');

/**
 * Function tries to read logs from folder with project
 * @param  {Project}   project
 * @param  {Function} callback 
 */
function getLogs(project, callback) {
    let logsdir = path.join( project.workpath, project.template + ' Logs' );
    let msg = '';

    dir.readFiles(logsdir, (err, cnt, filename, next) => {
        msg += cnt;
        next();
    }, (err, files) => {
        callback(msg);
    });
}

/**
 * verify that project rendered:
 * file result.$EXT exists, and its size > 0
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.log(`[${project.uid}] verifying project...`);

        // read stats for file
        fs.stat( path.join( 
            project.workpath, 
            project.resultname 
        ), (err, stats) => {
            if (err || stats.size < 1) {
                getLogs(project, (logs) => {
                    return reject(logs);
                })
            } else {
                return resolve(project); 
            }
        })
    });
};
