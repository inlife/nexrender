/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesColorOverlayFactory = (function () {
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;

    function ColorOverlay(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(ColorOverlay, MessageClass);

    ColorOverlay.prototype.processProperties = function() {
    }

    ColorOverlay.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.SKOTTIE,
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    ColorOverlay.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    ColorOverlay.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.colorOverlay,
            messages: this.serializeMessages(),
        }
    }

    return function(style) {
        return new ColorOverlay(style);
    }
    
}());