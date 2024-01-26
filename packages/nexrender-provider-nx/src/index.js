const fetch = require('node-fetch');
const fs = require('fs');

const upload = async (job, settings, src, params) => {
    if (!params.url) throw new Error('Provider NX: URL not provided.')

    const file = fs.createReadStream(src);
    const fileSize = fs.statSync(src).size;
    const startedAt = Date.now();

    settings.logger.log(`[${job.uid}] action-upload-nx: input file ${src}`)

    // 1. post request to our api to get the upload url
    const res = await fetch(params.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const dat = await res.json();

    if (dat.error) {
        throw new Error(dat.error);
    }

    const { upload_url, finilize_url } = dat;

    // 2. upload the file to the url
    const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: {
            'Content-Length': fileSize,
        },
        body: file,
    });

    (await uploadRes.text());

    const finilizeRes = await fetch(finilize_url, {
        method: 'POST',
    });

    (await finilizeRes.text());

    settings.logger.log(`[${job.uid}] action-upload-nx: upload complete ${src} in ${Date.now() - startedAt}ms`)

    return job;
}

module.exports = {
    upload
}
