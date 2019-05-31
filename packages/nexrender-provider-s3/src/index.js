const fs    = require('fs')
const aws   = require('aws-sdk')

/* create static api instance */
const s3instance = new aws.S3();

/* create api instance with region */
const s3instanceWithRegion = (region) => {
    return new aws.S3({
        region: region
    })
}

/* define public methods */
const download = (src, dest, options, type) => {
    let file = fs.createWriteStream(dest);

    return new Promise((resolve, reject) => {
        file.on('close', resolve);

        s3instance
            .getObject(options)
            .createReadStream()
            .on('error', reject)
            .pipe(file)
        ;
    })
}

const upload = (src, region, bucket, key, acl, onProgress, onComplete) => {
    return new Promise((resolve, reject) => {
        fs.readFile(input, (err, data) => {
            if (err) {
                reject(err)
            }

            const params = {
                Bucket: bucket,
                Key: key,
                ACL: acl
            }

            s3instanceWithRegion(region)
                .putObject(params, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    onComplete()
                    resolve()
                })
                .on('httpUploadProgress', onProgress)
        })
    })
}

module.exports = {
    download,
    upload
}
