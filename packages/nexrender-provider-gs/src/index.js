const fs  = require('fs')
const {Storage} = require('@google-cloud/storage')

/* initialize google cloud storage */
let storage;

if (process.env.NEXRENDER_GCS_KEY_FILE) {
    storage = new Storage({
        keyFilename: process.env.NEXRENDER_GCS_KEY_FILE
    })
} else {
    storage = new Storage()
}

/* define public methods */
// eslint-disable-next-line
const download = (job, settings, src, dest, params, type) => {
    const parsed_src = src.replace('gs://', '').split('/')
    const bucket_name = parsed_src[0]
    const item = parsed_src.slice(1).join('/')
    const file = fs.createWriteStream(dest)

    if (!bucket_name) {
        return Promise.reject(new Error('GCS bucket not provided.'))
    }
    if (!item) {
        return Promise.reject(new Error('GCS item not provided.'))
    }

    return new Promise((resolve, reject) => {
        const stream = storage
            .bucket(bucket_name)
            .file(item)
            .createReadStream();

        stream.on('error', reject);
        file.on('error', reject);
        file.on('finish', resolve);

        stream.pipe(file);
    })
}

const upload = (job, settings, src, params) => {
    if (!params.bucket) {
        return Promise.reject(new Error('GCS bucket not provided.'))
    }
    if (!params.item) {
        return Promise.reject(new Error('GCS item not provided.'))
    }

    const onUploadStart = () => {
        settings.logger.log(`[${job.uid}] action-upload: upload started`)
    }

    const onUploadEnd = () => {
        settings.logger.log(`[${job.uid}] action-upload: upload complete`)
    }

    return new Promise((resolve, reject) => {
        const bucket = storage.bucket(params.bucket)
        const file = bucket.file(params.item)
        let options = {
            metadata: {}
        }
        if (params.contentType) {
            options.metadata = {
                ...options.metadata,
                contentType: params.contentType
            }
        }
        if (params.cacheControl) {
            options.metadata = {
                ...options.metadata,
                cacheControl: params.cacheControl
            }
        }
        if (params.resumable) {
            options = {
                ...options,
                resumable: params.resumable
            }
        }
        const in_stream = fs.createReadStream(src)
            .on('error', reject)
        const out_stream = file.createWriteStream(options)
            .on('error', reject)
            .on('finish', ()=> {
                onUploadEnd()
                resolve()
            })
            .on('pipe', onUploadStart)
        in_stream.pipe(out_stream)
    })
}

module.exports = {
    download,
    upload,
}
