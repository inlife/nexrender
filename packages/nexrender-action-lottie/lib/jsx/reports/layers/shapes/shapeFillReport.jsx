/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeFillReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Fill(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Fill, MessageClass);

    Fill.prototype.processProperties = function() {
        this.color = propertyReport(this.element.property('Color'));
        this.opacity = propertyReport(this.element.property('Opacity'));
    }

    Fill.prototype.process = function() {
        this.processProperties();
    }

    Fill.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.fill,
            properties: {
                Color: this.color.serialize(),
                Opacity: this.opacity.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new Fill(element);
    }
    
}());