/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesInnerShadowFactory = (function () {
    
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function InnerShadow(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(InnerShadow, MessageClass);

    InnerShadow.prototype.processProperties = function() {
        this.blendMode = propertyReport(this.style.property('innerShadow/mode2'));
        this.color = propertyReport(this.style.property('innerShadow/color'));
        this.opacity = propertyReport(this.style.property('innerShadow/opacity'));
        this.globalLight = propertyReport(this.style.property('innerShadow/useGlobalAngle'));
        this.angle = propertyReport(this.style.property('innerShadow/localLightingAngle'));
        this.distance = propertyReport(this.style.property('innerShadow/distance'));
        this.choke = propertyReport(this.style.property('innerShadow/chokeMatte'));
        this.size = propertyReport(this.style.property('innerShadow/size'));
        this.noise = propertyReport(this.style.property('innerShadow/noise'));
    }

    InnerShadow.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    InnerShadow.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    InnerShadow.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.innerShadow,
            messages: this.serializeMessages(),
            blendMode: this.blendMode.serialize(),
            color: this.color.serialize(),
            opacity: this.opacity.serialize(),
            globalLight: this.globalLight.serialize(),
            angle: this.angle.serialize(),
            distance: this.distance.serialize(),
            choke: this.choke.serialize(),
            size: this.size.serialize(),
            noise: this.noise.serialize(),
        }
    }

    return function(style) {
        return new InnerShadow(style);
    }
    
}());