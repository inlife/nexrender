'use strict';

const fs       = require('fs')
const path     = require('path')
const download = require('download')

function isLocalPath(src) {
    return src.indexOf('http://') === -1 && src.indexOf('https://') === -1;
}

function copy(src, dstDir) {
    return new Promise((resolve, reject) => {
        const dstPath = path.join(dstDir, path.basename(src));
        fs.readFile(src, (err, data) => {
            if (err) { return reject(err); }
            fs.writeFile(dstPath, data, (err) => {
                return (err ? reject(err) : resolve());
            });
        })
    });
}

/**
 * This task is used to download every asset in the "job.asset"
 */
module.exports = function(job, settings) {
    return new Promise((resolve, reject) => {
        if (settings.logger) settings.logger(`[${job.uid}] downloading assets...`);

        // iterate over each asset and download it (copy it)
        Promise.all(job.assets.map((asset) => {
            if (asset.type === 'url' || !isLocalPath(asset.src)) {
                return download(asset.src, job.workpath);
            } else if (asset.type === 'path' || isLocalPath(asset.src)) {
                return copy(asset.src, job.workpath);
            }
        })).then(() => {
            return resolve(job);
        }).catch((err) => {
            return reject(err);
        });

    });
};
