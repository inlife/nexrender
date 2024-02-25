const fs = require('fs')
const {name} = require('./package.json')
const path = require('path')

module.exports = (job, settings, { input, output, useJobId }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    /* check if input has been provided */
    input = input || job.output;

    /* fill absolute/relative paths */
    if (!path.isAbsolute(input)) input = path.join(job.workpath, input);
    if (!path.isAbsolute(output)) output = path.join(job.workpath, output);

    /* create folders along the path if needed */
    fs.mkdirSync(path.dirname(output), { recursive: true });

    /* output is a directory, save to input filename */
    if (fs.existsSync(output) && fs.lstatSync(output).isDirectory()) {
        output = path.join(output, useJobId
            ? job.uid + path.extname(input)
            : path.basename(input)
        );
    }

    /* plain asset stream copy */
    const rd = fs.createReadStream(input)
    const wr = fs.createWriteStream(output)

    return new Promise(function(resolve, reject) {
        rd.on('error', reject)
        wr.on('error', reject)
        wr.on('finish', () => resolve(job))
        rd.pipe(wr);
    }).catch((error) => {
        rd.destroy()
        wr.end()
        throw error
    })
}
