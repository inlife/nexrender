/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, layerElement, File, app, ParagraphJustification, bm_textAnimatorHelper, bm_keyframeHelper, bm_sourceHelper, bm_textShapeHelper*/
$.__bodymovin.bm_textCompHelper = (function () {
    'use strict';
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var ob = {};
    var fonts = [];
    var count = 0;

    function buildTextData(comment) {
        var lines = comment.split('\r\n');
        if (lines[0] === 'font') {
            var i, len = lines.length;
            var textData = {}
            for (i = 1; i < len; i += 1) {
                var line = lines[i].split(':')
                if (line[0] === 'x') {
                    textData.x = line[1];
                } else if (line[0] === 'y') {
                    textData.y = line[1];
                } else if (line[0] === 'advance') {
                    textData.advance = line[1];
                }
            }
            return textData;
        }
        return null
    }

    function searchTextDataMarker(comp) {
        if (comp.markerProperty && comp.markerProperty.numKeys >= 1) {
            var markerProperty = comp.markerProperty;
            var len = markerProperty.numKeys, markerElement;
            for (var i = 0; i < len; i += 1) {
                markerElement = markerProperty.keyValue(i + 1);
                var comment = markerElement.comment;
                var parsedComment = buildTextData(comment);
                if (parsedComment) {
                    return parsedComment;
                }
            }
        }
    }
    
    function addCompsFromFolder(folder, fontData) {
        var numInFolder = folder.numItems;
        var comps = [];
        for (var i = numInFolder; i >= 1; i--) {
            var comp = folder.item(i);
            var textData = searchTextDataMarker(comp);
            var compData = {
                layers: [],
                id: 'fontComp_' + count++,
                nm: comp.name,
                w: comp.width,
                h: comp.height,
            };
            var characterData = {
                comp: comp,
                compData: compData,
                character: comp.name,
                textData: textData,
            }
            comps.push(characterData);
        }
        fontData.characters = comps;
        return comps;
    }

    function findExportedFolder(name) {
        var i = 0, len = fonts.length;
        while ( i < len) {
            if (fonts[i].name === name) {
                return true;
            }
            i += 1;
        }
        return false;
    }

    function createFontData(name) {
        return {
            name: name,
            characters: [],
        }
    }

    function findCharacter(characters, character) {
        var i = 0;
        var len = characters.length;
        for (i = 0; i < len; i += 1) {
            var characterData = characters[i];
            if (characterData.character === character) {
                return characterData;
            }
        }
        return false;
    }

    function findCharacterData(textDocument, character) {
        var i = 0;
        var len = fonts.length;
        var fontName = textDocument.fontFamily + '-' + textDocument.fontStyle;
        for (i = 0; i < len; i += 1) {
            var fontData = fonts[i];
            if (fontData.name === fontName) {
                return findCharacter(fontData.characters, character)
            }
        }
        return false;
    }

    function findFolderFont(layer) {
        if (settingsHelper.shouldReplaceCharactersWithComps()) {
            var items = app.project.items;
            var sourceTextProp = layer.property("Source Text");
            var numKeys = sourceTextProp.numKeys;
            var j, jLen = numKeys ? numKeys : 1;
            var textDocument;
            for(j=0;j<jLen;j+=1){
                if(numKeys === 0){
                    textDocument = sourceTextProp.value;
                } else {
                    textDocument = sourceTextProp.keyValue(j + 1);
                }
                var fontName = textDocument.fontFamily + '-' + textDocument.fontStyle;
                for ( var i = 0; i < items.length; i+= 1) {
                    var item = items[i + 1];
                    if (item instanceof FolderItem) {
                        if (item.name === fontName && !findExportedFolder(fontName)) {
                            var fontData = createFontData(fontName);
                            fonts.push(fontData);
                            return addCompsFromFolder(item, fontData);
                        }
                    }
                }
            }
        }
        return [];
    }

    function getCharsFromFolder(folder) {
        var chars = '';
        var numInFolder = folder.numItems;
        for (var i = numInFolder; i >= 1; i--) {
            var comp = folder.item(i);
            chars += comp.name;
        }
        return chars;
    }

    function getCharsFromFont(textDocument) {
        var chars = '';
        if (settingsHelper.shouldReplaceCharactersWithComps()) {
            var items = app.project.items;
            var fontName = textDocument.fontFamily + '-' + textDocument.fontStyle;
            for ( var i = 0; i < items.length; i+= 1) {
                var item = items[i + 1];
                if (item instanceof FolderItem) {
                    if (item.name === fontName) {
                        chars = getCharsFromFolder(item);
                    }
                }
            }
        }
        return chars;
    }

    function reset() {
        fonts.length = 0;
        count = 0;
    }
    
    ob.findFolderFont = findFolderFont;
    ob.findCharacterData = findCharacterData;
    ob.getCharsFromFont = getCharsFromFont;
    ob.reset = reset;
    
    return ob;
    
}());