/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/
$.__bodymovin.bm_layerStylesHelper = (function () {
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var layerStyleTypes = $.__bodymovin.layerStyleTypes;
    var getStyleType = $.__bodymovin.getLayerStyleType;

    var ob = {};
    
    function exportStroke(style, frameRate, stretch) {
        var ob = {};
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('frameFX/color'), frameRate, stretch);
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('frameFX/size'), frameRate, stretch);
        return ob;
    }
    
    function exportDropShadow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/opacity'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/localLightingAngle'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/blur'), frameRate, stretch);
        // Distance
        ob.d = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/distance'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/noise'), frameRate, stretch);
        // Layer Knocks Out Drop Shadow
        ob.lc = bm_keyframeHelper.exportKeyframes(style.property('dropShadow/layerConceals'), frameRate, stretch);
        return ob;
    }
    
    function exportInnerShadow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/opacity'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/localLightingAngle'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/blur'), frameRate, stretch);
        // Distance
        ob.d = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/distance'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('innerShadow/noise'), frameRate, stretch);
        return ob;
    }
    
    function exportOuterGlow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/opacity'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/blur'), frameRate, stretch);
        // Range
        ob.r = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/inputRange'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/noise'), frameRate, stretch);
        // Jitter
        ob.j = bm_keyframeHelper.exportKeyframes(style.property('outerGlow/shadingNoise'), frameRate, stretch);
        return ob;
    }
    
    function exportInnerGlow(style, frameRate, stretch) {
        var ob = {};
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/opacity'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/blur'), frameRate, stretch);
        // Range
        ob.r = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/inputRange'), frameRate, stretch);
        // Source
        ob.sr = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/innerGlowSource'), frameRate, stretch);
        // Choke/Spread
        ob.ch = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/chokeMatte'), frameRate, stretch);
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/mode2'), frameRate, stretch);
        // Noise
        ob.no = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/noise'), frameRate, stretch);
        // Jitter
        ob.j = bm_keyframeHelper.exportKeyframes(style.property('innerGlow/shadingNoise'), frameRate, stretch);
        return ob;
    }
    
    function exportBevelEmboss(style, frameRate, stretch) {
        var ob = {};
        $.__bodymovin.bm_generalUtils.iterateProperty(style);
        // Style
        ob.bs = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/bevelStyle'), frameRate, stretch);
        // Technique
        ob.bt = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/bevelTechnique'), frameRate, stretch);
        // Depth
        ob.sr = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/strengthRatio'), frameRate, stretch);
        // Direction
        ob.bd = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/bevelDirection'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/blur'), frameRate, stretch);
        // Soften
        ob.sf = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/softness'), frameRate, stretch);
        // Use Global Light
        ob.ga = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/useGlobalAngle'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/localLightingAngle'), frameRate, stretch);
        // Altitude
        ob.ll = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/localLightingAltitude'), frameRate, stretch);
        // Highlight Mode
        ob.hm = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/highlightMode'), frameRate, stretch);
        // Highlight Color
        ob.hc = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/highlightColor'), frameRate, stretch);
        // Highlight Opacity
        ob.ho = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/highlightOpacity'), frameRate, stretch);
        // Shadow Mode
        ob.sm = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/shadowMode'), frameRate, stretch);
        // Shadow Color
        ob.sc = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/shadowColor'), frameRate, stretch);
        // Shadow Opacity
        ob.so = bm_keyframeHelper.exportKeyframes(style.property('bevelEmboss/shadowOpacity'), frameRate, stretch);
        return ob;
    }
    
    function exportSatin(style, frameRate, stretch) {
        var ob = {};
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/mode2'), frameRate, stretch);
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/color'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/opacity'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/localLightingAngle'), frameRate, stretch);
        // Distance
        ob.d = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/distance'), frameRate, stretch);
        // Size
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/blur'), frameRate, stretch);
        // Invert
        ob.in = bm_keyframeHelper.exportKeyframes(style.property('chromeFX/invert'), frameRate, stretch);
        return ob;
    }
    
    function exportColorOverlay(style, frameRate, stretch) {
        var ob = {};
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('solidFill/mode2'), frameRate, stretch);
        // Color
        ob.c = bm_keyframeHelper.exportKeyframes(style.property('solidFill/color'), frameRate, stretch);
        // Opacity
        ob.so = bm_keyframeHelper.exportKeyframes(style.property('solidFill/opacity'), frameRate, stretch);
        return ob;
    }
    
    function exportGradientOverlay(style, frameRate, stretch) {
        var ob = {};
        // Blend Mode
        ob.bm = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/mode2'), frameRate, stretch);
        // Opacity
        ob.o = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/opacity'), frameRate, stretch);
        // Colors
        ob.gf = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/gradient'), frameRate, stretch);
        // Gradient Smoothness
        ob.gs = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/gradientSmoothness'), frameRate, stretch);
        // Angle
        ob.a = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/angle'), frameRate, stretch);
        // Style
        ob.gt = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/type'), frameRate, stretch);
        // Reverse
        ob.re = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/reverse'), frameRate, stretch);
        // Align with Layer
        ob.al = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/align'), frameRate, stretch);
        // Scale
        ob.s = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/scale'), frameRate, stretch);
        // Offset
        ob.of = bm_keyframeHelper.exportKeyframes(style.property('gradientFill/offset'), frameRate, stretch);

        return ob;
    }
    
    function exportStyles(layerInfo, layerData, frameRate) {
        if (!(layerInfo.property('Layer Styles') && layerInfo.property('Layer Styles').numProperties > 0)) {
            return;
        }
        var stretch = layerData.sr;
        var styles = layerInfo.property('Layer Styles');
        var i, len = styles.numProperties, styleElement;
        var stylesArray = [];
        for (i = 0; i < len; i += 1) {
            styleElement = styles(i + 1);
            if (styleElement.enabled) {
                var styleOb = null;
                var styleType = getStyleType(styleElement.matchName);
                
                switch (styleType) {
                case layerStyleTypes.stroke:
                    styleOb = exportStroke(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.dropShadow:
                    styleOb = exportDropShadow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.innerShadow:
                    styleOb = exportInnerShadow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.outerGlow:
                    styleOb = exportOuterGlow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.innerGlow:
                    styleOb = exportInnerGlow(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.bevelEmboss:
                    styleOb = exportBevelEmboss(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.satin:
                    styleOb = exportSatin(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.colorOverlay:
                    styleOb = exportColorOverlay(styleElement, frameRate, stretch);
                    break;
                case layerStyleTypes.gradientOverlay:
                    styleOb = exportGradientOverlay(styleElement, frameRate, stretch);
                    break;
                }
                
                if (styleOb) {
                    // common props
                    styleOb.ty = styleType;
                    styleOb.nm = styleElement.name;
                
                    stylesArray.push(styleOb);
                }
            }
        }
        if (stylesArray.length) {
            layerData.sy = stylesArray;
        }
    }
    
    ob.exportStyles = exportStyles;
    
    return ob;
}());
