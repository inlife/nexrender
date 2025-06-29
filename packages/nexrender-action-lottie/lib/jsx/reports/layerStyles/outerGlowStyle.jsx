/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesOuterGlowFactory = (function () {
    
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function OuterGlow(style) {
        this.style = style;
        this.messages = [];
        this.process();
    }
    generalUtils.extendPrototype(OuterGlow, MessageClass);

    OuterGlow.prototype.processProperties = function() {
        this.blendMode = propertyReport(this.style.property('outerGlow/mode2'));
        this.opacity = propertyReport(this.style.property('outerGlow/opacity'));
        this.noise = propertyReport(this.style.property('outerGlow/noise'));
        this.colorChoice = propertyReport(this.style.property('outerGlow/AEColorChoice'));
        this.color = propertyReport(this.style.property('outerGlow/color'));
        this.gradient = propertyReport(this.style.property('outerGlow/gradient'));
        this.gradientSmoothness = propertyReport(this.style.property('outerGlow/gradientSmoothness'));
        this.glowTechnique = propertyReport(this.style.property('outerGlow/glowTechnique'));
        this.chokeMatte = propertyReport(this.style.property('outerGlow/chokeMatte'));
        this.blur = propertyReport(this.style.property('outerGlow/blur'));
        this.inputRange = propertyReport(this.style.property('outerGlow/inputRange'));
        this.shadingNoise = propertyReport(this.style.property('outerGlow/shadingNoise'));
    }

    OuterGlow.prototype.processStyle = function() {
        this.addMessage(messageTypes.WARNING,
        [
            rendererTypes.BROWSER,
            rendererTypes.IOS,
            rendererTypes.ANDROID,
        ],
        builderTypes.UNSUPPORTED_STYLE);
    }

    OuterGlow.prototype.process = function() {
        this.processProperties();
        this.processStyle();
    }

    OuterGlow.prototype.serialize = function() {
        return {
            name: this.style.name,
            type: layerStyleTypes.outerGlow,
            messages: this.serializeMessages(),
            blendMode: this.blendMode.serialize(),
            opacity: this.opacity.serialize(),
            noise: this.noise.serialize(),
            colorChoice: this.colorChoice.serialize(),
            color: this.color.serialize(),
            gradient: this.gradient.serialize(),
            gradientSmoothness: this.gradientSmoothness.serialize(),
            glowTechnique: this.glowTechnique.serialize(),
            chokeMatte: this.chokeMatte.serialize(),
            blur: this.blur.serialize(),
            inputRange: this.inputRange.serialize(),
            shadingNoise: this.shadingNoise.serialize(),
        }
    }

    return function(style) {
        return new OuterGlow(style);
    }
    
}());