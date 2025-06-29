/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/


// $.__bodymovin = $.__bodymovin || {esprima:{}}
// Recreating the __bodymovin object every time to avoid usage of previous instance
$.__bodymovin = {esprima:{}};


//  Does not work with `new funcA.bind(thisArg, args)`
if (!Function.prototype.bm_bind) (function(){
  var slice = Array.prototype.slice;
  Function.prototype.bm_bind = function() {
    var thatFunc = this, thatArg = arguments[0];
    var args = slice.call(arguments, 1);
    if (typeof thatFunc !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bm_bind - ' +
             'what is trying to be bound is not callable');
    }
    return function(){
      var funcArgs = args.concat(slice.call(arguments))
      return thatFunc.apply(thatArg, funcArgs);
    };
  };
})();

(function() {
  var files = [
  'JSON.jsx',
  'eventManager.jsx',
  'main.jsx',
  'enums/layerTypes.jsx',
  'enums/layerStyleTypes.jsx',
  'enums/shapeTypes.jsx',
  'enums/maskTypes.jsx',
  'helpers/layerResolver.jsx',
  'helpers/assetsStorage.jsx',
  'helpers/layerStyleResolver.jsx',
  'helpers/shapeTypeResolver.jsx',
  'helpers/maskTypeResolver.jsx',
  'helpers/settingsHelper.jsx',
  'helpers/renderHelper.jsx',
  'helpers/versionHelper.jsx',
  'helpers/renderQueueHelper.jsx',
  'utils/textCompHelper.jsx',
  'utils/generalUtils.jsx',
  'reports/rendererTypes.jsx',
  'reports/builderTypes.jsx',
  'reports/messageTypes.jsx',
  'reports/effectsMessageTypes.jsx',
  'reports/reportMessageFactory.jsx',
  'reports/reportEffectMessageFactory.jsx',
  'reports/reportAnimatorSelectorMessageFactory.jsx',
  'reports/reportAnimatorMessageFactory.jsx',
  'reports/messageClassReport.jsx',
  'reports/propertyReport.jsx',
  'reports/positionReport.jsx',
  'reports/rotationReport.jsx',
  'reports/masks/maskReport.jsx',
  'reports/effectsReport.jsx',
  'reports/masksReport.jsx',
  'reports/transformReport.jsx',
  'reports/layerStyles/strokeStyle.jsx',
  'reports/layerStyles/dropShadowStyle.jsx',
  'reports/layerStyles/innerShadowStyle.jsx',
  'reports/layerStyles/outerGlowStyle.jsx',
  'reports/layerStyles/innerGlowStyle.jsx',
  'reports/layerStyles/bevelEmbossStyle.jsx',
  'reports/layerStyles/satinStyle.jsx',
  'reports/layerStyles/colorOverlayStyle.jsx',
  'reports/layerStyles/gradientOverlayStyle.jsx',
  'reports/layerStylesReport.jsx',
  'reports/layerReport.jsx',
  'reports/layers/shapes/shapeGroupReport.jsx',
  'reports/layers/shapes/shapeRectReport.jsx',
  'reports/layers/shapes/shapeEllipseReport.jsx',
  'reports/layers/shapes/shapeStarReport.jsx',
  'reports/layers/shapes/shapeShapeReport.jsx',
  'reports/layers/shapes/shapeFillReport.jsx',
  'reports/layers/shapes/shapeStrokeReport.jsx',
  'reports/layers/shapes/shapeGradientFillReport.jsx',
  'reports/layers/shapes/shapeGradientStrokeReport.jsx',
  'reports/layers/shapes/shapeMergePathsReport.jsx',
  'reports/layers/shapes/shapeRoundCornersReport.jsx',
  'reports/layers/shapes/shapePuckerAndBloatReport.jsx',
  'reports/layers/shapes/shapeTrimPathsReport.jsx',
  'reports/layers/shapes/shapeRepeaterReport.jsx',
  'reports/layers/shapes/shapeUnhandledReport.jsx',
  'reports/layers/shapes/shapeReportHelper.jsx',
  'reports/layers/shapes/shapeCollectionReport.jsx',
  'reports/layers/texts/textAnimatorSelectorReport.jsx',
  'reports/layers/texts/textAnimatorsReport.jsx',
  'reports/layers/imageLayerReport.jsx',
  'reports/layers/imageSequenceLayerReport.jsx',
  'reports/layers/cameraLayerReport.jsx',
  'reports/layers/audioLayerReport.jsx',
  'reports/layers/nullLayerReport.jsx',
  'reports/layers/solidLayerReport.jsx',
  'reports/layers/adjustmentLayerReport.jsx',
  'reports/layers/lightLayerReport.jsx',
  'reports/layers/textLayerReport.jsx',
  'reports/layers/unhandledLayerReport.jsx',
  'reports/layers/failedLayerReport.jsx',
  'reports/layers/compositionLayerReport.jsx',
  'reports/layers/shapeLayerReport.jsx',
  'reports/layerReportHelper.jsx',
  'reports/layerCollectionReport.jsx',
  'reports/animationReport.jsx',
  'reports/reportsManager.jsx',
  'downloadManager.jsx',
  'utils/expressions/keyframeBakerHelper.jsx',
  'utils/expressions/reservedPropertiesHelper.jsx',
  'utils/expressions/valueAssignmentHelper.jsx',
  'utils/expressions/variableDeclarationHelper.jsx',
  'utils/expressionHelper.jsx',
  'helpers/fileManager.jsx',
  'helpers/presetHelper.jsx',
  'exporters/exporterHelpers.jsx',
  'exporters/bannerExporter.jsx',
  'exporters/standardExporter.jsx',
  'exporters/standaloneExporter.jsx',
  'exporters/demoExporter.jsx',
  'exporters/avdExporter.jsx',
  'exporters/smilExporter.jsx',
  'exporters/riveExporter.jsx',
  'importers/lottieImporter.jsx',
  'esprima.jsx',
  'annotationsManager.jsx',
  'escodegen.jsx',
  'utils/bez.jsx',
  'utils/essentialPropertiesHelper.jsx',
  'utils/keyframeHelper.jsx',
  'utils/transformHelper.jsx',
  'utils/maskHelper.jsx',
  'utils/timeremapHelper.jsx',
  'utils/effectsHelper.jsx',
  'utils/layerStylesHelper.jsx',
  'utils/cameraHelper.jsx',
  'utils/audioHelper.jsx',
  'utils/dataHelper.jsx',
  'utils/XMPParser.jsx',
  'utils/ProjectParser.jsx',
  'utils/markerHelper.jsx',
  'utils/textAnimatorHelper.jsx',
  'utils/textHelper.jsx',
  'utils/imageSeqHelper.jsx',
  'helpers/boundingBox.jsx',
  'helpers/blendModes.jsx',
  'elements/layerElement.jsx',
  'projectManager.jsx',
  'compsManager.jsx',
  'dataManager.jsx',
  'renderManager.jsx',
  'utils/audioSourceHelper.jsx',
  'utils/dataSourceHelper.jsx',
  'utils/sourceHelper.jsx',
  'utils/shapeHelper.jsx',
  'utils/textShapeHelper.jsx',
  'utils/transformation-matrix.jsx'
  ]

  var _bmFile = new File($.fileName)
  _bmFile = _bmFile.parent
  for(var i = 0; i < files.length; i += 1) {
    try {
      var file = new File(_bmFile.fsName);
      file.changePath(files[i]);
      $.evalFile(file.fsName);
    } catch (error) {
      if ($.__bodymovin.bm_eventDispatcher) {
        $.__bodymovin.bm_eventDispatcher.log('EVAL ERROR')
      }
    }
  }

  // $.__bodymovin.bm_eventDispatcher.log("initialized!");
  $.__bodymovin.bm_eventDispatcher.alert("\ninitialized!");
}())

var globalVariables = ['bm_eventDispatcher','bm_generalUtils','bm_expressionHelper','esprima', 'escodegen'
, 'bez', 'PropertyFactory', 'bm_keyframeHelper', 'bm_transformHelper', 'bm_maskHelper', 'bm_timeremapHelper'
, 'bm_effectsHelper', 'bm_layerStylesHelper', 'bm_cameraHelper', 'bm_XMPHelper', 'bm_ProjectHelper', 'bm_markerHelper'
, 'bm_textHelper', 'bm_boundingBox', 'bm_layerElement', 'bm_projectManager', 'bm_compsManager', 'bm_dataManager'
, 'bm_renderManager', 'bm_downloadManager', 'bm_sourceHelper', 'bm_shapeHelper', 'bm_textAnimatorHelper'
, 'bm_textShapeHelper', 'bm_essentialPropertiesHelper', 'bm_settingsHelper']
var i, len = globalVariables.length;
for(i = 0; i < len; i += 1) {
	if(this[globalVariables[i]]) {
		this[globalVariables[i]] = null;
		delete this[globalVariables[i]];
		//$.__bodymovin.bm_eventDispatcher.log(globalVariables[i] + ' exists');
	} else {
		//$.__bodymovin.bm_eventDispatcher.log(globalVariables[i] + ' not exists');
	}
}
