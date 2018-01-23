'use strict'

const fs    = require('fs')
const os    = require('os')
const path  = require('path')

const defaultPaths = {
    darwin: [
        '/Applications/Adobe After Effects CC',
        '/Applications/Adobe After Effects CC 2018',
    ],
    win32: [
        'C:\\Program Files\\Adobe\\After Effects CC',
        'C:\\Program Files\\Adobe\\After Effects CC\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2018\\Support Files',
    ],
}

/**
 * Attemnt to find a aebinary path automatically
 * (using a table of predefined paths)
 * @param  {Object} settings
 * @return {String|null}
 */
module.exports = settings => {
    const platform = os.platform();

    if (!defaultPaths.hasOwnProperty(platform)) {
        return null;
    }

    const binary  = 'aerender' + (platform === 'win32' ? '.exe' : '' );
    const results = defaultPaths[platform]
        .map(folderPath => path.join(folderPath, binary))
        .filter(binaryPath => fs.existsSync(binaryPath))

    // return first matched result
    return results.length ? results[0] : null;
}
