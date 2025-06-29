/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_nullLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;

    function NullLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(NullLayer, MessageClass);

    NullLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    NullLayer.prototype.process = function() {
        try {
            this.processLayer();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    NullLayer.prototype.serialize = function() {
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
        return new NullLayer(layer, onComplete, onFail);
    }
    
}());