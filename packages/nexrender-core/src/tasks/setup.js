const os      = require('os')
const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')
const assert  = require('assert')

const { create, validate } = require('@nexrender/types/job')

/**
 * This task creates working directory for current job
 */
module.exports = (job, settings) => {
    /* fill default job fields */
    job = create(job)

    settings.logger.log(`[${job.uid}] setting up job...`);

    try {
        assert(validate(job) == true)
    } catch (err) {
        return Promise.reject('Error veryifing job: ' + err)
    }

    // set default job result file name
    if (job.template.outputExt) {
        job.resultname = 'result.' + job.template.outputExt;
    } else {
        job.resultname = 'result.' + (os.platform() === 'darwin' ? 'mov' : 'avi');
    }

    // NOTE: for still (jpg) image sequence frame filename will be changed to result_[#####].jpg
    if (job.template.outputExt && ['jpeg', 'jpg', 'png'].indexOf(job.template.outputExt) !== -1) {
        job.resultname = 'result_[#####].' + job.template.outputExt;
        job.template.imageSequence = true;
    }

    // setup paths
    job.workpath = path.join(settings.workpath, job.uid);
    job.output   = job.output || path.join(job.workpath, job.resultname);
    mkdirp.sync(job.workpath);

    return Promise.resolve(job)
};
