/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_audioLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function AudioLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(AudioLayer, MessageClass);

    AudioLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    AudioLayer.prototype.processType = function() {
        this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
                rendererTypes.SKOTTIE,
            ],
            builderTypes.AUDIO_LAYER);
    }

    AudioLayer.prototype.process = function() {
        try {
            this.processLayer();
            this.processType();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    AudioLayer.prototype.serialize = function() {
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
        return new AudioLayer(layer, onComplete, onFail);
    }
    
}());