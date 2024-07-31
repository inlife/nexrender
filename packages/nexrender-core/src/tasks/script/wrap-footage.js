const { selectLayers } = require('./helpers')
const { checkForWSL } = require('../../helpers/path')

// wrapBoolean
const wb = (value) => (value ? 'true' : 'false')

const wrapFootage = (job, settings, { dest, ...asset }) => (`(function() {
    ${selectLayers(job, asset, `function(layer) {
        nexrender.replaceFootage(layer, '${checkForWSL(dest.replace(/\\/g, "\\\\").replace(/'/,"\\'"), settings)}', ${wb(asset.sequence)}, ${wb(asset.removeOld)})
    }`)}
})();\n`)

module.exports = wrapFootage
