/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerReportHelper = (function () {
    
    var ob;
    var getLayerType = $.__bodymovin.getLayerType;
    var layerTypes = $.__bodymovin.layerTypes;
    var solidLayerReport = $.__bodymovin.bm_solidLayerReport;
    var nullLayerReport = $.__bodymovin.bm_nullLayerReport;
    var imageLayerReport = $.__bodymovin.bm_imageLayerReport;
    var imageSequenceLayerReport = $.__bodymovin.bm_imageSequenceLayerReport;
    var cameraLayerReport = $.__bodymovin.bm_cameraLayerReport;
    var audioLayerReport = $.__bodymovin.bm_audioLayerReport;
    var compositionLayerReport = $.__bodymovin.bm_compositionLayerReport;
    var shapeLayerReport = $.__bodymovin.bm_shapeLayerReport;
    var textLayerReport = $.__bodymovin.bm_textLayerReport;
    var adjustmentLayerReport = $.__bodymovin.bm_adjustmentLayerReport;
    var lightLayerReport = $.__bodymovin.bm_lightLayerReport;
    var unhandledLayerReport = $.__bodymovin.bm_unhandledLayerReport;
    var failedLayerReport = $.__bodymovin.bm_failedLayerReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function createSolidReport(layer, onComplete, onFail) {
        return solidLayerReport(layer, onComplete, onFail);
    }

    function createNullReport(layer, onComplete, onFail) {
        return nullLayerReport(layer, onComplete, onFail);
    }

    function createImageReport(layer, onComplete, onFail) {
        return imageLayerReport(layer, onComplete, onFail);
    }

    function createImageSequenceReport(layer, onComplete, onFail) {
        return imageSequenceLayerReport(layer, onComplete, onFail);
    }

    function createCameraReport(layer, onComplete, onFail) {
        return cameraLayerReport(layer, onComplete, onFail);
    }

    function createAudioReport(layer, onComplete, onFail) {
        return audioLayerReport(layer, onComplete, onFail);
    }

    function createCompositionReport(layer, onComplete, onFail) {
        return compositionLayerReport(layer, onComplete, onFail);
    }

    function createShapeReport(layer, onComplete, onFail) {
        return shapeLayerReport(layer, onComplete, onFail);
    }

    function createTextLayerReport(layer, onComplete, onFail) {
        return textLayerReport(layer, onComplete, onFail);
    }

    function createAdjustmentLayerReport(layer, onComplete, onFail) {
        return adjustmentLayerReport(layer, onComplete, onFail);
    }

    function createLightLayerReport(layer, onComplete, onFail) {
    	return lightLayerReport(layer, onComplete, onFail);
    }

    function createUnhandledLayerReport(layer, onComplete, onFail) {
        return unhandledLayerReport(layer, onComplete, onFail);
    }

    function createFailedLayerReport(layer, onComplete, onFail) {
        return failedLayerReport(layer, onComplete, onFail);
    }

    function createLayer(layer, onComplete, onFail) {
        
        var layerType = getLayerType(layer);
        if (layerType === layerTypes.solid) {
            return createSolidReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.precomp) {
            return createCompositionReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.shape) {
            return createShapeReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.text) {
            return createTextLayerReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.nullLayer) {
            return createNullReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.still) {
            return createImageReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.imageSeq) {
            return createImageSequenceReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.camera) {
            return createCameraReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.audio) {
            return createAudioReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.adjustment) {
            return createAdjustmentLayerReport(layer, onComplete, onFail);
        } else if (layerType === layerTypes.light) {
            return createLightLayerReport(layer, onComplete, onFail);
        } else {
            return createUnhandledLayerReport(layer, onComplete, onFail);
        }
    }

    function createFailedLayer(layer, onComplete, onFail) {
        return createFailedLayerReport(layer, onComplete, onFail);
    }


    ob = {
        createLayer: createLayer,
        createFailedLayer: createFailedLayer,
    };
    
    return ob;
}());