const fs  = require('fs')
const uri = require('amazon-s3-uri')
const aws = require('aws-sdk/clients/s3')

let regions = {}

/* create or get api instance with region */
const s3instanceWithRegion = region => {
    const key = region || 0

    if (!regions.hasOwnProperty(key)) {
        const options = { region: region }

        /* use manual settings, overriding ./aws/credentials */
        if (process.env.AWS_ACCESS_KEY) options.accessKeyId = process.env.AWS_ACCESS_KEY
        if (process.env.AWS_SECRET_KEY) options.secretAccessKey = process.env.AWS_SECRET_KEY

        regions[key] = new aws(options)
    }

    return regions[key]
}

/* define public methods */
const download = (job, settings, src, dest, params, type) => {
    src = src.replace('s3://', 'http://')

    if (src.indexOf('digitaloceanspaces.com') !== -1) {
        throw new Error('nexrender: Digital Ocean Spaces is not yet supported by the package: amazon-s3-uri')
    }

    const parsed = uri(src)
    const file = fs.createWriteStream(dest);

    console.log(parsed)

    if (!parsed.bucket) {
        return Promise.reject(new Error('S3 bucket not provided.'))
    }

    if (!parsed.key) {
        return Promise.reject(new Error('S3 key not provided.'))
    }

    return new Promise((resolve, reject) => {
        file.on('close', resolve);

        const awsParams = {
            Bucket: parsed.bucket,
            Key: parsed.key,
        }

        s3instanceWithRegion(parsed.region)
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
    settings.logger.log(`[${job.uid}] action-upload: input file ${src}`)
    settings.logger.log(`[${job.uid}] action-upload: output file ${output}`)

    return new Promise((resolve, reject) => {
        file.on('error', (err) => reject(err))

        const awsParams = {
            Bucket: params.bucket,
            Key: params.key,
            ACL: params.acl,
            Body: file,
        }

        s3instanceWithRegion(params.region)
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

/* tests */
// download({}, {}, 's3://BUCKET.s3.REGION.amazonaws.com/KEY', 'test.txt')
// download({}, {}, 's3://BUCKET.REGION.digitaloceanspaces.com/KEY', 'test.txt')
