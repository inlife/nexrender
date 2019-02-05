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

        try {
            mkdirp.sync(path.join(afterEffects, 'Backup.Scripts', 'Startup'))
            copyTo(originalFile, backupFile)

            settings.logger.log('patching the command line script')
            fs.chmodSync(originalFile, '755');
            writeTo(patched, originalFile)
        } catch (err) {
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
    }
}
