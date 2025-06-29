/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesDropShadowFactory = (function () {
    
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function DropShadow(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(DropShadow, MessageClass);

    DropShadow.prototype.processProperties = function() {
        // Color
        this.color = propertyReport(this.style.property('dropShadow/color'));
        // // Opacity
        this.opacity = propertyReport(this.style.property('dropShadow/opacity'));
        // Angle
        this.angle = propertyReport(this.style.property('dropShadow/localLightingAngle'));
        // Size
        this.size = propertyReport(this.style.property('dropShadow/blur'));
        // Distance
        this.distance = propertyReport(this.style.property('dropShadow/distance'));
        // Choke/Spread
        this.spread = propertyReport(this.style.property('dropShadow/chokeMatte'));
        // Blend Mode
        this.blendMode = propertyReport(this.style.property('dropShadow/mode2'));
        // Noise
        this.noise = propertyReport(this.style.property('dropShadow/noise'));
        // Layer Knocks Out Drop Shadow
        this.knocksOut = propertyReport(this.style.property('dropShadow/layerConceals'));
    }

    DropShadow.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    DropShadow.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    DropShadow.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.dropShadow,
            messages: this.serializeMessages(),
            color: this.color.serialize(),
            opacity: this.opacity.serialize(),
            angle: this.angle.serialize(),
            size: this.size.serialize(),
            distance: this.distance.serialize(),
            spread: this.spread.serialize(),
            blendMode: this.blendMode.serialize(),
            noise: this.noise.serialize(),
            knocksOut: this.knocksOut.serialize(),
        }
    }

    return function(style) {
        return new DropShadow(style);
    }
    
}());