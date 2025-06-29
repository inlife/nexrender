/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_compositionLayerReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var layerReport = $.__bodymovin.bm_layerReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var layerCollectionFactory;

    function CompositionLayer(composition, onComplete, onFail) {
        this.composition = composition;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(CompositionLayer, MessageClass);

    CompositionLayer.prototype.createLayers = function() {
        // Circular dependency since compositions contain collection of layers and are at the same time layers of a collection
        if (!layerCollectionFactory) {
            layerCollectionFactory = $.__bodymovin.bm_layerCollectionReport;
        }
        this.layerCollection = layerCollectionFactory(this.composition.source.layers, this._onComplete, this._onFail);
    }

    CompositionLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.composition);
    }

    CompositionLayer.prototype.process = function() {
        try {
            this.createLayers();
            this.processLayer();
            this.layerCollection.process();
        } catch(error) {
            this._onFail(error);
        }
    }

    CompositionLayer.prototype.serialize = function() {
        var layerReportData = this.layerReport.serialize();
        var localMessages = this.serializeMessages();
        var layerCollectionData = this.layerCollection.serialize();
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
        serializedData.layers = layerCollectionData.layers;
        serializedData.id = this.composition.source.id;
        return serializedData;
    }

    return function(composition, onComplete, onFail) {
        return new CompositionLayer(composition, onComplete, onFail);
    }
    
}());