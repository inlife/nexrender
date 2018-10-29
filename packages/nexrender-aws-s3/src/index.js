const fs    = require('fs')
const aws   = require('aws-sdk')

/* create static api instance */
const s3instance = new aws.S3();

/* define public methods */
const download = (src, dest, options) => {
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

const upload = () => {
    return Promise.reject(new Error('s3 provider not implemeneted'));
}

module.exports = {
    download,
    upload
}
