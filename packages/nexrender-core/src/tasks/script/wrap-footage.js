const { selectLayers } = require('./helpers')
const { checkForWSL } = require('../../helpers/path')

const wrapFootage = (job, settings, { dest, ...asset }) => (`(function() {
    ${selectLayers(job, asset, `function(layer) {
        nexrender.replaceFootage(layer, '${checkForWSL(dest.replace(/\\/g, "\\\\"), settings)}', ${asset.sequence ? 'true' : 'false'})
    }`)}
})();\n`)

module.exports = wrapFootage
