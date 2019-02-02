const fs   = require('fs')
const path = require('path')

/**
 * Remove directory recursively
 */
const rmdirRecursively = (target) => {
    if (!fs.existsSync(target)) return;

    fs.readdirSync(target).map(entry => {
        const entryPath = path.join(target, entry);
        const result = fs.lstatSync(entryPath).isDirectory()
            ? rmdirRecursively(entryPath)
            : fs.unlinkSync(entryPath)
    })

    fs.rmdirSync(target)
}

/**
 * Clean up all workpath files and remove folder
 */
module.exports = function(job, settings) {
    if (!settings.skipCleanup) {
        settings.logger.log(`[${job.uid}] cleaning up...`);
        rmdirRecursively(job.workpath)
    } else {
        settings.logger.log(`[${job.uid}] skipping the clean up...`);
    }

    return Promise.resolve(job)
};
