/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeStarReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function Star(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Star, MessageClass);

    Star.prototype.processProperties = function() {
        this.points = propertyReport(this.element.property('Points'));
        this.position = propertyReport(this.element.property('Position'));
        this.rotation = propertyReport(this.element.property('Rotation'));
        this.outerRadius = propertyReport(this.element.property('Outer Radius'));
        this.outerRoundness = propertyReport(this.element.property('Outer Roundness'));

        var type = this.element.property("Type").value;
        if (type === 1) {
            this.innerRadius = propertyReport(this.element.property('Inner Radius'));
            this.innerRoundness = propertyReport(this.element.property('Inner Roundness'));
        }
    }

    Star.prototype.process = function() {
        this.processProperties();
    }

    Star.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.star,
            properties: {
                Points: this.points.serialize(),
                Position: this.position.serialize(),
                Rotation: this.rotation.serialize(),
                'Outer Radius': this.outerRadius.serialize(),
                'Outer Roundness': this.outerRoundness.serialize(),
                'Inner Radius': this.innerRadius ? this.innerRadius.serialize() : undefined,
                'Inner Roundness': this.innerRoundness ? this.innerRoundness.serialize() : undefined,
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new Star(element);
    }
    
}());