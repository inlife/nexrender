const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')

const patchedDefault = require('../assets/commandLineRenderer-default.jsx')
const patched2022 = require('../assets/commandLineRenderer-2022.jsx')

const writeTo = (data, dst) => fs.writeFileSync(dst, data)
const copyTo = (src, dst) => fs.writeFileSync(dst, fs.readFileSync(src))

const PATCH_STATUS = {
    NOT_PATCHED: 0,
    PATCHED: 1,
    OUTDATED: 2,
}

/**
 * Get the correct patched content for the After Effects command line renderer
 * @param {string} binary
 * @returns {string}
 */
const getContentForPatch = (binary) => {
    const afterEffects = path.dirname(binary)
    const afterEffectsYearMatch = afterEffects.match(/(20[0-9]{2})/);

    if (afterEffectsYearMatch && afterEffectsYearMatch[0] >= "2022") {
        return patched2022;
    }

    return patchedDefault;
}

/**
 * Get the status of the patch for the After Effects command line renderer
 * @param {string} binary
 * @returns {number} PATCH_STATUS
 */
const getPatchStatus = (binary) => {
    const afterEffects = path.dirname(binary)
    const targetScript = 'commandLineRenderer.jsx'
    const originalFile = path.join(afterEffects, 'Scripts', 'Startup', targetScript)
    const data = fs.readFileSync(originalFile, 'utf8')

    if (data.indexOf('nexrender-patch') === -1) {
        return PATCH_STATUS.NOT_PATCHED
    }

    const patchedMatch = data.match(/nexrender-patch-v([0-9.]+)/)
    const existingMatch = getContentForPatch(binary).match(/nexrender-patch-v([0-9.]+)/)

    if (patchedMatch[1] !== existingMatch[1]) {
        return PATCH_STATUS.OUTDATED
    }

    return PATCH_STATUS.PATCHED
}

/**
 * Attempt to patch the After Effect's command line renderer
 * @type {Object}
 */
module.exports = (settings) => {
    const targetScript  = 'commandLineRenderer.jsx';

    const patched      = getContentForPatch(settings.binary)
    const afterEffects = path.dirname(settings.binary)
    const originalFile = path.join(afterEffects, 'Scripts', 'Startup', targetScript)
    const backupFile   = path.join(afterEffects, 'Backup.Scripts', 'Startup', targetScript)

    /* check if file has been patched already */
    /* by looking for 'nexrender' in the text anywhere */
    settings.logger.log('checking After Effects command line renderer patch...')
    const patchStatus = getPatchStatus(settings.binary)

    switch (patchStatus) {
        // if not patched, then we need to patch it
        case PATCH_STATUS.NOT_PATCHED:
            settings.logger.log('backing up original command line script to:')
            settings.logger.log(' - ' + backupFile)

            try {
                mkdirp.sync(path.join(afterEffects, 'Backup.Scripts', 'Startup'))
                copyTo(originalFile, backupFile)

                settings.logger.log('patching the command line script')
                fs.chmodSync(originalFile, '755');
                writeTo(patched, originalFile)

                settings.track('Init Patch Install Succeeded')
            } catch (err) {
                settings.trackSync('Init Patch Install Failed')

                if (err.code == 'EPERM') {
                    settings.logger.log('\n\n              -- E R R O R --\n');
                    settings.logger.log('you need to run application with admin priviledges once');
                    settings.logger.log('to install Adobe After Effects commandLineRenderer.jsx patch\n');

                    if (process.platform == 'win32') {
                        settings.logger.log('reading/writing inside Program Files folder on windows is blocked')
                        settings.logger.log('please run nexrender with Administrator Privilidges only ONE TIME, to install the patch\n\n')
                    } else {
                        settings.logger.log('you might need to try to run nexrender with "sudo" only ONE TIME to install the patch\n\n')
                    }

                    process.exit(2);
                } else {
                    throw err
                }
            }
            break;

        // if patched, then we need to check if it's outdated
        case PATCH_STATUS.OUTDATED:
            settings.logger.log('out-of-date version of the commandLineRenderer.jsx patch is detected, attepmting to update')
            try {
                settings.track('Init Patch Update Succeeded')
                writeTo(patched, originalFile)
            } catch (err) {
                settings.trackSync('Init Patch Update Failed')

                if (err.code == 'EPERM') {
                    settings.logger.log('\n\n              -- E R R O R --\n');
                    settings.logger.log('you need to run application with admin priviledges once');
                    settings.logger.log('to install Adobe After Effects commandLineRenderer.jsx patch\n');

                    if (process.platform == 'win32') {
                        settings.logger.log('reading/writing inside Program Files folder on windows is blocked')
                        settings.logger.log('please run nexrender with Administrator Privilidges only ONE TIME, to update the patch\n\n')
                    } else {
                        settings.logger.log('you might need to try to run nexrender with "sudo" only ONE TIME to update the patch\n\n')
                    }

                    process.exit(2);
                } else {
                    throw err
                }
            }
            break;

        // if patched and up-to-date, then we're good, unless forced
        case PATCH_STATUS.PATCHED:
            settings.logger.log('command line patch already is in place')

            if (settings.forceCommandLinePatch) {
                settings.logger.log('forced rewrite of command line patch')
                settings.track('Init Patch Forced')
                writeTo(patched, originalFile)
            }

            break;
    }
}

module.exports.PATCH_STATUS = PATCH_STATUS
module.exports.getPatchStatus = getPatchStatus
module.exports.getContentForPatch = getContentForPatch
