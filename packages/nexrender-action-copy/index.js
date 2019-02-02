const fs = require('fs')
const {name} = require('./package.json')

module.exports = (job, settings, { output }, type) => {
    if (type != 'postrender') {
        throw new Error(`Action ${name} can be only run in postrender mode, you provided: ${type}.`)
    }

    /* plain asset stream copy */
    const rd = fs.createReadStream(job.output)
    const wr = fs.createWriteStream(output)

    return new Promise(function(resolve, reject) {
        rd.on('error', reject)
        wr.on('error', reject)
        wr.on('finish', resolve)
        rd.pipe(wr);
    }).catch((error) => {
        rd.destroy()
        wr.end()
        throw error
    })
}
