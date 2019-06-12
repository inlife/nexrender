const fs  = require('fs')
const aws = require('aws-sdk')

let regions = {}

/* create or get api instance with region */
const s3instanceWithRegion = region => {
    const key = region || 0

    if (!regions.hasOwnProperty(key)) {
        regions[key] = new aws.S3({ region: region })
    }

    return regions[key]
}

/* define public methods */
const download = (job, settings, src, dest, params, type) => {
    const file = fs.createWriteStream(dest);

    if (!params.region) {
        return Promise.reject(new Error('S3 region not provided.'))
    }
    if (!params.bucket) {
        return Promise.reject(new Error('S3 bucket not provided.'))
    }
    if (!params.key) {
        return Promise.reject(new Error('S3 key not provided.'))
    }

    return new Promise((resolve, reject) => {
        file.on('close', resolve);

        const awsParams = {
            Bucket: params.bucket,
            Key: params.key,
        }

        s3instanceWithRegion(params.region)
            .getObject(awsParams)
            .createReadStream()
            .on('error', reject)
            .pipe(file)
        ;
    })
}

const upload = (job, settings, src, params) => {
    const file = fs.createReadStream(src);

    if (!params.region) {
        return Promise.reject(new Error('S3 region not provided.'))
    }
    if (!params.bucket) {
        return Promise.reject(new Error('S3 bucket not provided.'))
    }
    if (!params.key) {
        return Promise.reject(new Error('S3 key not provided.'))
    }
    if (!params.acl) {
        return Promise.reject(new Error('S3 ACL not provided.'))
    }

    const onProgress = (e) => {
        const progress = Math.ceil(e.loaded / e.total * 100)
        settings.logger.log(`[${job.uid}] action-upload: upload progress ${progress}%...`)
    }

    const onComplete = () => {
        settings.logger.log(`[${job.uid}] action-upload: upload complete`)
    }

    const output = `https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}`
    settings.logger.log(`[${job.uid}] action-upload: input file ${input}`)
    settings.logger.log(`[${job.uid}] action-upload: output file ${output}`)

    return new Promise((resolve, reject) => {
        file.on('error', (err) => reject(err))

        const awsParams = {
            Bucket: params.bucket,
            Key: params.key,
            ACL: params.acl,
            Body: file,
        }

        s3instanceWithRegion(region)
            .upload(awsParams, (err, data) => {
                if (err) {
                    reject(err)
                }
                else
                {
                    onComplete()
                    resolve()
                }
            })
            .on('httpUploadProgress', onProgress)
    })
}

module.exports = {
    download,
    upload,
}
