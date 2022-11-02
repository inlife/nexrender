const rimraf = require('rimraf')
const path = require('path')

/**
 * Clean up all workpath files and remove folder
 */
module.exports = function(job, settings) {
    if (settings.skipCleanup) {
        settings.logger.log(`[${job.uid}] skipping the clean up...`);
        return Promise.resolve(job)
    }

    return new Promise((resolve) => {
        settings.logger.log(`[${job.uid}] cleaning up...`);

        // sometimes this attribute (workpath) is undefined
        if (!job.workpath) {
            job.workpath = path.join(settings.workpath, job.uid)
        }

        rimraf(job.workpath, {glob: false}, (err) => {
            if (!err) {
                settings.logger.log(`[${job.uid}] Temporary AfterEffects project deleted. If you want to inspect it for debugging, use "--skip-cleanup"`)
            } else {
                settings.logger.log(`[${job.uid}] Temporary AfterEffects could not be deleted. (Error: ${err.code}). Please delete the folder manually: ${job.workpath}`)
            }

            resolve(job)
        })
    })
};

