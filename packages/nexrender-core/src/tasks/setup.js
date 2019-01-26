'use strict';

const os      = require('os')
const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')
const nanoid  = require('nanoid')

/**
 * This task creates working directory for current job
 */
module.exports = (job, settings) => {
    if (settings.logger) settings.logger.log(`[${job.uid}] setting up job...`);

    /* TODO: add external job validation */
    if (!job || !job.template || !job.assets || !job.actions) {
        return Promise.reject(new Error('you must provide a configured nexrender job'))
    }

    if (!job.uid) job.uid = nanoid();

    // setup job's workpath
    job.workpath = path.join(settings.workpath, job.uid);
    mkdirp.sync(job.workpath);

    // set default job result file name
    if (job.template.outputExt) {
        job.resultName = 'result.' + job.template.outputExt;
    } else {
        job.resultName = 'result.' + (os.platform() === 'darwin' ? 'mov' : 'avi');
    }

    // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
    if (job.template.outputExt && ['jpeg', 'jpg'].indexOf(job.template.outputExt) !== -1) {
        job.resultName    = 'result_[#####].' + job.template.outputExt;
        job.imageSequence = true;
    }

    return Promise.resolve(job)
};
