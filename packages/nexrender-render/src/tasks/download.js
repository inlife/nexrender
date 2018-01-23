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
        fs.copyFile(src, dstPath, (err) => {
            return (err ? reject(err) : resolve());
        });
    });
}

/**
 * This task is used to download every asset in the "project.asset"
 */
module.exports = function(project, settings) {
    return new Promise((resolve, reject) => {
        if (settings.logger) settings.logger(`[${project.uid}] downloading assets...`);

        // iterate over each asset and download it (copy it)
        Promise.all(project.assets.map((asset) => {
            if (asset.type === 'url' || !isLocalPath(asset.src)) {
                return download(asset.src, project.workpath);
            } else if (asset.type === 'path' || isLocalPath(asset.src)) {
                return copy(asset.src, project.workpath);
            }
        })).then(() => {
            return resolve(project);
        }).catch((err) => {
            return reject(err);
        });

    });
};
