/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeCollectionReport = (function () {
    
    var shapeReportHelper = $.__bodymovin.bm_shapeReportHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function ShapeCollection(shapes) {
        this.shapes = shapes;
        this.collection = [];
        this.process();
    }

    ShapeCollection.prototype.process = function() {
        var shapes = this.shapes;
        var collection = this.collection;
        var i, len = shapes.numProperties;
        var shape;
        for (i = 0; i < len; i += 1) {
            shape = shapes.property(i + 1);
            collection.push(shapeReportHelper.processShape(shape));
        }
    }

    ShapeCollection.prototype.serialize = function() {
        var shapes = [];
        for (var i = 0; i < this.collection.length; i += 1) {
            shapes.push(this.collection[i].serialize());
        }
        return {
            shapes: shapes,
        }
    }


    return function(shapes) {
    	return new ShapeCollection(shapes);
    }
    
}());