/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerStylesReportFactory = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var getStyleType = $.__bodymovin.getLayerStyleType;
    var dropShadowFactory = $.__bodymovin.bm_layerStylesDropShadowFactory;
    var strokeFactory = $.__bodymovin.bm_layerStylesStrokeFactory;
    var innerShadowFactory = $.__bodymovin.bm_layerStylesInnerShadowFactory;
    var outerGlowFactory = $.__bodymovin.bm_layerStylesOuterGlowFactory;
    var innerGlowFactory = $.__bodymovin.bm_layerStylesInnerGlowFactory;
    var bevelEmbossFactory = $.__bodymovin.bm_layerStylesBevelEmbossFactory;
    var satinFactory = $.__bodymovin.bm_layerStylesSatinFactory;
    var colorOverlayFactory = $.__bodymovin.bm_layerStylesColorOverlayFactory;
    var gradientOverlayFactory = $.__bodymovin.bm_layerStylesGradientOverlayFactory;

    function LayerStyles(styles) {
        this.stylesProperty = styles;
        this.styles = [];
        this.messages = [];
        this.process();
    }

    generalUtils.extendPrototype(LayerStyles, MessageClass);

    var styleTypesFactories = {}
    styleTypesFactories[layerStyleTypes.stroke] = strokeFactory;
    styleTypesFactories[layerStyleTypes.dropShadow] = dropShadowFactory;
    styleTypesFactories[layerStyleTypes.innerShadow] = innerShadowFactory;
    styleTypesFactories[layerStyleTypes.outerGlow] = outerGlowFactory;
    styleTypesFactories[layerStyleTypes.innerGlow] = innerGlowFactory;
    styleTypesFactories[layerStyleTypes.bevelEmboss] = bevelEmbossFactory;
    styleTypesFactories[layerStyleTypes.satin] = satinFactory;
    styleTypesFactories[layerStyleTypes.colorOverlay] = colorOverlayFactory;
    styleTypesFactories[layerStyleTypes.gradientOverlay] = gradientOverlayFactory;

    function buildStyleReport(type, style) {
        return styleTypesFactories[type](style);
    }

    LayerStyles.prototype.process = function() {
        var styleElement, styleType
        for (var i = 0; i < this.stylesProperty.numProperties; i += 1) {
            styleElement = this.stylesProperty(i + 1);
            styleType = getStyleType(styleElement.matchName);
            if (styleElement.enabled && styleType !== '') {
                this.styles.push(buildStyleReport(styleType, styleElement));
            }
        }
    }

    LayerStyles.prototype.serialize = function() {
        var styles = [];
        for (var i = 0; i < this.styles.length; i += 1) {
            styles.push(this.styles[i].serialize());
        }
        return {
            messages: this.serializeMessages(),
            styles: styles,
        }
    }

    return function(styles) {
        return new LayerStyles(styles);
    }
    
}());