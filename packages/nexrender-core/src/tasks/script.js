const fs     = require('fs')
const path   = require('path')
const script = require('../assets/nexrender.jsx')

/* helpers */
const escape = string => `'${string.replace(/\'/g, '\\\'')}'`

const selectLayers = ({ composition, layerName, layerIndex }, callbackString) => {
    const method = layerName ? 'selectLayersByName' : 'selectLayersByIndex';
    const compo  = composition === undefined ? 'null' : escape(composition);
    const value  = layerName ? escape(layerName) : layerIndex;

    return (`nexrender.${method}(${compo}, ${value}, ${callbackString});`);
}

const renderIf = (value, string) => {
    const encoded = typeof value == 'string' ? escape(value) : JSON.stringify(value);
    return value === undefined ? '' : string.replace('$value', encoded);
}

const partsOfKeypath = (keypath) => {
    var parts = keypath.split('->');
    return (parts.length === 1) ? keypath.split('.') : parts
}

/* scripting wrappers */
const wrapFootage = ({ dest, ...asset }) => (`(function() {
    ${selectLayers(asset, `function(layer) {
        nexrender.replaceFootage(layer, '${dest.replace(/\\/g, "\\\\")}')
    }`)}
})();\n`)

const wrapData = ({ property, value, expression, ...asset }) => (`(function() {
    ${selectLayers(asset, /* syntax:js */`function(layer) {
        var parts = ${partsOfKeypath(property)};

        var processAttribute = false;
        var iterator = layer;
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (iterator.property(part)) {
                iterator = iterator.property(part);     
            } else if (part in iterator) {
                if (i + 1 < parts.length) {
                    iterator = iterator[part]
                } else {
                    processAttribute = true;
                }
            } else {
                throw new Error("nexrender: Can't find a property sequence (${property}) at part: " + part);                
            }
        }

        if (processAttribute) {
            ${renderIf(value, `iterator[parts[parts.length - 1]] = $value;`)}

            /* note that for attributes an expression must be an evaluable js block like "function(){ return 6 * 7 }()" */
            ${renderIf(expression, `iterator[parts[parts.length - 1]] = $value;`)}
        } else {
            ${renderIf(value, `iterator.setValue($value);`)}
            ${renderIf(expression, `iterator.expression = $value;`)}
        }

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
