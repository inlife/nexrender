const fs       = require('fs')
const url      = require('url')
const path     = require('path')
const fetch    = require('node-fetch')
const requireg = require('requireg')

function isRemoteFileURL(src) {
    return src.indexOf('http://') !== -1 || src.indexOf('https://') !== -1;
}

const download = (job, asset) => {
    const destPath = path.join(job.workpath, asset.layer || path.basename(asset.src))

    // TODO: remove (deprecation)
    // additional helper to guess that asset is an url
    if (isRemoteFileURL(asset.src)) {
        asset.provider = 'http'
    }

    // handle different providers of assets
    switch (asset.provider) {
        case 'text':
            return Promise.reject(new Error('text data provider not implemeneted')); break;

        case 'raw':
            return Promise.reject(new Error('raw data (byte array) provider not implemeneted')); break;

        case 'base64':
            return Promise.reject(new Error('base64 data (byte array) provider not implemeneted')); break;

        case 'ftp':
            return Promise.reject(new Error('ftp provider not implemeneted')); break;

        case 'http':
            /* TODO: move to external module */
            /* TODO: add auth handling */
            return fetch(asset.src)
                .then(res => {
                    const dest = fs.createWriteStream(destPath, {
                        autoClose: true,
                    })

                    res.body.pipe(dest)
                })
            break;

        case 's3':
            try {
                return requireg('@nexrender/provider-aws-s3').download(asset.src, destPath, asset.credentials);
            } catch (e) {
                return Promise.reject(new Error('AWS S3 module is not installed, use \"npm i -g @nexrender/aws-s3\" to install it.'))
            }
            break;

        case 'file':
            /* plain asset stream copy */
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
            break;
    }

    return job;
}

/**
 * This task is used to download/copy every entry in the "job.assets"
 * and place it nearby the project asset
 */
module.exports = function(job, settings) {
    settings.logger.log(`[${job.uid}] downloading assets...`)

    const promises = [].concat(
        download(job, job.template),
        job.assets.map(asset => download(job, asset))
    )

    return Promise.all(promises).then(_ => job);
}
