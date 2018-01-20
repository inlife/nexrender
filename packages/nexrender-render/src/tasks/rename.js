'use strict';

const fs        = require('fs')
const path      = require('path')
const url       = require('url')

/**
 * This task renames assets from their original name
 * to one, that is provided under "asset.name"
 */
module.exports = function(project, settings) {
    return new Promise((resolve, reject) => {

        settings.logger(`[${project.uid}] renaming assets...`);

        // iterate over each file and create rename(move) promises
        const promises = project.assets.map(asset => {
            let src = path.join( project.workpath, path.basename(url.parse(asset.src).pathname));
            let dst = path.join( project.workpath, asset.name );

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
            .then(_ => resolve(project))
            .catch(err => reject(err))
    });
};
