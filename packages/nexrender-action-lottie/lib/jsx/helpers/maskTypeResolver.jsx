/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, MaskMode */

$.__bodymovin.getMaskType = (function () {

    var maskTypes = $.__bodymovin.maskTypes;
    
    return function (mode) {
        switch (mode) {
        case MaskMode.NONE:
            return maskTypes.NONE;
        case MaskMode.ADD:
            return maskTypes.ADD;
        case MaskMode.SUBTRACT:
            return maskTypes.SUBTRACT;
        case MaskMode.INTERSECT:
            return maskTypes.INTERSECT;
        case MaskMode.LIGHTEN:
            return maskTypes.LIGHTEN;
        case MaskMode.DARKEN:
            return maskTypes.DARKEN;
        case MaskMode.DIFFERENCE:
            return maskTypes.DIFFERENCE;
        default:
            return undefined;
        }
    }
}());