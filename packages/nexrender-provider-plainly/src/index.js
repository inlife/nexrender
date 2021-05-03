const fs  = require('fs');
const os = require('os');
const path = require('path');
const gsProvider = require('@nexrender/provider-gs');

const {getRemoteHashesJson, makeDiff, sync} = require('./sync');


const PLAINLY_PROTOCOL = 'plainly:';
const PLAINLY_CACHE_DIR_ENV = 'PLAINLY_CACHE_DIR';
const PLAINLY_CACHE_DIR_DEFAULT = path.join(os.homedir(), '.plainly');


const fromLogger = (log) => (msg) => log(`plainly-provider: ${msg}`);


const getCacheDir = async () => {
    const cacheDir = process.env[PLAINLY_CACHE_DIR_ENV] || PLAINLY_CACHE_DIR_DEFAULT;
    await fs.promises.mkdir(cacheDir, {recursive: true});

    return cacheDir;
}


const getTemplateDir = async (templateBucket) => {
    const cacheDir = await getCacheDir();
    const projectPathAbs = path.join(cacheDir, templateBucket);
    await fs.promises.mkdir(projectPathAbs, {recursive: true});

    return projectPathAbs;
}


const download = async (job, settings, src, dest, params, type) => {
    const log = fromLogger(settings.logger.log);

    try {
      const download = (s, d) => gsProvider.download(job, settings, s, d, params, type);

      src = src.replace(`${PLAINLY_PROTOCOL}//`, '');
      const templateRootDir = path.dirname(src);
      const localTemplateDir = await getTemplateDir(templateRootDir);

      log(`Template directory is ${localTemplateDir}`);

      const templateBucket = `gs://${templateRootDir}`;

      const remoteHashesJsonPath = await getRemoteHashesJson(templateBucket, localTemplateDir, job.uid, download);
      const localHashesJsonPath = path.join(localTemplateDir, 'hashes.json');

      const diff = await makeDiff(localHashesJsonPath, remoteHashesJsonPath);

      await sync(diff, localTemplateDir, templateBucket, download, log);

      // Copy aep file to destination
      const localAepFilePath = path.join(localTemplateDir, path.basename(src));
      await fs.promises.copyFile(localAepFilePath, dest);
      // Create footage shortcut (instead of fixing project paths...)
      const localFootagePath = path.join(localTemplateDir, '(Footage)');
      const destFootagePath = path.join(path.dirname(dest), '(Footage)');
      await fs.promises.symlink(localFootagePath, destFootagePath, 'junction');
      // Replace job template src
      job.template.src = localAepFilePath;
    } catch (e) {
      log(e.message);
    }
}


const upload = (job, settings, src, params) => {
    return Promise.reject(new Error('Plainly provider does not have an upload action...'))
}


module.exports = {
    download,
    upload,
}
