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

const wrapDataProperty = ({ property, value, expression, ...asset }) => (`(function() {
    ${selectLayers(asset, /* syntax:js */`function(layer) {
        var parts = ${partsOfKeypath(property)};

        var iterator = layer;
        for (var i = 0; i < parts.length; i++) {
            iterator = iterator.property(parts[i]);

            if (!iterator) {
                throw new Error("nexrender: Can't find a property sequence (${property}) at part: " + parts[i]);
            }
        }

        ${renderIf(value, `iterator.setValue($value);`)}
        ${renderIf(expression, `iterator.expression = $value;`)}

        return true;
    }`)}
})();\n`)

const wrapDataAttribute = (attribute, { value, expression, ...asset }) => (`(function() {
    ${selectLayers(asset, /* syntax:js */`function(layer) {
        var parts = ${partsOfKeypath(attribute)};

        var obj = layer;
        var part = "${attribute}";

        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            if (i + 1 < parts.length) {
              obj = obj[part];
            }
            if (!obj) {
                throw new Error("nexrender: Can't find an attribute sequence (${attribue}) at part: " + part);
            }
        }

        ${renderIf(value, `obj.[part] = $value;`)}

        /* note that an expression must be an evaluable js block like "function(){ return 3+4 }();" */
        ${renderIf(expression, `obj.[part] = $value;`)}

        return true;
    }`)}
})();\n`)

const wrapData = ({ attribute, ...asset }) => (
    (attribute === undefined) ? wrapDataProperty(asset) : wrapDataAttribute(attribute, asset)
)

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
