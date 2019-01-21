'use strict';

const os      = require('os')
const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')

/**
 * This task creates working directory for current job
 */
module.exports = function(job, settings) {
    return new Promise((resolve, reject) => {
        if (settings.logger) settings.logger.log(`[${job.uid}] setting up job...`);

        // setup job's workpath
        job.workpath = path.join(settings.workpath, job.uid);
        job.settings = job.settings || {};

        // set default job result file name
        if (job.settings.outputExt) {
            job.resultname = 'result.' + job.settings.outputExt;
        } else {
            job.resultname = 'result.' + (os.platform() === 'darwin' ? 'mov' : 'avi');
        }

        // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
        if (job.settings.outputExt && ['jpeg', 'jpg'].indexOf(job.settings.outputExt) !== -1) {
            job.resultname = 'result_[#####]' + job.settings.outputExt;
        }

        // create if it does not exists
        mkdirp.sync(job.workpath);

        // check if we have job (template) as an file
        for (let file of job.assets) {
            if (file.type && ['project', 'template'].indexOf(file.type) !== -1) {
                job.template = file.name;
                return resolve(job);
            }
        }

        return reject(new Error("You should provide a job template (aepx) as a file."))
    });
};
