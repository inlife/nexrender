/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeReportHelper = (function () {
    
    var ob;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var getShapeType = $.__bodymovin.getShapeType;
    var shapeUnhandled = $.__bodymovin.bm_shapeUnhandledReport;
    var shapeGroup = $.__bodymovin.bm_shapeGroupReport;
    var shapeRect = $.__bodymovin.bm_shapeRectReport;
    var shapeEllipse = $.__bodymovin.bm_shapeEllipseReport;
    var shapeStar = $.__bodymovin.bm_shapeStarReport;
    var shapeShape = $.__bodymovin.bm_shapeShapeReport;
    var shapeStroke = $.__bodymovin.bm_shapeStrokeReport;
    var shapeFill = $.__bodymovin.bm_shapeFillReport;
    var shapeGradientFill = $.__bodymovin.bm_shapeGradientFillReport;
    var shapeGradientStroke = $.__bodymovin.bm_shapeGradientStrokeReport;
    var shapeMergePaths = $.__bodymovin.bm_shapeMergePathsReport;
    var shapeRepeater = $.__bodymovin.bm_shapeRepeaterReport;
    var roundCorners = $.__bodymovin.bm_shapeRoundCornersReport;
    var puckerAndBloat = $.__bodymovin.bm_shapePuckerAndBloatReport;
    var trimPaths = $.__bodymovin.bm_shapeTrimPathsReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function buildGroup(element) {
        return shapeGroup(element)
    }

    function buildRect(element) {
        return shapeRect(element)
    }

    function buildEllipse(element) {
        return shapeEllipse(element)
    }

    function buildStar(element) {
        return shapeStar(element)
    }

    function buildShape(element) {
        return shapeShape(element)
    }

    function buildFill(element) {
        return shapeFill(element)
    }

    function buildStroke(element) {
        return shapeStroke(element)
    }
    
    function buildGradientFill(element) {
        return shapeGradientFill(element)
    }

    function buildGradientStroke(element) {
        return shapeGradientStroke(element)
    }

    function buildMergePaths(element) {
        return shapeMergePaths(element)
    }

    function buildRepeater(element) {
        return shapeRepeater(element)
    }

    function buildRoundCorners(element) {
        return roundCorners(element)
    }

    function buildPuckerAndBloat(element) {
        return puckerAndBloat(element)
    }

    function buildTrimPaths(element) {
        return trimPaths(element)
    }

    function buildUnhandled(element) {
        return shapeUnhandled(element)
    }

    var builders = {}
    builders[shapeTypes.shape] = buildShape
    builders[shapeTypes.rect] = buildRect
    builders[shapeTypes.ellipse] = buildEllipse
    builders[shapeTypes.stroke] = buildStroke
    builders[shapeTypes.fill] = buildFill
    builders[shapeTypes.group] = buildGroup
    builders[shapeTypes.repeater] = buildRepeater
    builders[shapeTypes.star] = buildStar
    builders[shapeTypes.gfill] = buildGradientFill
    builders[shapeTypes.gStroke] = buildGradientStroke
    builders[shapeTypes.merge] = buildMergePaths
    builders[shapeTypes.roundedCorners] = buildRoundCorners
    builders[shapeTypes.puckerAndBloat] = buildPuckerAndBloat
    builders[shapeTypes.trim] = buildTrimPaths

    function processShape(element) {
        var shapeType = getShapeType(element.matchName);
        if (builders[shapeType]) {
            return builders[shapeType](element);
        } else {
            return buildUnhandled(element)
        }
    }


    ob = {
        processShape: processShape,
    };
    
    return ob;
}());