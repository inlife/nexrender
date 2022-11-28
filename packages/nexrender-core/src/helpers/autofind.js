const fs    = require('fs')
const os    = require('os')
const path  = require('path')

const defaultPaths = {
    darwin: [
        '/Applications/Adobe After Effects CC',
        '/Applications/Adobe After Effects CC 2015',
        '/Applications/Adobe After Effects CC 2016',
        '/Applications/Adobe After Effects CC 2017',
        '/Applications/Adobe After Effects CC 2018',
        '/Applications/Adobe After Effects CC 2019',
        '/Applications/Adobe After Effects 2020',
        '/Applications/Adobe After Effects 2021',
        '/Applications/Adobe After Effects 2022',
        '/Applications/Adobe After Effects 2023',
        '/Applications/Adobe After Effects CC 2021',
        '/Applications/Adobe After Effects CC 2022',
        '/Applications/Adobe After Effects CC 2023',
    ],
    win32: [
        'C:\\Program Files\\Adobe\\After Effects CC',
        'C:\\Program Files\\Adobe\\After Effects CC\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2015\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2016\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2017\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2018\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2019\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects CC 2020\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects 2020\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects 2021\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects 2022\\Support Files',
        'C:\\Program Files\\Adobe\\After Effects 2023\\Support Files',

        'C:\\Program Files\\Adobe\\Adobe After Effects CC',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2015\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2016\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2017\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2018\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2019\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects CC 2020\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects 2020\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects 2021\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files',
        'C:\\Program Files\\Adobe\\Adobe After Effects 2023\\Support Files',
    ],
    wsl: [
        '/mnt/c/Program Files/Adobe/After Effects CC',
        '/mnt/c/Program Files/Adobe/After Effects CC/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2015/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2016/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2017/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2018/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2019/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects CC 2020/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects 2020/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects 2021/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects 2022/Support Files',
        '/mnt/c/Program Files/Adobe/After Effects 2023/Support Files',

        '/mnt/c/Program Files/Adobe/Adobe After Effects CC',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2015/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2016/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2017/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2018/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2019/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects CC 2020/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects 2020/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects 2021/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects 2022/Support Files',
        '/mnt/c/Program Files/Adobe/Adobe After Effects 2023/Support Files',
    ],
}

/**
 * Attemnt to find a aebinary path automatically
 * (using a table of predefined paths)
 * @param  {Object} settings
 * @return {String|null}
 */
module.exports = settings => {
    let platform = os.platform()

    if (settings.wsl) platform = 'wsl'

    if (!defaultPaths.hasOwnProperty(platform)) {
        return null;
    }

    const binary  = 'aerender' + (platform === 'win32' || platform === 'wsl' ? '.exe' : '' )
    const results = defaultPaths[platform]
        .map(folderPath => path.join(folderPath, binary))
        .filter(binaryPath => fs.existsSync(binaryPath))

    // return first matched result
    return results.length ? results[0] : null;
}
