/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeGradientStrokeReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function GradientStroke(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(GradientStroke, MessageClass);

    GradientStroke.prototype.processProperties = function() {
        this.startPoint = propertyReport(this.element.property('Start Point'));
        this.endPoint = propertyReport(this.element.property('End Point'));
        this.opacity = propertyReport(this.element.property('Opacity'));
        this.strokeWidth = propertyReport(this.element.property('Stroke Width'));
        this.miterLimit = propertyReport(this.element.property('Miter Limit'));
        var type = this.element.property('Type').value;
        if (type === 2) {
            this.highlightLength = propertyReport(this.element.property('Highlight Length'));
            this.highlightAngle = propertyReport(this.element.property('Highlight Angle'));

        }
    }

    GradientStroke.prototype.process = function() {
        this.processProperties();
    }

    GradientStroke.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.gStroke,
            properties: {
                'Stroke Width': this.strokeWidth.serialize(),
                'Miter Limit': this.miterLimit.serialize(),
                'Start Point': this.startPoint.serialize(),
                'End Point': this.endPoint.serialize(),
                'Highlight Length': this.highlightLength ? this.highlightLength.serialize() : undefined,
                'Highlight Angle': this.highlightAngle ? this.highlightAngle.serialize() : undefined,
                Opacity: this.opacity.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new GradientStroke(element);
    }
    
}());