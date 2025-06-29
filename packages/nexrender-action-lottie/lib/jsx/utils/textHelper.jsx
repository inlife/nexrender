/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $,layerElement, File, app, ParagraphJustification, bm_textAnimatorHelper, bm_keyframeHelper, bm_sourceHelper, bm_textShapeHelper*/
$.__bodymovin.bm_textHelper = (function () {
    'use strict';
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var bm_textAnimatorHelper = $.__bodymovin.bm_textAnimatorHelper;
    var bm_expressionHelper = $.__bodymovin.bm_expressionHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var annotationsManager = $.__bodymovin.bm_annotationsManager;
    var essentialPropertiesHelper = $.__bodymovin.bm_essentialPropertiesHelper;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var ob = {};
    
    function getJustification(value) {
        switch (value) {
        case ParagraphJustification.LEFT_JUSTIFY:
            return 0;
        case ParagraphJustification.RIGHT_JUSTIFY:
            return 1;
        case ParagraphJustification.CENTER_JUSTIFY:
            return 2;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_LEFT:
            return 3;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_RIGHT:
            return 4;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_CENTER:
            return 5;
        case ParagraphJustification.FULL_JUSTIFY_LASTLINE_FULL:
            return 6;
        }
    }

    function findLineHeight(textDocument) {
        var baselineLocs = textDocument.baselineLocs
        var fontSize = textDocument.fontSize
        var isFound = false
        var counter = 1
        var lineHeight = fontSize
        while(!isFound) {
            if (baselineLocs.length > 1 + counter * 4) {
                lineHeight = (baselineLocs[1 + counter * 4] - baselineLocs[1]) / counter
                if (lineHeight < 100000) {
                    isFound = true
                } else {
                    lineHeight = fontSize
                }
            } else {
                isFound = true
            }
            counter += 1
        }
        return lineHeight
    }
    
    function exportTextDocumentData(layerInfo, data, frameRate, stretch) {
        var duplicatedLayerInfo = layerInfo.duplicate();
        duplicatedLayerInfo.locked = false;
        removeLayerAnimators(duplicatedLayerInfo);
        var sourceTextProp = duplicatedLayerInfo.property("Source Text");
        bm_expressionHelper.checkExpression(sourceTextProp, data);
        var hasExpression = sourceTextProp.expressionEnabled
        if(sourceTextProp.expressionEnabled) {
            sourceTextProp.expressionEnabled = false;
        }
        var arr = [];
        data.k = arr;

        if (settingsHelper.shouldExportEssentialProperties()) {
            if (settingsHelper.shouldExportEssentialPropertiesAsSlots()) {
                var essentialPropId = essentialPropertiesHelper.searchPropertyId(layerInfo.property("Source Text"));
                if (essentialPropId) {
                    data.sid = essentialPropId;
                }
            } else {
                // TODO: implement once AE supports it
                /*var essentialProperty = essentialPropertiesHelper.searchProperty(layerInfo.property("Source Text"));
                if (essentialProperty) {
                    data.k = essentialProperty;
                    return;
                }*/
            }
        }
        var numKeys = sourceTextProp.numKeys;
        var j, jLen = numKeys ? numKeys : 1;
        if(jLen === 0){
            jLen = 1;
        }
        var additionalTextDocumentData = annotationsManager.searchTextProperties(layerInfo);
        for(j=0;j<jLen;j+=1){
            var ob = {};
            var textDocument, time;
            if(numKeys === 0){
                time = 0;
                textDocument = sourceTextProp.value;
            } else {
                time = sourceTextProp.keyTime(j + 1);
                textDocument = sourceTextProp.keyValue(j + 1);
            }
            if (textDocument.boxText) {
                ob.sz = textDocument.boxTextSize;
                ob.ps = textDocument.boxTextPos;
            }
            var i, len;
            ob.s = textDocument.fontSize;
            ob.f = textDocument.font;
            $.__bodymovin.bm_sourceHelper.addFont(textDocument.font, textDocument.fontFamily, textDocument.fontStyle, textDocument.fontLocation);
            if(textDocument.allCaps){
                ob.t = textDocument.text.toUpperCase();
                ob.ca = 1;
            } else {
                ob.t = textDocument.text;
                ob.ca = textDocument.smallCaps ? 2 : 0;
            }
            len = ob.t.length;
            ob.j = getJustification(textDocument.justification);
            ob.tr = textDocument.tracking;
            if (textDocument.leading) {
                ob.lh = textDocument.leading;
            } else if(textDocument.baselineLocs && textDocument.baselineLocs.length > 5){
                if(textDocument.baselineLocs[5] > textDocument.baselineLocs[1]){
                    ob.lh = findLineHeight(textDocument)
                } else {
                    ob.lh = ob.s*1.2;
                }
            } else {
                ob.lh = ob.s*1.2;
            }
            if(textDocument.baselineShift){
                ob.ls = textDocument.baselineShift;
            } else {
                ob.ls = 0;
            }
            if (textDocument.applyFill) {
                len = textDocument.fillColor.length;
                ob.fc = [];
                for (i = 0; i < len; i += 1) {
                    ob.fc[i] = Math.round(1000 * textDocument.fillColor[i]) / 1000;
                }
            }
            if (textDocument.applyStroke) {
                len = textDocument.strokeColor.length;
                ob.sc = [];
                for (i = 0; i < len; i += 1) {
                    ob.sc[i] = Math.round(1000 * textDocument.strokeColor[i]) / 1000;
                }
                ob.sw = textDocument.strokeWidth;
                if (textDocument.applyFill) {
                    ob.of = textDocument.strokeOverFill;
                }
            }
            for (var s in additionalTextDocumentData) {
                if (additionalTextDocumentData.hasOwnProperty(s)) {
                    ob[s] = additionalTextDocumentData[s]
                }
            }
            //TODO check if it need to be multiplied by stretch
            arr.push({s:ob,t:time*frameRate});
        }
        if(hasExpression) {
            sourceTextProp.expressionEnabled = true;
        }
        duplicatedLayerInfo.remove();
        $.__bodymovin.bm_textShapeHelper.addTextLayer(layerInfo);

    }

    function removeLayerAnimators(layerInfo){
        var textProperty = layerInfo.property("Text");
        var i, len = textProperty.numProperties;
        for (i = 0; i < len; i += 1) {
            switch (textProperty(i + 1).matchName) {
            case "ADBE Text Animators":
                removeAnimators(textProperty(i + 1));
                break;
            }
        }
    }
    
    function removeAnimators(layerInfo) {
        var i, len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            if (layerInfo.property(i + 1).matchName === "ADBE Text Animator") {
                layerInfo.property(i + 1).remove();
                i -= 1;
                len -= 1;
            }
        }
    }
    
    function exportTextPathData(pathOptions, ob, masksProperties, frameRate, stretch) {
        if (pathOptions.property("Path").value !== 0) {
            masksProperties[pathOptions.property("Path").value - 1].mode = 'n';
            ob.m = pathOptions.property("Path").value - 1;
            ob.f = bm_keyframeHelper.exportKeyframes(pathOptions.property("First Margin"), frameRate, stretch);
            ob.l = bm_keyframeHelper.exportKeyframes(pathOptions.property("Last Margin"), frameRate, stretch);
            ob.a = bm_keyframeHelper.exportKeyframes(pathOptions.property("Force Alignment"), frameRate, stretch);
            // ob.a = pathOptions.property("Force Alignment").value;
            ob.p = bm_keyframeHelper.exportKeyframes(pathOptions.property("Perpendicular To Path"), frameRate, stretch);
            // ob.p = pathOptions.property("Perpendicular To Path").value;
            ob.r = bm_keyframeHelper.exportKeyframes(pathOptions.property("Reverse Path"), frameRate, stretch);
            // ob.r = pathOptions.property("Reverse Path").value;
        }
    }
    
    function exportMoreOptionsData(pathOptions, ob, frameRate, stretch) {
        ob.g = pathOptions.property("Anchor Point Grouping").value;
        ob.a = bm_keyframeHelper.exportKeyframes(pathOptions.property("Grouping Alignment"), frameRate, stretch);
        
    }
    
    function exportAnimators(layerInfo, animatorArr, frameRate, stretch) {
        var i, len = layerInfo.numProperties;
        for (i = 0; i < len; i += 1) {
            if (layerInfo.property(i + 1).matchName === "ADBE Text Animator") {
                var animatorOb = {};
                bm_textAnimatorHelper.exportAnimator(layerInfo.property(i + 1), animatorOb, frameRate, stretch);
                animatorArr.push(animatorOb);
            }
        }
    }
    
    function exportText(layerInfo, layerOb, frameRate) {
        layerOb.t = {
            d: {},
            p: {},
            m: {}
        };
        var stretch = layerOb.sr || 1;
        exportTextDocumentData(layerInfo, layerOb.t.d, frameRate, stretch);
        var textProperty = layerInfo.property("Text");
        
        var i, len = textProperty.numProperties;
        for (i = 0; i < len; i += 1) {
            switch (textProperty(i + 1).matchName) {
            case "ADBE Text Path Options":
                exportTextPathData(textProperty(i + 1), layerOb.t.p, layerOb.masksProperties, frameRate, stretch);
                break;
            case "ADBE Text More Options":
                exportMoreOptionsData(textProperty(i + 1), layerOb.t.m, frameRate, stretch);
                break;
            case "ADBE Text Animators":
                if (!layerOb.t.a) {
                    layerOb.t.a = [];
                }
                exportAnimators(textProperty(i + 1), layerOb.t.a, frameRate, stretch);
                break;
            }
        }
        //exportMoreOptionsData(layerInfo, layerOb.t.m, frameRate);
    }
    
    ob.exportText = exportText;
    ob.exportTextDocumentData = exportTextDocumentData;
    
    return ob;
    
}());