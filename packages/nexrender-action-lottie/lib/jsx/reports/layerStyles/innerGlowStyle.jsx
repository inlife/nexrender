/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesInnerGlowFactory = (function () {
    
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function InnerGlow(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(InnerGlow, MessageClass);

    InnerGlow.prototype.processProperties = function() {
        this.blendMode = propertyReport(this.style.property('innerGlow/mode2'));
        this.opacity = propertyReport(this.style.property('innerGlow/opacity'));
        this.noise = propertyReport(this.style.property('innerGlow/noise'));
        this.colorChoice = propertyReport(this.style.property('innerGlow/AEColorChoice'));
        this.color = propertyReport(this.style.property('innerGlow/color'));
        this.gradient = propertyReport(this.style.property('innerGlow/gradient'));
        this.gradientSmoothness = propertyReport(this.style.property('innerGlow/gradientSmoothness'));
        this.glowTechnique = propertyReport(this.style.property('innerGlow/glowTechnique'));
        this.source = propertyReport(this.style.property('innerGlow/innerGlowSource'));
        this.chokeMatte = propertyReport(this.style.property('innerGlow/chokeMatte'));
        this.blur = propertyReport(this.style.property('innerGlow/blur'));
        this.inputRange = propertyReport(this.style.property('innerGlow/inputRange'));
        this.shadingNoise = propertyReport(this.style.property('innerGlow/shadingNoise'));
    }

    InnerGlow.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    InnerGlow.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    InnerGlow.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.innerGlow,
            messages: this.serializeMessages(),
            blendMode: this.blendMode.serialize(),
            opacity: this.opacity.serialize(),
            noise: this.noise.serialize(),
            colorChoice: this.colorChoice.serialize(),
            color: this.color.serialize(),
            gradient: this.gradient.serialize(),
            gradientSmoothness: this.gradientSmoothness.serialize(),
            glowTechnique: this.glowTechnique.serialize(),
            source: this.source.serialize(),
            chokeMatte: this.chokeMatte.serialize(),
            blur: this.blur.serialize(),
            inputRange: this.inputRange.serialize(),
            shadingNoise: this.shadingNoise.serialize(),
        }
    }

    return function(style) {
        return new InnerGlow(style);
    }
    
}());