'use strict';

const download = require('download');
const fs       = require('fs-extra');
const path     = require('path');

function isLocalPath(src) {
    return src.indexOf('http://') === -1 && src.indexOf('https://') === -1;
}

function copy(src, dstDir) {
    return new Promise((resolve, reject) => {
        const dstPath = path.join(dstDir, path.basename(src));
        fs.copy(src, dstPath, (err) => {
            return (err ? reject(err) : resolve());
        });
    });
}

/**
 * This task is used to download every asset in the "project.asset"
 */
module.exports = function(project) {
    return new Promise((resolve, reject) => {

        console.info(`[${project.uid}] downloading assets...`);

        // iterate over each asset to check for custom template
        for (let asset of project.assets) {
            // check for custom template
            if (asset.type === 'project') {
                project.template = asset.name;
            }
        }

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
