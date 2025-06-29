/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeLayerReport = (function () {
    

    function ShapeLayer(layer) {
        this.layer = layer;
        this.layers = [];
        this.processTransform(layer.transform);
    }

    ShapeLayer.prototype.processTransform = function() {
        // this.transform = 
    }

    ShapeLayer.prototype.serialize = function() {
        return {
            transform: this.transform.serialize(),
        }
    }



    return function(layer) {
        return new ShapeLayer(layer);
    }
    
}());