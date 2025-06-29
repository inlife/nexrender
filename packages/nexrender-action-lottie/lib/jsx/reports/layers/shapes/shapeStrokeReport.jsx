/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeStrokeReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Stroke(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Stroke, MessageClass);

    Stroke.prototype.processProperties = function() {
        this.color = propertyReport(this.element.property('Color'));
        this.opacity = propertyReport(this.element.property('Opacity'));
        this.strokeWidth = propertyReport(this.element.property('Stroke Width'));
    }

    Stroke.prototype.process = function() {
        this.processProperties();
    }

    Stroke.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.stroke,
            properties: {
                Color: this.color.serialize(),
                Opacity: this.opacity.serialize(),
                'Stroke Width': this.strokeWidth.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new Stroke(element);
    }
    
}());