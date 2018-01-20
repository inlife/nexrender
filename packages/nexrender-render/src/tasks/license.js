const fs    = require('fs')
const os    = require('os')
const path  = require('path')

module.exports = (settings) => {
    const documents = path.join(os.homedir(), 'Documents')
    const adobe     = path.join(documents, 'Adobe')
    const nodefile  = path.join(adobe, 'ae_render_only_node.txt')

    if (!fs.existsSync(adobe)) {
        fs.mkdirSync(adobe)
    }

    fs.writeFileSync(nodefile, '')
}
