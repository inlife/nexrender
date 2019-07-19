const fs    = require('fs')
const os    = require('os')
const path  = require('path')

module.exports = (settings) => {
    const filename  = 'ae_render_only_node.txt'
    const documents = path.join(os.homedir(), 'Documents')
    const adobe     = path.join(documents, 'Adobe')
    const nodefile1 = path.join(documents, filename)
    const nodefile2 = path.join(adobe, filename)

    settings.logger.log('adding default render-only-node licenses for After Effects at:')
    settings.logger.log(' - ' + nodefile1)
    settings.logger.log(' - ' + nodefile2)

    if (!fs.existsSync(adobe)) {
        fs.mkdirSync(adobe)
    }

    if (!fs.existsSync(nodefile1)) {
        fs.writeFileSync(nodefile1, '')
    }

    if (!fs.existsSync(nodefile2)) {
        fs.writeFileSync(nodefile2, '')
    }
}
