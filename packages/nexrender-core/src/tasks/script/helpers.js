const escape = str => {
    str = JSON.stringify(str)
    str = str.substring(1, str.length-1)
    str = `'${str.replace(/'/g, '\\\'')}'`
    return str
}

const selectLayers = (job, { composition, layerName, layerIndex }, callbackString) => {
    const method = layerName ? 'selectLayersByName' : 'selectLayersByIndex';
    const compo  = composition === undefined ? 'null' : escape(composition);
    const value  = layerName ? escape(layerName) : layerIndex;
    return (`nexrender.${method}(${compo}, ${value}, ${callbackString}, null, ${job.template.continueOnMissing});`);
}

module.exports = {
    escape,
    selectLayers,
}