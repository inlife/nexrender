const path = require('path');
const AdmZip = require('adm-zip');
const { extractFull } = require('node-7z');

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
            const entries = zip.getEntries();

            // Check if zip has a single root folder
            const rootFolders = new Set(entries.map(entry => entry.entryName.split('/')[0]));
            const hasSingleRootFolder = rootFolders.size === 1 && entries.every(entry => entry.entryName.startsWith([...rootFolders][0] + '/'));

            if (hasSingleRootFolder) {
                // Extract all files, removing the root folder from paths
                const rootFolder = [...rootFolders][0];
                entries.forEach(entry => {
                    if (!entry.isDirectory) {
                        const relativePath = entry.entryName.substring(rootFolder.length + 1);
                        zip.extractEntryTo(entry.entryName, job.workpath, false, true, false, relativePath);
                    }
                });
            } else {
                // Default behavior - extract all files
                zip.extractAllTo(job.workpath, action.overwrite || false);
            }
            break;

        case 'zip-7z':
            const promise = new Promise((resolve, reject) => {
                const myStream = extractFull(asset.dest, job.workpath, {
                    $progress: true
                })

                myStream.on('progress', function (progress) {
                    settings.logger.log(`[action-decompress] Extracting ${progress.percent}%`);
                })

                myStream.on('end', function () {
                    resolve();
                })

                myStream.on('error', (err) => reject(err))
            });

            return promise;

        default:
            return Promise.resolve();
    }

    if (asset.decompressed) {
        asset.src = asset.dest;
        asset.dest = path.join(job.workpath, asset.decompressed);
    }

    return Promise.resolve();
}

module.exports = (job, settings, action, type) => {
    if (type !== 'prerender') {
        return Promise.reject("'action-decompress' module should be used only in 'prerender' section")
    }

    if (['zip', 'zip-7z'].indexOf(action.format) === -1) {
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
