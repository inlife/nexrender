const fs       = require('fs')
const url      = require('url')
const path     = require('path')
const requireg = require('requireg')
const fetch    = require('make-fetch-happen')
const uri2path = require('file-uri-to-path')
const data2buf = require('data-uri-to-buffer')
const mime     = require('mime-types')
const {expandEnvironmentVariables} = require('../helpers/path')
const { withTimeout } = require('../helpers/timeout');

const NEXRENDER_DOWNLOAD_TIMEOUT = Number(process.env.NEXRENDER_DOWNLOAD_TIMEOUT) || 3 * 60 * 1000; // 3 minutes timeout by default

const download = (job, settings, asset) => {
    if (asset.type == 'data') return Promise.resolve();

    settings.logger.log(`[${job.uid}] > Downloading asset ${asset.src}...`);

    let uri;
    let protocol;
    let destName = '';

    try {
        // eslint-disable-next-line
        uri = global.URL ? new URL(asset.src) : url.parse(asset.src)
        protocol = uri.protocol.replace(/:$/, '');
    } catch (error) {
        settings.logger.log(`[download] error parsing asset ${asset.src}: ${error}`);
        return Promise.reject(error);
    }

    /* if asset doesnt have a file name, make up a random one */
    if (protocol === 'data' && !asset.layerName) {
        destName = Math.random().toString(36).substring(2);
    } else {
        destName = path.basename(asset.src)
        destName = destName.indexOf('?') !== -1 ? destName.slice(0, destName.indexOf('?')) : destName;
        /* ^ remove possible query search string params ^ */
        destName = decodeURI(destName) /* < remove/decode any special URI symbols within filename */

        /* prevent duplicate filename collisions during parallel fetch */
        if (!asset.sequence) {
            destName = Math.random().toString(36).substring(2) + '-' + destName;
        }
    }

    /* force asset name if it is provided */
    if (asset.name) {
        destName = asset.name
    }

    /* try to guess the extension from data part */
    if (protocol == 'data' && !asset.extension) {
        const databuf = data2buf(asset.src)
        asset.extension = mime.extension(databuf.type) || undefined
    }

    if (asset.extension) {
        destName += '.' + asset.extension
    }

    asset.dest = path.join(job.workpath, destName);

    settings.trackCombined('Asset Download', {
        job_id: job.uid, // anonymized internally
        asset_type: asset.type,
        asset_protocol: protocol,
        asset_extension: asset.extension,
    })

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

        case 'http':
        case 'https':
            // Use default cache path if `settings.cache` param is set to simply `true`
            // Otherwise use value directly (can be string to file path or undefined)
            const cachePath = settings.cache === true ?
                path.join(settings.workpath, "http-cache") :
                settings.cache;

            if (!asset.params) asset.params = {};
            // Asset's own `params.cachePath` takes precedence (including falsy values)
            asset.params.cachePath = Object.hasOwn(asset.params, 'cachePath') ?
                asset.params.cachePath :
                cachePath;

            /* TODO: maybe move to external package ?? */
            const src = asset.src

            try {
                return withTimeout(
                    fetch(src, {
                        ...asset.params,
                        timeout: NEXRENDER_DOWNLOAD_TIMEOUT
                    })
                    .then(res => res.ok ? res : Promise.reject(new Error(`Unable to download file ${src}`)))
                    .then(res => {
                        // Set a file extension based on content-type header if not already set
                        if (!asset.extension) {
                            const contentType = res.headers.get('content-type')
                            const fileExt = mime.extension(contentType) || undefined

                            asset.extension = fileExt
                            const destHasExtension = path.extname(asset.dest) ? true : false
                            // don't do this if asset.dest already has extension else it gives you example.jpg.jpg
                            // like file in case of assets and aep/aepx file
                            if (asset.extension && !destHasExtension) {
                                asset.dest += `.${fileExt}`
                            }
                        }

                        const stream = fs.createWriteStream(asset.dest)

                        return withTimeout(new Promise((resolve, reject) => {
                            const errorHandler = (error) => {
                                reject(new Error('Unable to download file ' + asset.src + ' due to ' + error))
                            };

                            res.body
                                .on('error', errorHandler)
                                .pipe(stream)

                            stream
                                .on('error', errorHandler)
                                .on('finish', resolve)
                        }), NEXRENDER_DOWNLOAD_TIMEOUT, 'Download timed out for asset ' + asset.src)
                    }), NEXRENDER_DOWNLOAD_TIMEOUT, 'Download timed out for asset ' + asset.src)
            } catch (error) {
                settings.logger.log(`[download] error downloading asset ${asset.src}: ${error}`);
                return Promise.reject(error);
            }

        case 'file':
            const filepath = uri2path(expandEnvironmentVariables(asset.src))

            /* add override to use original asset from fs */
            if (asset.useOriginal) {
                asset.dest = filepath
                return Promise.resolve()
            }

            /* plain asset stream copy */
            const rd = fs.createReadStream(filepath)
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

        /* custom/external handlers */
        default:

            try {
                return requireg('@nexrender/provider-' + protocol).download(job, settings, asset.src, asset.dest, asset.params || {});
            } catch (e) {
                if (e.message.indexOf('Could not require module') !== -1) {
                    return Promise.reject(new Error(`Couldn't find module @nexrender/provider-${protocol}, Unknown protocol provided.`))
                }

                throw e;
            }

    }
}

/**
 * This task is used to download/copy every entry in the "job.assets"
 * and place it nearby the project asset
 */
module.exports = function(job, settings) {
    settings.logger.log(`[${job.uid}] downloading assets...`)

    try {
        const promises = [].concat(
            download(job, settings, job.template),
            job.assets.map(asset => download(job, settings, asset))
        )

        return Promise.all(promises).then(() => job);
    } catch (error) {
        settings.logger.log(`[download] error downloading assets: ${error}`);
        return Promise.reject(error);
    }
}
