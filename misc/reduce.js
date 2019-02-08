const fs    = require('fs')
const path  = require('path')

/**
 * Remove directory recursively
 */
const rm = (target) => {
    if (!fs.existsSync(target)) return;

    fs.readdirSync(target).map(entry => {
        const entryPath = path.join(target, entry);
        const result = fs.lstatSync(entryPath).isDirectory()
            ? rm(entryPath)
            : fs.unlinkSync(entryPath)
    })

    fs.rmdirSync(target)
}


const bin = path.join(__dirname, '..', 'packages', 'nexrender-action-encode', 'node_modules', 'ffmpeg-static', 'bin')

rm(path.join(bin, 'linux'))
rm(path.join(bin, 'win32', 'ia32'))
