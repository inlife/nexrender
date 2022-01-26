const fs       = require('fs')
const url      = require('url')
const path     = require('path')
const fetch    = require('node-fetch').default
const uri2path = require('file-uri-to-path')
const data2buf = require('data-uri-to-buffer')
const mime = require('mime-types')
const {expandEnvironmentVariables} = require('../helpers/path')
const aeFormats = require('../helpers/aeFormats')

// TODO: redeuce dep size
const requireg = require('requireg')

const download = (job, settings, asset) => {
    if (asset.type == 'data') return Promise.resolve();

    // eslint-disable-next-line
    const uri = global.URL ? new URL(asset.src) : url.parse(asset.src)
    const protocol = uri.protocol.replace(/:$/, '');
    let destName = '';

    /* if asset doesnt have a file name, make up a random one */
    if (protocol === 'data' && !asset.layerName) {
        destName = Math.random().toString(36).substring(2);
    } else {
        destName = path.basename(asset.src)
        destName = destName.indexOf('?') !== -1 ? destName.slice(0, destName.indexOf('?')) : destName;
        /* ^ remove possible query search string params ^ */
        destName = decodeURI(destName) /* < remove/decode any special URI symbols within filename */

        /* prevent same name file collisions */
        if (fs.existsSync(path.join(job.workpath, destName))) {
            destName = Math.random().toString(36).substring(2) + path.extname(asset.src);
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
            /* TODO: maybe move to external package ?? */
            const src = asset.src;
            return fetch(src, asset.params || {})
                .then(res => res.ok ? res : Promise.reject({reason: 'Initial error downloading file', meta: {src, error: res.error}}))
                .then(res => {
                    // Set a file extension based on content-type header if not already set
                    if (!asset.extension) {
                      const contentType = res.headers.get('content-type')
                      const destExtension = path.extname(asset.dest)

                      // Get all file extensions by content type
                      // e.g.
                      // > mime.extensions['audio/mpeg']
                      //  [ 'mpga', 'mp2', 'mp2a', 'mp3', 'm2a', 'm3a' ]
                      const fileExtensions = mime.extensions[contentType] || []

                      // Check if extension from path is valid
                      if (destExtension && fileExtensions.indexOf(destExtension) >= 0) {
                        asset.extension = destExtension
                      } else {
                        if (fileExtensions.length > 0) {
                          for (const ext of fileExtensions) {
                            if (aeFormats.indexOf(ext) >= 0) {
                              asset.extension = ext;
                              break;
                            }
                          }
                        }
                      }

                      asset.dest += `.${asset.extension}`
                    }

                    const stream = fs.createWriteStream(asset.dest)

                    return new Promise((resolve, reject) => {
                        const errorHandler = (error) => {
                            reject(new Error({reason: 'Unable to download file', meta: {src, error}}))
                        };

                        res.body
                            .on('error', errorHandler)
                            .pipe(stream)

                        stream
                            .on('error', errorHandler)
                            .on('finish', resolve)
                    })
                });

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

    const promises = [].concat(
        download(job, settings, job.template),
        job.assets.map(asset => download(job, settings, asset))
    )

    return Promise.all(promises).then(() => job);
}
