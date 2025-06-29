/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_solidLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;

    function SolidLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(SolidLayer, MessageClass);

    SolidLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    SolidLayer.prototype.process = function() {
        try {
            this.processLayer();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    SolidLayer.prototype.serialize = function() {
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
        return new SolidLayer(layer, onComplete, onFail);
    }
    
}());