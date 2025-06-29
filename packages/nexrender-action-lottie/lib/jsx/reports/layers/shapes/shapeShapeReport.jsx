/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeShapeReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var shapeTypes = $.__bodymovin.shapeTypes;

    function Shape(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Shape, MessageClass);

    Shape.prototype.processProperties = function() {
        this.path = propertyReport(this.element.property('Path'));
    }

    Shape.prototype.process = function() {
        this.processProperties();
    }

    Shape.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.shape,
            properties: {
                Path: this.path.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }



    return function(element) {
        return new Shape(element);
    }
    
}());