const path = require('path');
const AdmZip = require('adm-zip');
const { extractFull } = require('node-7z');

const decompress = async (job, settings, asset, action) => {
    if (asset.type === 'data') {
        return false;
    }

    const supportedFormats = {
        'zip': ['zip'],
        'zip-7z': ['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz']
    };

    // skip if the file doesn't have the correct extension
    if (!supportedFormats[action.format].map(format => asset.dest.indexOf('.' + format) !== -1).includes(true)) {
        return false;
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
            // retry 3 times
            for (let i = 0; i < 3; i++) {
                try {
                    const promise = new Promise((resolve, reject) => {
                        const myStream = extractFull(asset.dest, job.workpath, {
                            $progress: true
                        })

                        let lastProgress = 0;
                        myStream.on('progress', function (progress) {
                            let progressPercent = Math.round(progress.percent);
                            if (lastProgress !== progressPercent && progressPercent % 10 === 0) {
                                if (settings.logger) settings.logger.log(`[action-decompress] Extracting ${progressPercent}%`);
                                lastProgress = progressPercent;
                            }
                        })

                        myStream.on('end', function () {
                            resolve();
                        })

                        myStream.on('error', (err) => reject(err.stderr))
                    });

                    await promise;
                } catch (err) {
                    if (i >= 2) {
                        throw err;
                    }

                    if (settings.logger) settings.logger.log(`[action-decompress] Failed to extract ${asset.dest} due to ${err}, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
    }

    if (asset.decompressed) {
        asset.src = asset.dest;
        asset.dest = path.join(job.workpath, asset.decompressed);
    }
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
