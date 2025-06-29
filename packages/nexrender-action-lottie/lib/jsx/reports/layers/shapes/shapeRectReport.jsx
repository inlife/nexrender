/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeRectReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Rect(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Rect, MessageClass);

    Rect.prototype.processProperties = function() {
        this.size = propertyReport(this.element.property('Size'));
        this.position = propertyReport(this.element.property('Position'));
        this.roundness = propertyReport(this.element.property('Roundness'));
    }

    Rect.prototype.process = function() {
        this.processProperties();
    }

    Rect.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.rect,
            properties: {
                Size: this.size.serialize(),
                Position: this.position.serialize(),
                Roundness: this.roundness.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new Rect(element);
    }
    
}());