/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, PropertyValueType, KeyframeInterpolationType, PropertyType */
$.__bodymovin.bm_effectsHelper = (function () {
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_keyframeHelper = $.__bodymovin.bm_keyframeHelper;
    var annotationsManager = $.__bodymovin.bm_annotationsManager;
    var ob = {};
    var effectTypes = {
        sliderControl: 0,
        angleControl: 1,
        colorControl: 2,
        pointControl: 3,
        checkboxControl: 4,
        group: 5,
        noValue: 6,
        dropDownControl: 7,
        customValue: 9,
        layerIndex: 10,
        maskIndex: 11,
        tint: 20,
        fill: 21,
        stroke: 22,
        tritone: 23,
        proLevels: 24,
        dropShadow: 25,
        radialWipe: 26,
        displacementMap: 27,
        matte3: 28,
        gaussianBlur2: 29,
        twirl: 30,
        mesh_warp: 31,
        ripple: 32,
        spherize: 33,
        freePin3: 34,
        geometry2: 35,
    };
    
    function getEffectType(name) {
        switch (name) {
        case 'ADBE Tint':
            return effectTypes.tint;
        case 'ADBE Fill':
            return effectTypes.fill;
        case 'ADBE Stroke':
            return effectTypes.stroke;
        case 'ADBE Tritone':
            return effectTypes.tritone;
        case 'ADBE Pro Levels2':
            return effectTypes.proLevels;
        case 'ADBE Drop Shadow':
            return effectTypes.dropShadow;
        case 'ADBE Radial Wipe':
            return effectTypes.radialWipe;
        case 'ADBE Displacement Map':
            return effectTypes.displacementMap;
        case 'ADBE Set Matte3':
            return effectTypes.matte3;
        case 'ADBE Gaussian Blur 2':
            return effectTypes.gaussianBlur2;
        case 'ADBE Twirl':
            return effectTypes.twirl;
        case 'ADBE MESH WARP':
            return effectTypes.mesh_warp;
        case 'ADBE Ripple':
            return effectTypes.ripple;
        case 'ADBE Spherize':
            return effectTypes.spherize;
        case 'ADBE FreePin3':
            return effectTypes.freePin3;
        case 'ADBE Geometry2':
            return effectTypes.geometry2;
        default:
            // bm_eventDispatcher.log(name)
            return effectTypes.group;
        }
    }

    function findEffectPropertyType(prop) {
        var propertyValueType = prop.propertyValueType;
                // bm_eventDispatcher.log(prop.name);
                // bm_eventDispatcher.log(prop.matchName);
        //customValue
            /*bm_eventDispatcher.log('prop.propertyValueType: ' + prop.propertyValueType);
            for (var s in PropertyValueType) {
                bm_eventDispatcher.log('Name: ' + s);
                bm_eventDispatcher.log('Value: ' + PropertyValueType[s]);
            }*/
        //Prop ertyValueType.NO_VALUE
        if (propertyValueType === PropertyValueType.NO_VALUE) {
            return effectTypes.noValue;
        } else if (propertyValueType === PropertyValueType.OneD) {
             if (!prop.isInterpolationTypeValid(KeyframeInterpolationType.LINEAR)){
                return effectTypes.dropDownControl;
             }
            return effectTypes.sliderControl;
        } else if (propertyValueType === PropertyValueType.COLOR) {
            return effectTypes.colorControl;
        } else if (propertyValueType === PropertyValueType.CUSTOM_VALUE) {
            return effectTypes.customValue;
        } else if (propertyValueType === PropertyValueType.LAYER_INDEX) {
            return effectTypes.layerIndex;
        } else if (propertyValueType === PropertyValueType.MASK_INDEX) {
            return effectTypes.maskIndex;
        } else {
            return effectTypes.pointControl;
        }
    }

    function setupBasicEffect(elem, effectType, matchName) {
        var ob = {};
        ob.ty = effectType;
        ob.nm = elem.name;
        // Apparently numProperties returns 1 less value than the one used on expressions.
        ob.np = elem.numProperties + 1;
        ob.mn = matchName;
        ob.ix = elem.propertyIndex;
        ob.en = elem.enabled === true ? 1 : 0;
        ob.ef = [];
        return ob;
    }
    
    function exportNoValueControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.noValue;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = 0;
        return ob;
    }
    
    function exportSliderControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.sliderControl;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportColorControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.colorControl;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportPointControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.pointControl;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportDropDownControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.dropDownControl;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportLayerIndexControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.layerIndex;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportMaskIndexControl(effect, frameRate, stretch) {
        var ob = {};
        ob.ty = effectTypes.layerIndex;
        ob.nm = effect.name;
        ob.mn = effect.matchName;
        ob.ix = effect.propertyIndex;
        ob.v = bm_keyframeHelper.exportKeyframes(effect, frameRate, stretch);
        return ob;
    }
    
    function exportCustomControl(effect, frameRate){
        var ob = {};
        return ob;
    }
    
    /*function iterateEffectProperties(effectElement) {
        var i, len = effectElement.numProperties;
        for (i = 0; i < len; i += 1) {
            var prop = effectElement.property(i + 1);
            var propsArray = [], propValue;
            for (var s in prop) {
                propsArray.push({key:s,value:''});
            }
             bm_eventDispatcher.log(propsArray);
            bm_eventDispatcher.log('prop.name: ' + prop.name);
            bm_eventDispatcher.log('prop.matchName: ' + prop.matchName);
            bm_eventDispatcher.log('prop.propertyType: ' + prop.propertyType);
            bm_eventDispatcher.log('prop.propertyValueType: ' + prop.propertyValueType);
            bm_eventDispatcher.log('prop.hasMax: ' + prop.hasMax);
            bm_eventDispatcher.log('prop.hasMin: ' + prop.hasMin);
            if(prop.hasMax){
                bm_eventDispatcher.log('prop.maxValue: ' + prop.maxValue);
            }
            if(prop.hasMin){
                bm_eventDispatcher.log('prop.minValue: ' + prop.minValue);
            }
            bm_eventDispatcher.log('----------------');
        }
    }*/

    function setChannelDropdownToValue(elem, value) {
        var firstProp = elem.property(1);
        if (firstProp.value !== value) {
            firstProp.setValue(value);
        }
    }

    function refreshChannelDropdownValue(elem) {
        elem.selected = true;
        var firstProp = elem.property(1);
        var value_2 = firstProp.value;
        firstProp.setValue(value_2);
    }

    function setChannelDropdownToFirst(elem) {
        setChannelDropdownToValue(elem, 1);
    }

    function handleProLevels(elem) {
        elem.selected = true;
        setChannelDropdownToFirst(elem);
    }

    function handleEasyLevels(elem, ob, frameRate, stretch) {
        elem.selected = true;
        ob.ty = effectTypes.proLevels;
        setChannelDropdownToValue(elem, 1);
        // Channel dropdown
        ob.ef.push({
            "ty": 7,
            "nm": "Channel:",
            "mn": "ADBE Pro Levels2-0001",
            "ix": 1,
            "v": {
                "a": 0,
                "k": 1,
                "ix": 1
            }
        })
        // empty object
        ob.ef.push({})
        // RGB
        ob.ef.push({
            "ty": 6,
            "nm": "RGB",
            "mn": "ADBE Pro Levels2-0003",
            "ix": 3,
            "v": 0
        })
        var prop = elem.property(3);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Input Black",
                "mn": "ADBE Pro Levels2-0004",
                "ix": 4,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(4);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Input White",
                "mn": "ADBE Pro Levels2-0005",
                "ix": 5,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(5);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Gamma",
                "mn": "ADBE Pro Levels2-0006",
                "ix": 6,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(6);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Output Black",
                "mn": "ADBE Pro Levels2-0007",
                "ix": 7,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(7);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Output White",
                "mn": "ADBE Pro Levels2-0008",
                "ix": 8,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        ob.ef.push(
            {
                "ty": 6,
                "nm": "RGB",
                "mn": "ADBE Pro Levels2-0009",
                "ix": 9,
                "v": 0
            }
        )
        // RED
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Red",
                "mn": "ADBE Pro Levels2-0010",
                "ix": 10,
                "v": 0
            }
        )
        setChannelDropdownToValue(elem, 2);
        prop = elem.property(3);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Red Input Black",
                "mn": "ADBE Pro Levels2-0011",
                "ix": 11,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(4);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Red Input White",
                "mn": "ADBE Pro Levels2-0012",
                "ix": 12,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(5);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Red Gamma",
                "mn": "ADBE Pro Levels2-0013",
                "ix": 13,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(6);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Red Output Black",
                "mn": "ADBE Pro Levels2-0014",
                "ix": 14,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(7);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Red Output White",
                "mn": "ADBE Pro Levels2-0015",
                "ix": 15,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Red",
                "mn": "ADBE Pro Levels2-0016",
                "ix": 16,
                "v": 0
            }
        )
        // GREEN
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Green",
                "mn": "ADBE Pro Levels2-0017",
                "ix": 17,
                "v": 0
            }
        )
        setChannelDropdownToValue(elem, 3);
        prop = elem.property(3);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Green Input Black",
                "mn": "ADBE Pro Levels2-0018",
                "ix": 18,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(4);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Green Input White",
                "mn": "ADBE Pro Levels2-0019",
                "ix": 19,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(5);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Green Gamma",
                "mn": "ADBE Pro Levels2-0020",
                "ix": 20,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(6);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Green Output Black",
                "mn": "ADBE Pro Levels2-0021",
                "ix": 21,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(7);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Green Output White",
                "mn": "ADBE Pro Levels2-0022",
                "ix": 22,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Green",
                "mn": "ADBE Pro Levels2-0023",
                "ix": 23,
                "v": 0
            }
        )
        // BLUE
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Blue",
                "mn": "ADBE Pro Levels2-0024",
                "ix": 24,
                "v": 0
            }
        )
        setChannelDropdownToValue(elem, 4);
        prop = elem.property(3);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Blue Input Black",
                "mn": "ADBE Pro Levels2-0025",
                "ix": 25,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(4);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Blue Input White",
                "mn": "ADBE Pro Levels2-0026",
                "ix": 26,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(5);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Blue Gamma",
                "mn": "ADBE Pro Levels2-0027",
                "ix": 27,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(6);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Blue Output Black",
                "mn": "ADBE Pro Levels2-0028",
                "ix": 28,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(7);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Blue Output White",
                "mn": "ADBE Pro Levels2-0029",
                "ix": 29,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Blue",
                "mn": "ADBE Pro Levels2-0030",
                "ix": 30,
                "v": 0
            }
        )
        // ALPHA
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Alpha",
                "mn": "ADBE Pro Levels2-0031",
                "ix": 31,
                "v": 0
            }
        )
        setChannelDropdownToValue(elem, 5);
        prop = elem.property(3);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Alpha Input Black",
                "mn": "ADBE Pro Levels2-0032",
                "ix": 32,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(4);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Alpha Input White",
                "mn": "ADBE Pro Levels2-0033",
                "ix": 33,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(5);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Alpha Gamma",
                "mn": "ADBE Pro Levels2-0034",
                "ix": 34,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(6);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Alpha Output Black",
                "mn": "ADBE Pro Levels2-0035",
                "ix": 35,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(7);
        ob.ef.push(
            {
                "ty": 0,
                "nm": "Alpha Output White",
                "mn": "ADBE Pro Levels2-0036",
                "ix": 36,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        ob.ef.push(
            {
                "ty": 6,
                "nm": "Alpha",
                "mn": "ADBE Pro Levels2-0037",
                "ix": 37,
                "v": 0
            }
        )
        // CLIPS
        prop = elem.property(8);
        ob.ef.push(
            {
                "ty": 7,
                "nm": "Clip To Output Black",
                "mn": "ADBE Pro Levels2-0038",
                "ix": 38,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        prop = elem.property(9);
        ob.ef.push(
            {
                "ty": 7,
                "nm": "Clip To Output White",
                "mn": "ADBE Pro Levels2-0039",
                "ix": 39,
                "v": bm_keyframeHelper.exportKeyframes(prop, frameRate, stretch)
            }
        )
        return ob;
    }

    function handleHueSaturation(elem) {
        refreshChannelDropdownValue(elem);
    }
    
    function exportCustomEffect(elem,effectType, frameRate, stretch) {
        if(effectType === effectTypes.proLevels ) {
            handleProLevels(elem);
        }
        // using matchName here instead of effectType, 
        // because this effect is still exported as an unknown effect (group)
        if (elem.matchName === 'ADBE Easy Levels2') {
            // Convert to ProLevels.
            var ob = setupBasicEffect(elem, effectType, 'ADBE Pro Levels2');
            return handleEasyLevels(elem, ob, frameRate, stretch);
        }

        var ob = setupBasicEffect(elem, effectType, elem.matchName);
        if (elem.matchName === 'ADBE HUE SATURATION') {
            handleHueSaturation(elem);
        }
        var i, len = elem.numProperties, prop;
        for (i = 0; i < len; i += 1) {
            prop = elem.property(i + 1);
            if (annotationsManager.isAnnotation(prop.matchName)) {
                // skip
            } else if(prop.matchName === "ADBE FreePin3 ARAP Group" 
                || prop.matchName === "ADBE FreePin3 Mesh Group" 
                || prop.matchName === "ADBE FreePin3 Mesh Atom" 
                || prop.matchName === "ADBE FreePin3 PosPins" 
                || prop.matchName === "ADBE FreePin3 StarchPins" 
                || prop.matchName === "ADBE FreePin3 HghtPins" 
                || prop.matchName === "ADBE FreePin3 PosPin Atom") {
                ob.ef.push(exportCustomEffect(prop, '', frameRate, stretch));
            } else if(prop.propertyType === PropertyType.PROPERTY){
                var type = findEffectPropertyType(prop);
                //effectTypes.noValue;
                if (type === effectTypes.noValue) {
                    ob.ef.push(exportNoValueControl(prop, frameRate, stretch));
                } else if(type === effectTypes.sliderControl) {
                    ob.ef.push(exportSliderControl(prop, frameRate, stretch));
                } else if(type === effectTypes.colorControl) {
                    ob.ef.push(exportColorControl(prop, frameRate, stretch));
                } else if(type === effectTypes.dropDownControl) {
                    ob.ef.push(exportDropDownControl(prop, frameRate, stretch));
                } else if(type === effectTypes.dropDownControl) {
                    ob.ef.push(exportDropDownControl(prop, frameRate, stretch));
                } else if(type === effectTypes.customValue) {
                    ob.ef.push(exportCustomControl(prop, frameRate, stretch));
                }  else if(type === effectTypes.layerIndex) {
                    ob.ef.push(exportLayerIndexControl(prop, frameRate, stretch));
                }  else if(type === effectTypes.maskIndex) {
                    ob.ef.push(exportMaskIndexControl(prop, frameRate, stretch));
                } else {
                    ob.ef.push(exportPointControl(prop, frameRate, stretch));
                }
            } else {
                if(prop.name !== 'Compositing Options' && prop.matchName !== 'ADBE Effect Built In Params' && prop.propertyType !== PropertyType.NAMED_GROUP) {
                    ob.ef.push(exportCustomEffect(prop, '', frameRate, stretch));
                } else {
                    // bm_eventDispatcher.log(prop.matchName)
                }
            }
        }
        return ob;
    }
    
    function exportEffects(layerInfo, layerData, frameRate, includeHiddenData) {
        //bm_eventDispatcher.log('PropertyType.PROPERTY' + PropertyType.PROPERTY);
        //bm_eventDispatcher.log('PropertyType.INDEXED_GROUP' + PropertyType.INDEXED_GROUP);
        //bm_eventDispatcher.log('PropertyType.NAMED_GROUP' + PropertyType.NAMED_GROUP);
        var stretch = layerData.sr;
        if (!(layerInfo.effect && layerInfo.effect.numProperties > 0)) {
            return;
        }
        var effects = layerInfo.effect;
       
        var i, len = effects.numProperties, effectElement;
        var effectsArray = [];
        var annotationsArray = [];
        for (i = 0; i < len; i += 1) {
            effectElement = effects(i + 1);
            if (effectElement.enabled || includeHiddenData) {
                // if it is an annotaton, do not save
                if (annotationsManager.isAnnotation(effectElement.matchName)) {
                    continue;
                }
                var effectType = getEffectType(effectElement.matchName);
                /*
                //If the effect is not a Slider Control and is not enabled, it won't be exported.
                if(effectType !== effectTypes.group && !effectElement.enabled){
                    continue;
                }
                */
                /* Keep this code commented in case i gets used in the future.
                var annotation = annotationsManager.findAnnotationEffectByMatchName(effectElement.matchName)
                if (annotation) {
                    var annotationData = exportCustomEffect(effectElement ,effectType, frameRate, stretch);
                    annotationData.id = annotation.id;
                    annotationsArray.push(annotationData)
                } else {
                    effectsArray.push(exportCustomEffect(effectElement ,effectType, frameRate, stretch));
                }*/
                effectsArray.push(exportCustomEffect(effectElement ,effectType, frameRate, stretch));
            }
        }
        if (effectsArray.length) {
            layerData.ef = effectsArray;
        }
        if (annotationsArray.length) {
            layerData.annots = annotationsArray;
        }
    }
    
    ob.exportEffects = exportEffects;
    
    return ob;
}());
