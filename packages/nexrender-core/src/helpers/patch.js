const fs      = require('fs')
const path    = require('path')
const mkdirp  = require('mkdirp')
const patched = require('../assets/commandLineRenderer.jsx')

const writeTo = (data, dst) => fs.writeFileSync(dst, data)
const copyTo = (src, dst) => fs.writeFileSync(dst, fs.readFileSync(src))

/**
 * Attempt to patch the After Effect's command line renderer
 * @type {Object}
 */
module.exports = (settings) => {
    const targetScript  = 'commandLineRenderer.jsx';

    const afterEffects = path.dirname(settings.binary)
    const originalFile = path.join(afterEffects, 'Scripts', 'Startup', targetScript)
    const backupFile   = path.join(afterEffects, 'Backup.Scripts', 'Startup', targetScript)

    const data = fs.readFileSync(originalFile, 'utf8')
    settings.logger.log('checking After Effects command line renderer patch...')

    /* check if file has been patched already */
    /* by looking for 'nexrender' in the text anywhere */
    if (data.indexOf('nexrender') !== -1) {
        settings.logger.log('command line patch already is in place')

        if (settings.forceCommandLinePatch) {
            settings.logger.log('forced rewrite of command line patch')
            writeTo(patched, originalFile)
        }
    } else {
        settings.logger.log('backing up original command line script to:')
        settings.logger.log(' - ' + backupFile)

        mkdirp.sync(path.join(afterEffects, 'Backup.Scripts', 'Startup'))
        copyTo(originalFile, backupFile)

        settings.logger.log('patching the command line script')
        writeTo(patched, originalFile)
    }
}
