const fs  = require('fs')
const uri = require('amazon-s3-uri')
const aws = require('aws-sdk/clients/s3')

let regions = {}
let endpoints = {}

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

const s3instanceWithEndpoint = endpoint => {
    const key = endpoint || 0

    if (!endpoints.hasOwnProperty(key)) {
        const options = { endpoint: endpoint }

        if (process.env.AWS_ACCESS_KEY) options.accessKeyId = process.env.AWS_ACCESS_KEY
        if (process.env.AWS_SECRET_KEY) options.secretAccessKey = process.env.AWS_SECRET_KEY

        endpoints[key] = new aws(options)
    }

    return endpoints[key]
}

/* define public methods */
const download = (job, settings, src, dest, params, type) => {
    src = src.replace('s3://', 'http://')

    if (src.indexOf('digitaloceanspaces.com') !== -1) {
        throw new Error('nexrender: Digital Ocean Spaces is not yet supported by the package: amazon-s3-uri')
    }

    const parsed = uri(src)
    const file = fs.createWriteStream(dest)

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

        const s3instance = params.endpoint ?
            s3instanceWithEndpoint(params.endpoint) :
            s3instanceWithRegion(params.region)

        s3instance
            .getObject(awsParams)
            .createReadStream()
            .on('error', reject)
            .pipe(file)
    })
}

const upload = (job, settings, src, params, onProgress, onComplete) => {
    const file = fs.createReadStream(src);

    if (!params.endpoint && !params.region) {
        return Promise.reject(new Error('S3 region or endpoint not provided.'))
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

    const onUploadProgress = (e) => {
        const progress = Math.ceil(e.loaded / e.total * 100)
        if (typeof onProgress == 'function') {
            onProgress(job, progress);
        }
        settings.logger.log(`[${job.uid}] action-upload: upload progress ${progress}%...`)
    }

    const onUploadComplete = (file) => {
        if (typeof onComplete == 'function') {
            onComplete(job, file);
        }
        settings.logger.log(`[${job.uid}] action-upload: upload complete: ${file}`)
    }

    const output = params.endpoint ?
        `${endpoint}/${params.bucket}/${params.key}` :
        `https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}`;
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
        if (params.metadata) awsParams.Metadata = params.metadata;

        const s3instance = params.endpoint ?
            s3instanceWithEndpoint(params.endpoint) :
            s3instanceWithRegion(params.region)

        s3instance
            .upload(awsParams, (err, data) => {
                if (err) {
                    reject(err)
                }
                else
                {
                    onUploadComplete(data.Location)
                    resolve()
                }
            })
            .on('httpUploadProgress', onUploadProgress)
    })
}

module.exports = {
    download,
    upload,
}

/* tests */
// download({}, {}, 's3://BUCKET.s3.REGION.amazonaws.com/KEY', 'test.txt')
// download({}, {}, 's3://BUCKET.REGION.digitaloceanspaces.com/KEY', 'test.txt')
