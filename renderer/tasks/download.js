'use strict';

const download = require('download');
const fs       = require('fs-extra');
const path     = require('path');
const AWS      = require('aws-sdk');
const url      = require('url');


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

function downloadFromS3(bucket, key, dstDir, dstName) {
    var s3 = new AWS.S3();
    var params = {Bucket: bucket, Key: key};
    var file = fs.createWriteStream(path.join(dstDir, dstName));
    return new Promise((resolve, reject) => {
        file.on('close', function(){
            resolve();
        });
        s3.getObject(params).createReadStream().on('error', function(err) {
            reject(err);
        }).pipe(file);
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
            if (asset.type === 's3') {
                return downloadFromS3(asset.bucket, asset.key, project.workpath, path.basename(url.parse(asset.src).pathname));
            } else if (asset.type === 'url' || !isLocalPath(asset.src)) {
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
