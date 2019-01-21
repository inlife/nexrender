const fs    = require('fs')
const os    = require('os')
const path  = require('path')

module.exports = (settings) => {
    const documents = path.join(os.homedir(), 'Documents')
    const adobe     = path.join(documents, 'Adobe')
    const nodefile  = path.join(adobe, 'ae_render_only_node.txt')

    settings.logger.log('adding default render-only-node license for After Effects at:')
    settings.logger.log(' -', nodefile)

    if (!fs.existsSync(adobe)) {
        fs.mkdirSync(adobe)
    }

    if (!fs.existsSync(nodefile)) {
        fs.writeFileSync(nodefile, '')
    }
}
