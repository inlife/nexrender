/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeRoundCornersReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function RoundCorners(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(RoundCorners, MessageClass);

    RoundCorners.prototype.processProperties = function() {
        this.radius = propertyReport(this.element.property('Radius'));
    }

    RoundCorners.prototype.process = function() {
        this.processProperties();
    }

    RoundCorners.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.roundedCorners,
            properties: {
                Radius: this.radius.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new RoundCorners(element);
    }
    
}());