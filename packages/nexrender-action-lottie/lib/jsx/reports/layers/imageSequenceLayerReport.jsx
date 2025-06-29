/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_imageSequenceLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function ImageSequenceLayer(layer, onComplete, onFail) {
        this.layer = layer;
        bm_eventDispatcher.log(typeof layer.source);
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(ImageSequenceLayer, MessageClass);

    ImageSequenceLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    ImageSequenceLayer.prototype.processImage = function() {
        var image = this.layer.source;
        if (image.width > 1500 || image.height > 1500) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.LARGE_IMAGE);
        }
        if (image.name.indexOf('.ai') !== -1) {
            this.addMessage(messageTypes.WARNING,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.ILLUSTRATOR_ASSET);
        }
    }

    ImageSequenceLayer.prototype.process = function() {
        try {
            this.processLayer();
            this.processImage();
            this._onComplete();
        } catch(error) {
            this._onFail(error);
        }
    }

    ImageSequenceLayer.prototype.serialize = function() {
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
        return new ImageSequenceLayer(layer, onComplete, onFail);
    }
    
}());