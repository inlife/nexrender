const {name} = require('./package.json')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

module.exports = (job, settings, { input, params }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }
    if (!params) {
        throw new Error(`Parameters are missing.`)
    }
    if (!params.region) {
        throw new Error(`Region must be provided.`)
    }
    if (!params.bucket) {
        throw new Error(`Bucket must be provided.`)
    }
    if (!params.key) {
        throw new Error(`Key must be provided.`)
    }
    if (!params.acl) {
        throw new Error(`ACL must be provided.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);

    settings.logger.log(`[${job.uid}] starting action-upload action`)

    return new Promise((resolve, reject) => {
        var output = `https://s3-${params.region}.amazonaws.com/${params.bucket}/${params.key}`
        settings.logger.log(`[${job.uid}] action-upload: input file ${input}`)
        settings.logger.log(`[${job.uid}] action-upload: output file ${output}`)

        fs.readFile(input, (error, data) => {
            if (error) {
                reject(error)
            }

            let s3 = new AWS.S3({
                region: params.region
            })

            let request = {
                Bucket: params.bucket,
                Key: params.key,
                ACL: params.acl,
                Body: data
            }
            
            s3.putObject(request, (error, data) => {
                if (error) {
                    reject(error)
                }

                settings.logger.log(`[${job.uid}] action-upload: upload complete`)
                resolve()
            }).on('httpUploadProgress', (e) => {
                var progress = e.loaded / e.total * 100
                settings.logger.log(`[${job.uid}] action-upload: upload progress ${progress}%...`)
            })
        })
    })
}