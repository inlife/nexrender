const fs    = require('fs')
const os    = require('os')
const path  = require('path')

const filename  = 'ae_render_only_node.txt'
const documents = path.join(os.homedir(), 'Documents')
const adobe     = path.join(documents, 'Adobe')
const nodefile1 = path.join(documents, filename)
const nodefile2 = path.join(adobe, filename)

const add = (settings) => {
    if (!settings.addLicense) {
        return false
    }

    settings.logger.log('adding default render-only-node licenses for After Effects at:')
    settings.logger.log(' - ' + nodefile1)
    settings.logger.log(' - ' + nodefile2)

    let applied = false

    if (!fs.existsSync(adobe)) {
        fs.mkdirSync(adobe)
    }

    if (!fs.existsSync(nodefile1)) {
        fs.writeFileSync(nodefile1, '')
        applied = true
    }

    if (!fs.existsSync(nodefile2)) {
        fs.writeFileSync(nodefile2, '')
        applied = true
    }

    if (applied) {
        settings.track('Init Render License Added')
        settings.logger.log('added render-only-node licenses for After Effects')
    }

    return applied
}

const remove = (settings) => {
    let removed = false

    if (fs.existsSync(nodefile1)) {
        fs.unlinkSync(nodefile1)
        removed = true
    }

    if (fs.existsSync(nodefile2)) {
        fs.unlinkSync(nodefile2)
        removed = true
    }

    if (removed) {
        settings.logger.log('removed render-only-node licenses for After Effects')
    }

    return removed
}

module.exports = { add, remove }
