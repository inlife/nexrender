/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_failedLayerReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function FailedLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }

    generalUtils.extendPrototype(FailedLayer, MessageClass);

    FailedLayer.prototype.processData = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.SKOTTIE,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.FAILED_LAYER);
    }

    FailedLayer.prototype.process = function() {
        try {
            this.processData();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    FailedLayer.prototype.serialize = function() {
        var serializedData = {
            messages: this.serializeMessages(),
            name: this.layer.name,
        }
        return serializedData;
    }



    return function(layer, onComplete, onFail) {
        return new FailedLayer(layer, onComplete, onFail);
    }
    
}());