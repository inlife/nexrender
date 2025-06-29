/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesStrokeFactory = (function () {
    
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Stroke(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(Stroke, MessageClass);

    Stroke.prototype.processProperties = function() {
        this.color = propertyReport(this.style.property('frameFX/color'));
        this.size = propertyReport(this.style.property('frameFX/size'));
        this.blendMode = propertyReport(this.style.property('frameFX/mode2'));
        this.opacity = propertyReport(this.style.property('frameFX/opacity'));
        this.position = propertyReport(this.style.property('frameFX/style'));
    }

    Stroke.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    Stroke.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    Stroke.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.stroke,
            messages: this.serializeMessages(),
            color: this.color.serialize(),
            size: this.size.serialize(),
            blendMode: this.blendMode.serialize(),
            opacity: this.opacity.serialize(),
            position: this.position.serialize(),
        }
    }

    return function(style) {
        return new Stroke(style);
    }
    
}());