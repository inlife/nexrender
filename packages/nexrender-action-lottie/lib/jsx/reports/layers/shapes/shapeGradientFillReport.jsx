/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeGradientFillReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function GradientFill(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(GradientFill, MessageClass);

    GradientFill.prototype.processProperties = function() {
        this.startPoint = propertyReport(this.element.property('Start Point'));
        this.endPoint = propertyReport(this.element.property('End Point'));
        this.opacity = propertyReport(this.element.property('Opacity'));
        var type = this.element.property('Type').value;
        if (type === 2) {
            this.highlightLength = propertyReport(this.element.property('Highlight Length'));
            this.highlightAngle = propertyReport(this.element.property('Highlight Angle'));

        }
    }

    GradientFill.prototype.process = function() {
        this.processProperties();
    }

    GradientFill.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.gfill,
            properties: {
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
        return new GradientFill(element);
    }
    
}());