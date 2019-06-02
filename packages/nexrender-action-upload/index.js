const {name} = require('./package.json')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

module.exports = (job, settings, { input, provider, params }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }
    if (!provider) {
        throw new Error(`Provider is missing.`)
    }
    if (!params) {
        throw new Error(`Parameters are missing.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);

    settings.logger.log(`[${job.uid}] starting action-upload action`)

    switch (provider) {
        /* custom/external handlers */
        case 's3':
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

            try {
                const s3 = requireg('@nexrender/provider-s3')
                
                const onProgress = (e) => {
                    var progress = e.loaded / e.total * 100
                    settings.logger.log(`[${job.uid}] action-upload: upload progress ${progress}%...`)
                }

                const onComplete = () => {
                    settings.logger.log(`[${job.uid}] action-upload: upload complete`)
                }

                const output = `https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}`
                settings.logger.log(`[${job.uid}] action-upload: input file ${input}`)
                settings.logger.log(`[${job.uid}] action-upload: output file ${output}`)
                
                return s3.upload(input, params.region, params.bucket, params.key, params.acl, onProgress, onComplete);
            } catch (e) {
                return Promise.reject(new Error('AWS S3 module is not installed, use \"npm i -g @nexrender/provider-s3\" to install it.'))
            }
            break;
        default:
            return Promise.reject(new Error('unknown provider: ' + provider))
            break;
    }
}