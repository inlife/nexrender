const AdmZip = require('adm-zip');

const decompress = (job, settings, asset, action) => {
    if (asset.type === 'data') {
        return Promise.resolve();
    }

    if (asset.dest.indexOf('.' + action.format) === -1) {
        return Promise.resolve();
    }

    switch (action.format) {
        case 'zip':
            const zip = new AdmZip(asset.dest);
            zip.extractAllTo(job.workpath, action.overwrite || false);
            return Promise.resolve();
    }
}

module.exports = (job, settings, action, type) => {
    if (type !== 'prerender') {
        return Promise.reject("'action-decompress' module should be used only in 'prerender' section")
    }

    if (['zip'].indexOf(action.format) === -1) {
        return Promise.reject(`'action-decompress' module doesn't support '${action.format}' format archives`)
    }

    const promises = [].concat(
        decompress(job, settings, job.template, action),
        job.assets.map(asset => decompress(job, settings, asset, action))
    );

    return Promise
        .all(promises)
        .then(() => job)
}
