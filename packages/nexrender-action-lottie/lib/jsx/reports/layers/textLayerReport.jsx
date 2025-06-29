/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_textLayerReport = (function () {
    
    var layerReport = $.__bodymovin.bm_layerReport;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var textAnimatorsReport = $.__bodymovin.bm_textAnimatorsReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function TextLayer(layer, onComplete, onFail) {
        this.layer = layer;
        this.animators = [];
        this._onComplete = onComplete;
        this._onFail = onFail;
    }
    
    generalUtils.extendPrototype(TextLayer, MessageClass);

    TextLayer.prototype.processLayer = function() {
        this.layerReport = layerReport(this.layer);
    }

    TextLayer.prototype.processAnimators = function() {
        const animators = this.layer.property("Text").property('ADBE Text Animators');
        var i, len = animators.numProperties;
        var textAnimator;
        for (i = 0; i < len; i += 1) {
            if (animators.property(i + 1).matchName === 'ADBE Text Animator') {
                textAnimator = textAnimatorsReport(animators.property(i + 1));
                this.animators.push(textAnimator);
            }
        }
        if (this.animators.length > 0) {
            this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.TEXT_ANIMATORS);
        }
    }

    TextLayer.prototype.process = function() {
        try {
            this.processLayer();
            this.processAnimators();
            this._onComplete();
        } catch(error) {
            if (error) {
                bm_eventDispatcher.log(error.message);
                bm_eventDispatcher.log(error.line);
                bm_eventDispatcher.log(error.fileName);
            }
            bm_eventDispatcher.log($.stack);
            this._onFail(error);
        }
    }

    TextLayer.prototype.serialize = function() {
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
        var animators = [];
        for (var i = 0; i < this.animators.length; i += 1) {
            animators.push(this.animators[i].serialize());
        }
        serializedData.text = {
            animators: animators,
        }
        return serializedData;
    }



    return function(layer, onComplete, onFail) {
        return new TextLayer(layer, onComplete, onFail);
    }
    
}());