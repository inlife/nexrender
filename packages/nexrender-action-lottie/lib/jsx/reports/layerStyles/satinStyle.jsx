/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesSatinFactory = (function () {
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;

    function Satin(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(Satin, MessageClass);

    Satin.prototype.processProperties = function() {
    }

    Satin.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.SKOTTIE,
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    Satin.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    Satin.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.satin,
            messages: this.serializeMessages(),
        }
    }

    return function(style) {
        return new Satin(style);
    }
    
}());