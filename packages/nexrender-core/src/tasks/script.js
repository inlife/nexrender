const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')

const wrapFootage = (layername, filepath) => (`(function() {
    nexrender.replaceFootage('${layername}', '${filepath.replace(/\\/g, "\\\\")}');
})();\n`)

const wrapScript = (filepath) => (`(function() {
    ${fs.readFileSync(filepath, 'utf8')}
})();\n`)

module.exports = (job, settings) => {
    settings.logger.log(`[${job.uid}] running script assemble...`);

    const data = [];
    const base = job.workpath;

    job.assets.map(asset => {
        switch (asset.type) {
            case 'video':
            case 'audio':
            case 'image':
                data.push(wrapFootage(asset.layer, path.join(base, asset.layer)));
                break;

            case 'script':
                data.push(wrapScript(path.join(base, path.basename(asset.src))));
                break;
        }
    });

    /* write out assembled custom script file in the workdir */
    job.scriptfile = path.join(base, `nexrender-${job.uid}-script.jsx`);
    fs.writeFileSync(job.scriptfile, script.replace('/*USERSCRIPT*/', data.join('\n')));

    return Promise.resolve(job)
}
