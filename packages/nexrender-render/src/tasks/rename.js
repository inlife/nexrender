'use strict';

const fs        = require('fs')
const path      = require('path')
const url       = require('url')

/**
 * This task renames assets from their original name
 * to one, that is provided under "asset.name"
 */
module.exports = function(job, settings) {
    return new Promise((resolve, reject) => {

        if (settings.logger) settings.logger(`[${job.uid}] renaming assets...`);

        // iterate over each file and create rename(move) promises
        const promises = job.assets.map(asset => {
            let src = path.join( job.workpath, path.basename(url.parse(asset.src).pathname));
            let dst = path.join( job.workpath, asset.name );

            if (src === dst) return Promise.resolve();

            // remove file if it existed
            if (fs.existsSync(dst)) {
                fs.unlinkSync(dst, () => {});
            }

            return new Promise((resolve, reject) => {
                fs.rename(src, dst, err => err ? reject(err) : resolve());
            })
        });

        return Promise.all(promises)
            .then(_ => resolve(job))
            .catch(err => reject(err))
    });
};
