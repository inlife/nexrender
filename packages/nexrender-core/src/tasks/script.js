const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')

/* helpers */

const selectLayers = ({ composition, layerName, layerIndex }, callbackString) => {
    const method = layerName ? 'selectLayersByName' : 'selectLayersByIndex';
    const compo  = composition === undefined ? 'null' : `'${composition}'`;
    const value  = layerName ? `'${layerName}'` : layerIndex;

    return (`nexrender.${method}(${compo}, ${value}, ${callbackString});`);
}

const renderIf = (value, string, encode) => {
    const encoded = !encode ? value : typeof value == 'string' ? `'${value}'` : JSON.stringify(value);
    return value === undefined ? '' : string.replace('$value', encoded);
}

/* scripting wrappers */

const wrapFootage = ({ dest, ...asset }) => (`(function() {
    ${selectLayers(asset, `function(layer) {
        nexrender.replaceFootage(layer, '${dest.replace(/\\/g, "\\\\")}')
    }`)}
})();\n`)

const wrapData = ({ property, value, expression, ...asset }) => (`(function() {
    ${selectLayers(asset, `function(layer) {
        var property = layer.property('${property}');
        if (!property) { return false; }

        ${renderIf(value, `property.setValue($value);`, 1)}
        ${renderIf(expression, `property.expression = '$value;'`, 0)}

        return true;
    }`)}
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
