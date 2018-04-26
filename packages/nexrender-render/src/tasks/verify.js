'use strict';

const path  = require('path');
const fs    = require('fs-extra');
const dir   = require('node-dir');

/**
 * Function tries to read logs from folder with job
 * @param  {Object}   job
 * @param  {Function} callback
 */
function getLogs(job, callback) {
    let logsdir = path.join( job.workpath, job.template + ' Logs' );
    let msg = '';

    dir.readFiles(logsdir, (err, cnt, filename, next) => {
        msg += cnt;
        next();
    }, (err, files) => {
        callback(msg);
    });
}

/**
 * verify that job rendered:
 * file result.$EXT exists, and its size > 0
 */
module.exports = function(job) {
    return new Promise((resolve, reject) => {

        console.info(`[${job.uid}] verifying job...`);

        //TEMP: workaround for JPEG sequences mode
        if (job.settings &&
            job.settings.outputExt &&
            ['jpeg', 'jpg'].indexOf(
                job.settings.outputExt.toLowerCase()
            ) !== -1
        ) {
            console.info(`[${job.uid}] verifying: found jpeg sequence...`);
            return resolve(job);
        }

        // read stats for file
        fs.stat( path.join(
            job.workpath,
            job.resultname
        ), (err, stats) => {
            if (err) {
                // if file doesn't exists
                return reject(err);
            } else if (!stats || stats.size < 1) {
                // if file is empty
                getLogs(job, (logs) => {
                    return reject(logs);
                })
            } else {
                return resolve(job);
            }
        })
    });
};
