const fs        = require('fs')
const path      = require('path')
const mkdirp    = require('mkdirp')

const copyTo = (source, dest) => fs.writeFileSync(dest, fs.readFileSync(source))

/**
 * Attempt to patch the After Effect's command line renderer
 * @type {Object}
 */
module.exports = (settings) => {
    const patchFilePath =
        process.env.NXRND_CUSTOM_PATCH_FILE ||
        path.resolve(path.join(__dirname, '..', 'assets', 'commandLineRenderer.jsx'));

    const afterEffects = path.dirname(settings.binary)
    const originalFile = path.join(afterEffects, 'Scripts', 'Startup', 'commandLineRenderer.jsx')
    const backupFile   = path.join(afterEffects, 'Backup.Scripts', 'Startup', 'commandLineRenderer.jsx')

    const data = fs.readFileSync(originalFile, 'utf8')
    settings.logger.log('checking After Effects command line renderer patch...')

    /* check if file has been patched already */
    /* by looking for 'nexrender' in the text anywhere */
    if (data.indexOf('nexrender') !== -1) {
        settings.logger.log('command line patch already is in place')

        if (settings.forceCommandLinePatch) {
            settings.logger.log('forced rewrite of command line patch')
            copyTo(patchFilePath, originalFile)
        }
    } else {
        settings.logger.log('backing up original command line script to:')
        settings.logger.log(' -', backupFile)

        mkdirp.sync(path.join(afterEffects, 'Backup.Scripts', 'Startup'))
        copyTo(originalFile, backupFile)

        settings.logger.log('patching the command line script')
        copyTo(patchFilePath, originalFile)
    }
}
