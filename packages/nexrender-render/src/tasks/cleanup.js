'use strict';

const fs        = require('fs-extra');
const path      = require('path');
const async     = require('async');

/**
 * Clean up all workpath files and remove folder
 */
module.exports = function(job) {
    return new Promise((resolve, reject) => {

        console.info(`[${job.uid}] cleaning up...`);

        fs.remove( job.workpath, (err) => {
            return (err) ? reject(err) : resolve(job);
        })
    });
};
