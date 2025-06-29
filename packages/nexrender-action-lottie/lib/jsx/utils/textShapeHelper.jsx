/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, bm_projectManager, $, ParagraphJustification, FolderItem */
$.__bodymovin.bm_textShapeHelper = (function () {
    var bm_compsManager = $.__bodymovin.bm_compsManager;
    var bm_renderManager = $.__bodymovin.bm_renderManager;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var layerTypes = $.__bodymovin.layerTypes;
    var getLayerType = $.__bodymovin.getLayerType;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var textCompHelper = $.__bodymovin.bm_textCompHelper;
    var ob = {}, chars = [], charComp, fontComp, charCompTextLayer, boxText, layers = [], currentFont, compsAddedFlag = false;
    
    function reset() {
        chars.length = 0;
        layers.length = 0;
        currentFont = '';
        compsAddedFlag = false;
    }
    
    function addComps() {
        if (compsAddedFlag) {
            return;
        }
        compsAddedFlag = true;
        charComp = app.project.items.addComp('bm_charHelper', 1000, 1000, 1, 1, 1);
        charCompTextLayer = charComp.layers.addText();
        var textProp = charCompTextLayer.property("Source Text");
        var textDocument = textProp.value;
        textDocument.resetCharStyle();
        textDocument.resetParagraphStyle();
        textDocument.fontSize = 100;
        textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        textProp.setValue(textDocument);
        var fontProp = charCompTextLayer.property("Source Text");
        var fontDocument = fontProp.value;
        fontDocument.fontSize = 100;
        fontDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        fontProp.setValue(fontDocument);
        fontComp = app.project.items.addComp('bm_fontHelper', 1000, 1000, 1, 1, 1);
        boxText = fontComp.layers.addBoxText([500, 500], 'm');

    }
    
    function addTextLayer(layer) {
        layers.push(layer);
    }
    
    function addChar(ch, size, font, style) {
        $.__bodymovin.bm_eventDispatcher.log("-- addChar --");
        var i = 0, charData, len = chars.length;
        while (i < len) {
            if (chars[i].ch === ch && chars[i].font === font && chars[i].style === style) {
                return false;
            }
            i += 1;
        }
        charData = {
            ch: ch,
            size: size,
            font: font,
            style: style
        };
        chars.push(charData);
        return charData;
    }
    
    function getOutlinesLayer(comp) {
        var i = 1, len = comp.layers.length, layer;
        while(i <= len) {
            layer = comp.layers[i];
            var layerType = getLayerType(layer);
            if(layerType === layerTypes.shape) {
                return layer;
            }
            i += 1;
        }
    }

    function searchCharMetadata(originalTextDocument, ch, charData) {
        var characterMetadata = textCompHelper.findCharacterData(originalTextDocument, ch);
        if (characterMetadata) {
            var yOffset = characterMetadata.compData.h;
            if (characterMetadata && characterMetadata.textData && characterMetadata.textData.y)  {
                yOffset = characterMetadata.textData.y;
            }
            var xOffset = 0;
            if (characterMetadata && characterMetadata.textData && characterMetadata.textData.x)  {
                xOffset = characterMetadata.textData.x;
            }
            var advance = characterMetadata.compData.w - xOffset;
            if (characterMetadata && characterMetadata.textData && characterMetadata.textData.advance)  {
                advance = characterMetadata.textData.advance;
            }
            charData.t = 1;
            charData.w = advance;
            charData.data = {
                refId: characterMetadata.compData.id,
                ip: 0,
                op: 99999,
                sr: 1,
                st: 0,
                ks: {
                    a: { k: [0, 0, 0], a: 0 },
                    p: { k: [-xOffset, -yOffset, 0], a: 0 },
                    r: { k: 0, a: 0 },
                    s: { k: [100, 100], a: 0 },
                    o: { k: 100, a: 0 },
                }
            };
            return true;
        }
        return false;
    }
    
    function createNewChar(layerInfo, originalTextDocument, ch, charData) {
        $.__bodymovin.bm_eventDispatcher.log("-- createNewChar --");
        if (bm_compsManager.cancelled) {
            return;
        }
        try {
            var charCode = ch.charCodeAt(0);
                //"allCaps","applyFill","applyStroke","baselineLocs","baselineShift","boxText","boxTextPos","boxTextSize","fauxBold","fauxItalic","fillColor","font","fontFamily","fontLocation","fontSize","fontStyle","horizontalScale","justification","pointText","resetCharStyle","resetParagraphStyle","smallCaps","strokeColor","strokeOverFill","strokeWidth","subscript","superscript","text","tracking","tsume","verticalScale"
            if (charCode === 13 || charCode === 3 || charCode === 160 || charCode === 65279) {
                charData.w = 0;
                return;
            }
            ////
            var hasCharMetadata = searchCharMetadata(originalTextDocument, ch, charData);
            if (hasCharMetadata) {
                return;
            }
            ////
            var shapeLayer;
            var l, lLen;
            layerInfo.copyToComp(charComp);
            var textProp = charCompTextLayer.property("Source Text");
            var textDocument = textProp.value;
            if (charCode !== 32 && charCode !== 9) {
                textDocument.text = ch + ch;
            } else {
                textDocument.text = 'i' + ch + 'i';
            }
            textDocument.font = originalTextDocument.font;
            textDocument.fontSize = 100;
            textDocument.tracking = 0;
            textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
            textProp.setValue(textDocument);
            charCompTextLayer.enabled = true;
            charCompTextLayer.selected = true;
            if (charCode !== 32 && charCode !== 9) {
                $.__bodymovin.bm_eventDispatcher.log("app.executeCommand(3781)");
                // app.executeCommand(3781);
                // app.executeCommand(app.findMenuCommandId("Create Shapes from Text"));
                $.__bodymovin.bm_eventDispatcher.log("app.executeCommand(3781) done");
            }
            charCompTextLayer.selected = false;
            var doubleSize, singleSize;
            doubleSize = charCompTextLayer.sourceRectAtTime(0, false).width;
            if (charCode !== 32 && charCode !== 9) {
                textDocument.text = ch;
            } else {
                textDocument.text = 'ii';
            }
            textProp.setValue(textDocument);
            singleSize = charCompTextLayer.sourceRectAtTime(0, false).width;
            charData.w = bm_generalUtils.roundNumber(doubleSize - singleSize, 2);
            shapeLayer = getOutlinesLayer(charComp);
            charData.data = {};
            // $.__bodymovin.bm_eventDispatcher.log("shapeLayer: " + shapeLayer.);
            if (charCode !== 32 && charCode !== 9) {
                $.__bodymovin.bm_shapeHelper.exportShape(shapeLayer, charData.data, 1, true);
                    while(charData.data.shapes.length > 1) {
                    charData.data.shapes.pop();
                }
                lLen = charData.data.shapes[0].it.length;
                for (l = 0; l < lLen; l += 1) {
                    var ks = charData.data.shapes[0].it[l].ks;
                    if (!ks) {
                        charData.data.shapes[0].it.splice(l, 1);
                        l -= 1;
                        lLen -= 1;
                    }
                }
            }




            if(shapeLayer && shapeLayer.containingComp) {
                shapeLayer.selected = false;
                shapeLayer.remove();
            }
        } catch(err) {
            bm_eventDispatcher.log('message');
            bm_eventDispatcher.log(err.message);
            bm_eventDispatcher.log(err.line);
            bm_eventDispatcher.log(err.fileName);
            if (ch !== '[]') {
                bm_eventDispatcher.alert('Character could not be created: ' + ch); 
            }
        }
    }
    
    function exportChars(fonts) {
        $.__bodymovin.bm_eventDispatcher.log("-- exportChars --");
        charComp.openInViewer();
        var i, len = layers.length, layerInfo;
        var k, kLen;
        for (i = 0; i < len; i += 1) {
            layerInfo = layers[i];
            var textProp = layerInfo.property("Source Text");
            kLen = textProp.numKeys;
            var keysFlag = true;
            if(kLen === 0){
                kLen = 1;
                keysFlag = false;
            }
            var textDocument;
            for(k=0;k<kLen;k+=1){
                if(!keysFlag){
                    textDocument = textProp.value;
                } else {
                    textDocument = textProp.keyValue(k + 1);
                }
                var font = textDocument.font;
                var fontStyle = textDocument.fontStyle;
                var fontSize = textDocument.fontSize;
                var text = textDocument.allCaps ? textDocument.text.toUpperCase() : textDocument.text;
                var extraChars = textCompHelper.getCharsFromFont(textDocument);
                text += extraChars;
                var j, jLen = text.length;
                $.__bodymovin.bm_eventDispatcher.log("font: " + font);

                if (currentFont !== font) {
                    $.__bodymovin.bm_eventDispatcher.log("currentFont !== font");
                    currentFont = font;
                    // Hack to correctly switch from one font to the other.
                    // Expected to fail throwing an error if the font doesn't support brackets but should not affect output
                    createNewChar(layerInfo, textDocument, '[]', {});
                }
                var l, lLen, ch;
                for (j = 0; j < jLen; j += 1) {
                    var charCode = text.charCodeAt(j);
                    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
                        charCode = text.charCodeAt(j + 1);
                        if (charCode >= 0xDC00 && charCode <= 0xDFFF) {
                            ch = text.substr(j, 2);
                            ++j;
                        } else {
                            ch = text.substr(j, 1);
                        }
                    } else {
                        ch = text.substr(j, 1);
                    }
                    var charData = addChar(ch, fontSize, font, fontStyle);
                    if (charData !== false) {
                        createNewChar(layerInfo, textDocument, ch, charData);
                        l = 0;
                        lLen = fonts.list.length;
                        while (l < lLen) {
                            if (fonts.list[l].fName === charData.font) {
                                charData.fFamily = fonts.list[l].fFamily;
                                break;
                            }
                            l += 1;
                        }
                    }
                }
            }

        }
        
        bm_renderManager.setChars(chars);
    }
    
    function exportFonts(fonts) {
        fontComp.openInViewer();
        var i, len = fonts.list.length, rect, baseLineShift;
        var fontProp = boxText.property("Source Text");
        var fontDocument = fontProp.value;
        fontDocument.text = 'm';
        for (i = 0; i < len; i += 1) {
            fontDocument.font = fonts.list[i].fName;
            fontDocument.fontSize = 100;
            fontDocument.tracking = 0;
            fontProp.setValue(fontDocument);
            rect = boxText.sourceRectAtTime(0, false);
            baseLineShift = 0;
            if(fontDocument.baselineShift){
                baseLineShift = fontDocument.baselineShift;
            }
            fonts.list[i].ascent = 250 + rect.top + rect.height + baseLineShift;
        }
    }
    
    function removeComps() {
        if (compsAddedFlag) {
            charComp.remove();
            fontComp.remove();
            compsAddedFlag = false;
        }
    }
    
    ob.reset = reset;
    ob.addChar = addChar;
    ob.addTextLayer = addTextLayer;
    ob.exportChars = exportChars;
    ob.exportFonts = exportFonts;
    ob.addComps = addComps;
    ob.removeComps = removeComps;
    
    return ob;
}());
