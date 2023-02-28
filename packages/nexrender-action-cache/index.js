const fs = require('fs');
const path = require('path');

async function findValidateCache(asset, settings, cacheDirectory, ttl){
    if (asset.src.startsWith('file://')) {
        settings.logger.log(`> Skipping cache for ${asset.src}; local file protocol is being used`);
        return;
    }

    const fileName = path.basename(asset.src);
    const maybeCachedFileLocation = path.join(cacheDirectory, fileName);

    if (!fs.existsSync(maybeCachedFileLocation)) {
        settings.logger.log(`> Cached file not found at ${maybeCachedFileLocation}`);
        return;
    }

    if (ttl) {
        const birthtime = fs.statSync(maybeCachedFileLocation).birthtimeMs;
        if (Date.now() - birthtime > ttl) {
            settings.logger.log(`> Cached file expired at ${maybeCachedFileLocation}`);
            settings.logger.log(`> Deleting cache at ${maybeCachedFileLocation}`);
            fs.unlinkSync(maybeCachedFileLocation);
            return;
        }
    }

    settings.logger.log(`> Cached file found at ${maybeCachedFileLocation}`);
    settings.logger.log(`> Old source: ${asset.src}`);
    asset.src = `file://${maybeCachedFileLocation}`;
    settings.logger.log(`> New source: ${asset.src}`);
}

const predownload = async (job, settings, { cacheDirectory, ttl, cacheAssets }) => {
    // Job template
    await findValidateCache(job.template, settings, cacheDirectory, ttl);

    if(cacheAssets){
        // Job assets
        for(const asset of job.assets){
            // Only asset types that can be downloaded files
            if(['image', 'audio', 'video', 'script', 'static'].includes(asset.type)){
                await findValidateCache(asset, settings, cacheDirectory, ttl);
            }
        }
    }
}

async function saveCache(asset, settings, workpath, cacheDirectory){
    if (asset.src.startsWith('file://')) {
        settings.logger.log(`> Skipping cache for ${asset.src}; local file protocol is being used`);
        return;
    }

    if (!fs.existsSync(cacheDirectory)) {
        settings.logger.log(`> Creating cache directory at ${cacheDirectory}`);
        fs.mkdirSync(cacheDirectory);
    }

    const fileName = path.basename(asset.src);
    const from = path.join(workpath, fileName);
    const to = path.join(cacheDirectory, fileName);
    settings.logger.log(`> Copying from ${from} to ${to}`);

    fs.copyFileSync(from, to);
}

const postdownload = async (job, settings, { cacheDirectory, cacheAssets }) => {
    // Job template
    await saveCache(job.template, settings, job.workpath, cacheDirectory);

    if(cacheAssets){
        // Job assets
        for(const asset of job.assets){
            // Only asset types that can be downloaded files
            if(['image', 'audio', 'video', 'script', 'static'].includes(asset.type)){
                await saveCache(asset, settings, job.workpath, cacheDirectory);
            }
        }
    }
}

module.exports = (job, settings, { cacheDirectory, ttl, cacheAssets }, type) => {
    if (!cacheDirectory) {
        throw new Error(`cacheDirectory not provided.`);
    }

    cacheDirectory = cacheDirectory.replace('~', require('os').homedir());
    
    if (fs.existsSync(cacheDirectory) && !fs.lstatSync(cacheDirectory).isDirectory()) {
        throw new Error(`Cache path of ${cacheDirectory} exists but is not a directory, stopping`);
    }

    if (type === 'predownload') {
        return predownload(job, settings, { cacheDirectory, ttl, cacheAssets }, type);
    }

    if (type === 'postdownload') {
        return postdownload(job, settings, { cacheDirectory, cacheAssets }, type);
    }

    return Promise.resolve();
}
