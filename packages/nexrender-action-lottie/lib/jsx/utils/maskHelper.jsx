/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, MaskMode*/
$.__bodymovin.bm_maskHelper = (function () {
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var getMaskMode = $.__bodymovin.getMaskType;
    var ob = {};

    function exportMasks(layerInfo, layerData, frameRate) {
        if (!(layerInfo.mask && layerInfo.mask.numProperties > 0)) {
            return;
        }
        var stretch = layerData.sr;
        layerData.hasMask = true;
        layerData.masksProperties = [];
        var masks = layerInfo.mask;
        var i, len = masks.numProperties, maskElement;
        for (i = 0; i < len; i += 1) {
            maskElement = masks(i + 1);
            var shapeData = {
                inv: maskElement.inverted,
                mode: getMaskMode(maskElement.maskMode)
            };
            shapeData.pt = bm_keyframeHelper.exportKeyframes(maskElement.property('maskShape'), frameRate, stretch);
            $.__bodymovin.bm_shapeHelper.checkVertexCount(shapeData.pt.k);
            shapeData.o = bm_keyframeHelper.exportKeyframes(maskElement.property('Mask Opacity'), frameRate, stretch);
            shapeData.x = bm_keyframeHelper.exportKeyframes(maskElement.property('Mask Expansion'), frameRate, stretch);
            if (settingsHelper.shouldIncludeNotSupportedProperties()) {
                shapeData.f = bm_keyframeHelper.exportKeyframes(maskElement.property('Mask Feather'), frameRate, stretch);
            }
            shapeData.nm = maskElement.name;
            layerData.masksProperties.push(shapeData);
        }
    }
    
    ob.exportMasks = exportMasks;
    
    return ob;
}());