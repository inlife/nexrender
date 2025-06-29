/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $*/

$.__bodymovin.getShapeType = (function () {

    var shapeItemTypes = $.__bodymovin.shapeTypes;
    
    function getShapeType(matchName) {
        switch (matchName) {
        case 'ADBE Vector Shape - Group':
            return shapeItemTypes.shape;
        case 'ADBE Vector Shape - Star':
            return shapeItemTypes.star;
        case 'ADBE Vector Shape - Rect':
            return shapeItemTypes.rect;
        case 'ADBE Vector Shape - Ellipse':
            return shapeItemTypes.ellipse;
        case 'ADBE Vector Graphic - Fill':
            return shapeItemTypes.fill;
        case 'ADBE Vector Graphic - Stroke':
            return shapeItemTypes.stroke;
        case 'ADBE Vector Graphic - Merge':
        case 'ADBE Vector Filter - Merge':
            return shapeItemTypes.merge;
        case 'ADBE Vector Graphic - Trim':
        case 'ADBE Vector Filter - Trim':
            return shapeItemTypes.trim;
        case 'ADBE Vector Graphic - Twist':
        case 'ADBE Vector Filter - Twist':
            return shapeItemTypes.twist;
        case 'ADBE Vector Filter - RC':
            return shapeItemTypes.roundedCorners;
        case 'ADBE Vector Group':
            return shapeItemTypes.group;
        case 'ADBE Vector Graphic - G-Fill':
            return shapeItemTypes.gfill;
        case 'ADBE Vector Graphic - G-Stroke':
            return shapeItemTypes.gStroke;
        case 'ADBE Vector Filter - Repeater':
            return shapeItemTypes.repeater;
        case 'ADBE Vector Filter - Offset':
            return shapeItemTypes.offsetPath;
        case 'ADBE Vector Filter - PB':
            return shapeItemTypes.puckerAndBloat;
        case 'ADBE Vector Filter - Zigzag':
            return shapeItemTypes.zigZag;
        default:
            return '';
        }
    }

    return getShapeType;
}());