'use strict';

const fs    = require('fs')
const url   = require('url')
const path  = require('path')
const fetch = require('node-fetch')

function isRemoteFileURL(src) {
    return src.indexOf('http://') !== -1 || src.indexOf('https://') !== -1;
}

/**
 * This task is used to download/copy every entry in the "job.files"
 * and place it nearby the project file
 */
module.exports = function(job, settings) {
    if (settings.logger) settings.logger(`[${job.uid}] downloading files...`)

    const promises = job.files.map(file => {
        const destPath = path.join(job.workpath, file.name || path.basename(file.src))

        // additional helper to guess that file is an url
        if (isRemoteFileURL(file.src)) {
            file.provider = 'http'
        }

        // handle different providers of files
        switch (file.provider) {
            case 'http':
                return fetch(file.src)
                    .then(res => {
                        const dest = fs.createWriteStream(destPath, {
                            autoClose: true,
                        })

                        res.body.pipe(dest)
                    })
                break;

            case 'ftp': Promise.reject(new Error('ftp provider not implemeneted')); break;
            case 's3':  Promise.reject(new Error('s3 provider not implemeneted')); break;

            // plain file stream copy
            default:
                const rd = fs.createReadStream(file.src)
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
