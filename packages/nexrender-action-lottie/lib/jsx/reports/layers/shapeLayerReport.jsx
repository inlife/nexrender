/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeLayerReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var layerReport = $.__bodymovin.bm_layerReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var shapeCollectionFactory = $.__bodymovin.bm_shapeCollectionReport;


    function ShapeLayer(shape, onComplete, onFail) {
        this.shape = shape;
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(ShapeLayer, MessageClass);


    ShapeLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.shape);
    }

    ShapeLayer.prototype.processShapes = function() {
        var shapes = this.shape.property('ADBE Root Vectors Group');
        this.shapesCollection = shapeCollectionFactory(shapes);
    }

    ShapeLayer.prototype.process = function() {
        try {
            this.processLayer();
            this.processShapes();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    ShapeLayer.prototype.serialize = function() {
        var layerReportData = this.layerReport.serialize();
        var localMessages = this.serializeMessages();
        var shapesCollection = this.shapesCollection.serialize();
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
        serializedData.shapes = shapesCollection.shapes;
        return serializedData;
    }

    return function(shape, onComplete, onFail) {
        return new ShapeLayer(shape, onComplete, onFail);
    }
    
}());