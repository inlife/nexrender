'use strict';

const fs    = require('fs')
const url   = require('url')
const path  = require('path')
const fetch = require('node-fetch')

function isRemoteFileURL(src) {
    return src.indexOf('http://') !== -1 || src.indexOf('https://') !== -1;
}

/**
 * This task is used to download/copy every entry in the "job.assets"
 * and place it nearby the project asset
 */
module.exports = function(job, settings) {
    if (settings.logger) settings.logger.log(`[${job.uid}] downloading assets...`)

    const promises = job.assets.map(asset => {
        const destPath = path.join(job.workpath, asset.name || path.basename(asset.src))

        // additional helper to guess that asset is an url
        if (isRemoteFileURL(asset.src)) {
            asset.provider = 'http'
        }

        // handle different providers of assets
        switch (asset.provider) {
            case 'http':
                return fetch(asset.src)
                    .then(res => {
                        const dest = fs.createWriteStream(destPath, {
                            autoClose: true,
                        })

                        res.body.pipe(dest)
                    })
                break;

            case 'ftp': Promise.reject(new Error('ftp provider not implemeneted')); break;
            case 's3':
                try {
                    return require('@nexrender/aws-s3').download(
                        asset.src, destPath,
                        { Bucket: asset.bucket, Key: asset.key }
                    );
                } catch (e) {
                    Promise.reject(new Error('AWS S3 module is not installed, use \"npm i @nexrender/aws-s3 -g\" to install it.'))
                }
                break;

            // plain asset stream copy
            default:
                const rd = fs.createReadStream(asset.src)
                const wr = fs.createWriteStream(destPath)

                return new Promise(function(resolve, reject) {
                    rd.on('error', reject)
                    wr.on('error', reject)
                    wr.on('finish', resolve)
                    rd.pipe(wr);
                }).catch(function(error) {
                    rd.destroy()
                    wr.end()
                    throw error
                })
        }
    })

    return Promise.all(promises)
}
