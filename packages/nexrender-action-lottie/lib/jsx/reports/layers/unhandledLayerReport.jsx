/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_unhandledLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function UnhandledLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }

    generalUtils.extendPrototype(UnhandledLayer, MessageClass);

    UnhandledLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    UnhandledLayer.prototype.processData = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.SKOTTIE,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNHANDLED_LAYER);
    }

    UnhandledLayer.prototype.process = function() {
        try {
            this.processData();
            this.processLayer();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    UnhandledLayer.prototype.serialize = function() {
        var layerReportData = this.layerReport.serialize();
        var localMessages = this.serializeMessages();
        var serializedData = {}
        for (var s in layerReportData) {
            if (layerReportData.hasOwnProperty(s)) {
                if (s === 'messages') {
                    serializedData[s] = localMessages.concat(layerReportData[s]);
                } else {
                    serializedData[s] = layerReportData[s];
                }
            }
        }
        return serializedData;
    }



    return function(layer, onComplete, onFail) {
        return new UnhandledLayer(layer, onComplete, onFail);
    }
    
}());