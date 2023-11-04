const nexEscape = str => {
    str = JSON.stringify(str)
    str = str.substring(1, str.length-1)
    str = `'${str.replace(/'/g, '\\\'')}'`
    return str
}

const selectLayers = (job, { composition, layerName, layerIndex }, callbackString) => {
    const method = layerName ? 'selectLayersByName' : 'selectLayersByIndex';
    const compo  = composition === undefined ? 'null' : nexEscape(composition);
    const value  = layerName ? nexEscape(layerName) : layerIndex;
    return (`nexrender.${method}(${compo}, ${value}, ${callbackString}, null, ${job.template.continueOnMissing});`);
}

module.exports = {
    nexEscape,
    selectLayers,
}
