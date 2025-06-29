/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_lightLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function LightLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(LightLayer, MessageClass);

    LightLayer.prototype.processType = function() {
        this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
                rendererTypes.SKOTTIE,
            ],
            builderTypes.LIGHT_LAYER);
    }

    LightLayer.prototype.process = function() {
        try {
            this.processType();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    LightLayer.prototype.serialize = function() {
        var localMessages = this.serializeMessages();
        var serializedData = {
            messages: localMessages,
            name: this.layer.name,
        }
        return serializedData;
    }



    return function(layer, onComplete, onFail) {
        return new LightLayer(layer, onComplete, onFail);
    }
    
}());