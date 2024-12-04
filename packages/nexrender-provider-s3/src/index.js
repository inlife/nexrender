const fs = require('fs')
const uri = require('./uri')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { fromIni } = require('@aws-sdk/credential-providers')
const { Upload } = require('@aws-sdk/lib-storage')

/* return a credentials object if possible, otherwise return undefined */
const getCredentials = params => {
    if (params && params.profile) {
        return fromIni({ profile: params.profile })
    } else if (params && params.accessKeyId && params.secretAccessKey) {
        return {
            accessKeyId: params.accessKeyId,
            secretAccessKey: params.secretAccessKey
        }
    } else if (params && params.RoleArn && params.RoleSessionName) {
        return {
            roleArn: params.RoleArn,
            roleSessionName: params.RoleSessionName,
            ...params
        }
    } else if (process.env.AWS_PROFILE) {
        return fromIni({ profile: process.env.AWS_PROFILE })
    } else if (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
        }
    }
}

/* create new S3 client instance */
const createS3Client = (params, credentials) => {
    if (params.endpoint) {
        return new S3Client({
            region: params.region || 'auto',
            endpoint: params.endpoint,
            credentials: credentials,
            forcePathStyle: true, // Required for custom endpoints
            ...(params.signatureVersion && { signatureVersion: params.signatureVersion }),
        })
    }

    return new S3Client({
        region: params.region,
        credentials: credentials
    })
}

/* define public methods */
const download = async (job, settings, src, dest, params) => {
    src = src.replace('s3://', 'http://')
    let parsed = {}
    try { parsed = uri(src) } catch (err) {
        // ignore
    }

    if (!parsed.bucket) {
        throw new Error('S3 bucket not provided.')
    }

    if (!parsed.key) {
        throw new Error('S3 key not provided.')
    }

    const credentials = getCredentials(params.credentials)
    const s3Client = createS3Client(params, credentials)

    const command = new GetObjectCommand({
        Bucket: parsed.bucket,
        Key: parsed.key,
    })

    try {
        const response = await s3Client.send(command)
        const writeStream = fs.createWriteStream(dest)

        return new Promise((resolve, reject) => {
            response.Body.pipe(writeStream)
                .on('error', reject)
                .on('finish', resolve)
        })
    } catch (err) {
        throw new Error(`S3 download failed: ${err.message}`)
    }
}

const upload = async (job, settings, src, params, onProgress, onComplete) => {
    if (!params.endpoint && !params.region) {
        throw new Error('S3 region or endpoint not provided.')
    }

    if (!params.bucket) {
        throw new Error('S3 bucket not provided.')
    }

    if (!params.key) {
        throw new Error('S3 key not provided.')
    }

    const credentials = getCredentials(params.credentials)
    const s3Client = createS3Client(params, credentials)

    const fileStream = fs.createReadStream(src)
    const uploadParams = {
        Bucket: params.bucket,
        Key: params.key,
        Body: fileStream,
        ContentType: params.contentType || "application/octet-stream",
        ...(params.acl && { ACL: params.acl }),
        ...(params.metadata && { Metadata: params.metadata }),
        ...(params.contentDisposition && { ContentDisposition: params.contentDisposition }),
        ...(params.cacheControl && { CacheControl: params.cacheControl })
    }

    const output = params.endpoint ?
        `${params.endpoint}/${params.bucket}/${params.key}` :
        `https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}`

    settings.logger.log(`[${job.uid}] action-upload: input file ${src}`)
    settings.logger.log(`[${job.uid}] action-upload: output file ${output}`)

    try {
        const upload = new Upload({
            client: s3Client,
            params: uploadParams
        })

        upload.on('httpUploadProgress', (progress) => {
            const percent = Math.ceil((progress.loaded / progress.total) * 100)
            if (typeof onProgress === 'function') {
                onProgress(job, percent)
            }
            settings.logger.log(`[${job.uid}] action-upload: upload progress ${percent}%...`)
        })

        const result = await upload.done()

        if (typeof onComplete === 'function') {
            onComplete(job, result.Location)
        }
        settings.logger.log(`[${job.uid}] action-upload: upload complete: ${result.Location}`)
    } catch (err) {
        throw new Error(`S3 upload failed: ${err.message}`)
    }
}

module.exports = {
    download,
    upload,
}
