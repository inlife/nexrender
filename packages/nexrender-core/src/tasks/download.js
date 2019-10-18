const fs       = require('fs')
const url      = require('url')
const path     = require('path')
const fetch    = require('node-fetch')
const uri2path = require('file-uri-to-path')
const data2buf = require('data-uri-to-buffer')
const {expandEnvironmentVariables} = require('../helpers/path')

// TODO: redeuce dep size
const requireg = require('requireg')

const download = (job, settings, asset) => {
    if (asset.type == 'data') return Promise.resolve();

    const uri = global.URL ? new URL(asset.src) : url.parse(asset.src)
    const protocol = uri.protocol.replace(/\:$/, '');
    let destName = '';

    /* if asset doesnt have a file name, make up a random one */
    if (protocol === 'data' && !asset.layerName) {
        destName = Math.random().toString(36).substring(2);
    } else {
        destName = path.basename(asset.src)
        destName = destName.indexOf('?') !== -1 ? destName.slice(0, destName.indexOf('?')) : destName;
        /* ^ remove possible query search string params ^ */;

        /* prevent same name file collisions */
        if (fs.existsSync(path.join(job.workpath, destName))) {
            destName = Math.random().toString(36).substring(2) + '.' + path.extname(asset.src);
        }
    }

    asset.dest = path.join(job.workpath, destName);

    switch (protocol) {
        /* built-in handlers */
        case 'data':
            return new Promise((resolve, reject) => {
                try {
                    fs.writeFile(
                        asset.dest, data2buf(asset.src),
                        err => err ? reject(err) : resolve()
                    );
                } catch (err) {
                    reject(err)
                }
            });
            break;

        case 'http':
        case 'https':
            /* TODO: maybe move to external package ?? */
            return fetch(asset.src, asset.params || {})
                .then(res => res.ok ? res : Promise.reject({reason: 'Initial error downloading file', meta: {url, error: res.error}}))
                .then(res => {
                    const stream = fs.createWriteStream(asset.dest)
                    let timer

                    return new Promise((resolve, reject) => {
                        const errorHandler = (error) => {
                            reject(new Error({reason: 'Unable to download file', meta: {url, error}}))
                        };

                        res.body
                            .on('error', errorHandler)
                            .pipe(stream)

                        stream
                            .on('error', errorHandler)
                            .on('finish', resolve)
                    })
                });
            break;

        case 'file':
            /* plain asset stream copy */
            const rd = fs.createReadStream(uri2path(expandEnvironmentVariables(asset.src)))
            const wr = fs.createWriteStream(asset.dest)

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

        /* custom/external handlers */
        default:

            try {
                return requireg('@nexrender/provider-' + protocol).download(job, settings, asset.src, asset.dest, asset.params || {});
            } catch (e) {
                if (e.message.indexOf('Could not require module') !== -1) {
                    return Promise.reject(new Error(`Couldn\'t find module @nexrender/provider-${protocol}, Unknown protocol provided.`))
                }

                throw e;
            }

            break;
    }
}

/**
 * This task is used to download/copy every entry in the "job.assets"
 * and place it nearby the project asset
 */
module.exports = function(job, settings) {
    settings.logger.log(`[${job.uid}] downloading assets...`)

    const promises = [].concat(
        download(job, settings, job.template),
        job.assets.map(asset => download(job, settings, asset))
    )

    return Promise.all(promises).then(_ => job);
}
