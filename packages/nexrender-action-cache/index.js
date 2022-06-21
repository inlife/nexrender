const fs = require('fs');
const path = require('path');

const predownload = (job, settings, { cacheDirectory, ttl }) => {
    if (job.template.src.startsWith('file://')) {
        settings.logger.log(`> Skipping template cache; local file protocol is being used`)
        return Promise.resolve();
    }
    
    const fileName = path.basename(job.template.src);
    const maybeCachedFileLocation = path.join(cacheDirectory, fileName);

    
    if (!fs.existsSync(maybeCachedFileLocation)) {
        settings.logger.log(`> Template cache not found at ${maybeCachedFileLocation}`);
        return Promise.resolve();
    }

    if (ttl) {
        const birthtime = fs.statSync(maybeCachedFileLocation).birthtimeMs;
        if (Date.now() - birthtime > ttl) {
            settings.logger.log(`> Template cache expired at ${maybeCachedFileLocation}`);
            settings.logger.log(`> Deleting cache at ${maybeCachedFileLocation}`);
            fs.unlinkSync(maybeCachedFileLocation);
            return Promise.resolve();
        }
    }

    settings.logger.log(`> Template cache found at ${maybeCachedFileLocation}`);
    settings.logger.log(`> Old template source: ${job.template.src}`);
    job.template.src = `file://${maybeCachedFileLocation}`;
    settings.logger.log(`> New template source: ${job.template.src}`);
    
    return Promise.resolve();
}

const postdownload = (job, settings, { cacheDirectory }) => {
    if (job.template.src.startsWith('file://')) {
        settings.logger.log(`> Skipping template cache; local file protocol is being used`);
        return Promise.resolve();
    }

    if (!fs.existsSync(cacheDirectory)) {
        settings.logger.log(`> Creating cache directory at ${cacheDirectory}`);
        fs.mkdirSync(cacheDirectory);
    }
    
    const fileName = path.basename(job.template.src);
    settings.logger.log(`> Copying from ${path.join(job.workpath, fileName)} to ${path.join(cacheDirectory, fileName)}`);
    const readStream = fs.createReadStream(path.join(job.workpath, fileName));
    const writeStream = fs.createWriteStream(path.join(cacheDirectory, fileName));

    return new Promise(function(resolve, reject) {
        readStream.on('error', reject);
        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve(job));
        readStream.pipe(writeStream);
    }).catch((error) => {
        readStream.destroy();
        writeStream.end();
        console.log(error)
        throw error;
    });
}

module.exports = (job, settings, { cacheDirectory, ttl }, type) => {
    if (!cacheDirectory) {
        throw new Error(`cacheDirectory not provided.`);
    }

    cacheDirectory = cacheDirectory.replace('~', require('os').homedir());
    
    if (fs.existsSync(cacheDirectory) && !fs.lstatSync(cacheDirectory).isDirectory()) {
        throw new Error(`Cache path of ${cacheDirectory} exists but is not a directory, stopping`);
    }

    if (type === 'predownload') {
        return predownload(job, settings, { cacheDirectory, ttl }, type);
    }

    if (type === 'postdownload') {
        return postdownload(job, settings, { cacheDirectory }, type);
    }

    return Promise.resolve();
}
