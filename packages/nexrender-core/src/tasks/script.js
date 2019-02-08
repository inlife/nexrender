const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')

const wrapLayer = (layerName, layerIndex, composition) => (layerName
    ? `nexrender.layerName('${layerName}', ${composition !== undefined ? `'${composition}'` : `null`})`
    : `nexrender.layerIndex('${layerIndex}', ${composition !== undefined ? `'${composition}'` : `null`})`
)

const wrapFootage = ({ layerName, layerIndex, dest, composition }) => (`(function() {
    nexrender.replaceFootage(
        ${wrapLayer(layerName, layerIndex, composition)},
        '${dest.replace(/\\/g, "\\\\")}'
    );
})();\n`)

const wrapData = ({ layerName, layerIndex, property, value, expression, composition }) => (`(function() {
    var layer = ${wrapLayer(layerName, layerIndex, composition)}; if (!layer) return false;
    var property = layer.property('${property}'); if (!property) return false;

    ${value !== undefined ? `property.setValue(${typeof value == 'string' ? `'${value}'` : JSON.stringify(value)});` : ''}
    ${expression !== undefined ? `property.expression = '${expression}';` : ''}

    return true;
})();\n`)

const wrapScript = ({ dest }) => (`(function() {
    ${fs.readFileSync(dest, 'utf8')}
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
                data.push(wrapFootage(asset));
                break;

            case 'data':
                data.push(wrapData(asset));
                break;

            case 'script':
                data.push(wrapScript(asset));
                break;
        }
    });

    /* write out assembled custom script file in the workpath */
    job.scriptfile = path.join(base, `nexrender-${job.uid}-script.jsx`);
    fs.writeFileSync(job.scriptfile, script
        .replace('/*COMPOSITION*/', job.template.composition)
        .replace('/*USERSCRIPT*/', data.join('\n'))
    );

    return Promise.resolve(job)
}
