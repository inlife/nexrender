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
        if (settings.logger) settings.logger(`[${job.uid}] setting up job...`);

        // setup job's workpath
        job.workpath = path.join(settings.workpath,   job.uid);

        // set default job result file name
        if (job.settings.outputExt) {
            job.resultname = 'result.' + job.settings.outputExt;
        }
        else {
            job.resultname = 'result.' + (os.platform() === 'darwin' ? 'mov' : 'avi');
        }

        // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
        if (job.settings &&
            job.settings.outputExt &&
            ['jpeg', 'jpg'].indexOf(
                job.settings.outputExt.toLowerCase()
            ) !== -1
        ) {
            job.resultname = 'result_[#####]' + job.settings.outputExt;
        }


        // create if it does not exists
        mkdirp.sync(job.workpath);

        // check if we have job (template) as an asset
        for (let asset of job.assets) {
            if (asset.type && ['job', 'template'].indexOf(asset.type) !== -1) {
                job.template = asset.name;
                return resolve(job);
            }
        }

        return reject(new Error("You should provide a job template file (aepx) as an asset."));
    });
};
