/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeEllipseReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Ellipse(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Ellipse, MessageClass);

    Ellipse.prototype.processProperties = function() {
        this.size = propertyReport(this.element.property('Size'));
        this.position = propertyReport(this.element.property('Position'));
    }

    Ellipse.prototype.process = function() {
        this.processProperties();
    }

    Ellipse.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.ellipse,
            properties: {
                Size: this.size.serialize(),
                Position: this.position.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new Ellipse(element);
    }
    
}());