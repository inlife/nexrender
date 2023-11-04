const { selectLayers, nexEscape } = require('./helpers')

const renderIf = (value, string) => {
    const encoded = typeof value == 'string' ? nexEscape(value) : JSON.stringify(value);
    return value === undefined ? '' : string.replace('$value', () => encoded);
}

const partsOfKeypath = (keypath) => {
    var parts = keypath.split('->');
    return (parts.length === 1) ? keypath.split('.') : parts
}

const wrapData = (job, settings, { property, value, expression, ...asset }) => (`(function() {
    ${selectLayers(job, asset, `function(layer) {
        var parts = ${JSON.stringify(partsOfKeypath(property))};
        ${renderIf(value, `var value = { "value": $value }`)}
        ${renderIf(expression, `var value = { "expression": $value }`)}
        nexrender.changeValueForKeypath(layer, parts, value);
    }`)}
})();\n`)

module.exports = wrapData
