/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $ */
$.__bodymovin.bm_essentialPropertiesHelper = (function () {
  'use strict';
  var ob = {};
  var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
  var bm_generalUtils = $.__bodymovin.bm_generalUtils;
  var settingsHelper = $.__bodymovin.bm_settingsHelper;
  var keyframeHelper;
  var textHelper;

  var rootProperties = [];
  var exportedProps = {};

  var propType = {
    Color: 1,
    Point: 2,
    Scale: 3,
    Float: 4,
    Asset: 50,
    Undefined: 99,
  }

  var matchType = {
    'ADBE Vector Fill Color': propType.Color,
    'ADBE Vector Stroke Color': propType.Color,
    'ADBE Text Stroke Color': propType.Color,
    'ADBE Text Fill Color': propType.Color,
    'ADBE Position': propType.Point,
    'ADBE Vector Repeater Position': propType.Point,
    'ADBE Vector Repeater Anchor': propType.Point,
    'ADBE Anchor Point': propType.Point,
    'ADBE Vector Grad Start Pt': propType.Point,
    'ADBE Vector Grad End Pt': propType.Point,
    'ADBE Vector Rect Position': propType.Point,
    'ADBE Vector Ellipse Position': propType.Point,
    'ADBE Vector Star Position': propType.Point,
    'ADBE Text Anchor Point 3D': propType.Point,
    'ADBE Text Position 3D': propType.Point,
    'ADBE Vector Position': propType.Point,
    'ADBE Vector Anchor': propType.Point,
    'ADBE Opacity': propType.Float,
    'ADBE Vector Fill Opacity': propType.Float,
    'ADBE Vector Stroke Opacity': propType.Float,
    'ADBE Vector Stroke Width': propType.Float,
    'ADBE Position_0': propType.Float,
    'ADBE Position_1': propType.Float,
    'ADBE Position_2': propType.Float,
    'ADBE Rotate X': propType.Float,
    'ADBE Rotate Y': propType.Float,
    'ADBE Rotate Z': propType.Float,
    'ADBE Vector Rect Roundness': propType.Float,
    'ADBE Vector Star Points': propType.Float,
    'ADBE Vector Star Rotation': propType.Float,
    'ADBE Vector Star Inner Radius': propType.Float,
    'ADBE Vector Star Inner Roundess': propType.Float,
    'ADBE Vector Star Outer Radius': propType.Float,
    'ADBE Vector Star Outer Roundess': propType.Float,
    'ADBE Vector Offset Amount': propType.Float,
    'ADBE Vector Offset Miter Limit': propType.Float,
    'ADBE Vector PuckerBloat Amount': propType.Float,
    'ADBE Vector Repeater Copies': propType.Float,
    'ADBE Vector Repeater Offset': propType.Float,
    'ADBE Vector Repeater Rotation': propType.Float,
    'ADBE Vector Repeater Opacity 1': propType.Float,
    'ADBE Vector Repeater Opacity 2': propType.Float,
    'ADBE Vector RoundCorner Radius': propType.Float,
    'ADBE Vector Trim Start': propType.Float,
    'ADBE Vector Trim End': propType.Float,
    'ADBE Vector Trim Offset': propType.Float,
    'ADBE Vector Twist Angle': propType.Float,
    'ADBE Vector Twist Center': propType.Float,
    'ADBE Vector Zigzag Size': propType.Float,
    'ADBE Vector Zigzag Detail': propType.Float,
    'ADBE Text Percent Start': propType.Float,
    'ADBE Text Percent End': propType.Float,
    'ADBE Text Index Start': propType.Float,
    'ADBE Text Index End': propType.Float,
    'ADBE Text Levels Max Ease': propType.Float,
    'ADBE Text Levels Min Ease': propType.Float,
    'ADBE Text Selector Max Amount': propType.Float,
    'ADBE Text Skew': propType.Float,
    'ADBE Text Skew Axis': propType.Float,
    'ADBE Text Rotation': propType.Float,
    'ADBE Text Opacity': propType.Float,
    'ADBE Text Fill Hue': propType.Float,
    'ADBE Text Fill Saturation': propType.Float,
    'ADBE Text Fill Brightness': propType.Float,
    'ADBE Text Stroke Opacity': propType.Float,
    'ADBE Text Stroke Hue': propType.Float,
    'ADBE Text Stroke Saturation': propType.Float,
    'ADBE Text Stroke Brightness': propType.Float,
    'ADBE Text Stroke Width': propType.Float,
    'ADBE Text Tracking Amount': propType.Float,
    'ADBE Vector Rotation': propType.Float,
    'ADBE Vector Group Opacity': propType.Float,
    'ADBE Vector Skew': propType.Float,
    'ADBE Vector Skew Axis': propType.Float,
    'ADBE Scale': propType.Scale,
    'ADBE Vector Rect Size': propType.Scale,
    'ADBE Vector Ellipse Size': propType.Scale,
    'ADBE Vector Repeater Scale': propType.Scale,
    'ADBE Text Scale 3D': propType.Scale,
    'ADBE Vector Scale': propType.Scale,
  }

  function clearTextProperties(propertyName, data) {
    var textDict = {
      'font': 'f',
      'f': 'f',
      'size': 's',
      's': 's',
      'color': 'fc',
      'fc': 'fc',
      'justification': 'j',
      'justify': 'j',
      'j': 'j',
      'text': 't',
      't': 't',
      'all caps': 'ca',
      'allcaps': 'ca',
      'ca': 'ca',
    }
    if (propertyName.indexOf('|') !== -1) {
      var properties = propertyName.split('|');
      var keyframes = data.k;
      var persistingProps = {};
      var i;
      for (i  = 0; i < properties.length; i += 1) {
        var sanitizedProp = bm_generalUtils.trimText(properties[i]);
        if (textDict.hasOwnProperty(sanitizedProp)) {
          persistingProps[textDict[sanitizedProp]] = true;
        }
      }
      for (i = 0; i < keyframes.length; i += 1) {
        var keyframe = keyframes[i];
        var textDocumentProp = keyframe.s;
        for (var s in textDocumentProp) {
          if (textDocumentProp.hasOwnProperty(s) && !persistingProps.hasOwnProperty(s)) {
            delete textDocumentProp[s];
          }
        }
      }
    }
  }
  
  // Searches for all essential properties in a composition
  function addCompProperties(composition, frameRate) {
    bm_eventDispatcher.log('addCompProperties');

    function iterateProperty(parent, frameRate, properties) {
      var totalProperties = parent.numProperties;
        for (var i = 0; i < totalProperties; i += 1) {
          var property = parent.property(i + 1);
          var propData = {
            property: property,
            id: property.name,
          }
          // TODO: check if there is a better way to identify type
          if (property.matchName === 'ADBE Layer Source Alternate') {
            // It's a layer source
            propData.type = 'source';
            propData.layer = property.essentialPropertySource;
          } else if (property.matchName === 'ADBE Layer Overrides Group') {
            propData.type = 'group';
            propData.properties = [];
            iterateProperty(property, frameRate, propData.properties);
          } else if (property.matchName === 'ADBE Text Document' 
                || property.matchName === 'ADBE EP Text Document') {
            propData.type = 'property';
            propData.val = {};
            var textDocumentSource = property.essentialPropertySource
            var textLayer = textDocumentSource.parentProperty.parentProperty
            textHelper.exportTextDocumentData(textLayer, propData.val, frameRate);
            clearTextProperties(property.name, propData.val)
          } else {
            // It's a property
            // bm_generalUtils.iterateProperty(property)
            // bm_generalUtils.iterateOwnProperties(property)
            propData.type = 'property';
            if (propData.id.substr(0, 1) === '#') {
              propData.val = keyframeHelper.exportKeyframes(property.essentialPropertySource, frameRate, 1);
            } else {
              propData.val = keyframeHelper.exportKeyframes(property, frameRate, 1);
            }
          }
          properties.push(propData);
        }
    }
    try {
      if (!composition.essentialProperty) {
        return;
      }
      if (!settingsHelper.shouldExportEssentialProperties()) {
        return;
      }
      
      if (!keyframeHelper) {
        keyframeHelper = $.__bodymovin.bm_keyframeHelper;
      }
      if (!textHelper) {
        textHelper = $.__bodymovin.bm_textHelper;
      }
      var essentialProperty = composition.essentialProperty;
      iterateProperty(essentialProperty, frameRate, rootProperties);

    } catch (error) {
      if (error) {
        bm_eventDispatcher.log('ERROR:essentialPropertiesHelper:addCompProperties');
        bm_eventDispatcher.log(error.message);
        bm_eventDispatcher.log(error.line);
        bm_eventDispatcher.log(error.fileName);
      }
      bm_eventDispatcher.log($.stack);
    }
  }

  // Searches if a property is part of the essential properties
  function searchProperty(property) {

    function searchPropertyInList(property, list) {
      var i, len = list.length;
      for(i = 0; i < len; i += 1) {
        if (list[i].type === 'property' ) {
          // Not using strict equality because sources don't match
          // eslint-disable-next-line eqeqeq
          if (list[i].property.essentialPropertySource == property) {
            return list[i].val;
          }
        } else if (list[i].type === 'group' ) {
          var prop = searchPropertyInList(property, list[i].properties);
          if (prop) {
            return prop;
          }
        }
      }
      return null;
    }
  
    return searchPropertyInList(property, rootProperties, '');
  }

  // Searches if a property is part of the essential properties
  function searchPropertyId(property) {

    function searchPropertyInList(property, list, groupId) {
      var i, len = list.length;
      for(i = 0; i < len; i += 1) {
        if (list[i].type === 'property' ) {
          // Not using strict equality because sources don't match
          // eslint-disable-next-line eqeqeq
          if (list[i].property.essentialPropertySource == property) {
            if (groupId) {
              return groupId;
            } else {
              if (matchType[property.matchName]) {
                list[i].prop.t = matchType[property.matchName];
              } else {
                list[i].prop.t = propType.Undefined;
              }
            }
            return list[i].id;
          }
        } else if (list[i].type === 'group' ) {
          var propId = searchPropertyInList(property, list[i].properties, list[i].id);
          if (propId) {
            if (matchType[property.matchName]) {
              list[i].prop.t = matchType[property.matchName];
            } else {
              list[i].prop.t = propType.Undefined;
            }
            return propId;
          }
        }
      }
      return null;
    }
  
    return searchPropertyInList(property, rootProperties, '');
  }

  // Traverses and returns a dictionary with the essential properties
  function exportProperties() {
    if (!settingsHelper.shouldExportEssentialPropertiesAsSlots()) {
      return undefined;
    }
    exportedProps = {};
    var count = 0;
    var prop;
    for (var i = 0; i < rootProperties.length; i += 1) {
      if (rootProperties[i].type === 'property') {
        prop = {
          p: rootProperties[i].val,
        }
        rootProperties[i].prop = prop;
        exportedProps[rootProperties[i].id] = prop;
        count += 1;
      } else if (rootProperties[i].type === 'source') {
        // adding counter but skipping the prop creating since it will be set by the source itself
        count += 1;
      } else if (rootProperties[i].type === 'group' && rootProperties[i].properties.length > 0) {
        prop = {
          p: rootProperties[i].properties[0].val,
        }
        rootProperties[i].prop = prop;
        exportedProps[rootProperties[i].id] = prop;
        count += 1;
      }
    }
    if (count === 0) {
      return undefined;
    }
    return exportedProps;
  }

  // Searches if an asset is part of the essential properties
  function searchAsset(sourceData, savingData) {
    for (var i = 0; i < rootProperties.length; i += 1) {
      if (rootProperties[i].type === 'source' && rootProperties[i].layer.source === sourceData.source) {
        var prop = {
          t: propType.Asset,
          p: bm_generalUtils.cloneObject(savingData, true),
        }
        // Removing the fileId since it's an internal property
        prop.p.fileId = undefined;
        exportedProps[rootProperties[i].id] = prop;
        return rootProperties[i].id;
      }
    }
    return '';
  }

  function reset() {
    rootProperties = [];
    exportedProps = {};
  }
  
  ob.addCompProperties = addCompProperties;
  ob.exportProperties = exportProperties;
  ob.searchProperty = searchProperty;
  ob.searchPropertyId = searchPropertyId;
  ob.searchAsset = searchAsset;
  ob.reset = reset;
  
  return ob;
}());