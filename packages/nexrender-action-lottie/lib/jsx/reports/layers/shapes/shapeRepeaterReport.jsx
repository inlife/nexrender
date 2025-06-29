/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeRepeaterReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var transformFactory = $.__bodymovin.bm_transformReportFactory;

    function Repeater(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Repeater, MessageClass);

    Repeater.prototype.processProperties = function() {

        this.transform = transformFactory(this.element.property('Transform'), false);
        this.copies = propertyReport(this.element.property('Copies'));
        this.offset = propertyReport(this.element.property('Offset'));
    }

    Repeater.prototype.process = function() {
        this.processProperties();
    }

    Repeater.prototype.serialize = function() {

        return {
            name: this.element.name,
            type: shapeTypes.repeater,
            copies: this.copies.serialize(),
            offset: this.offset.serialize(),
            transform: this.transform.serialize(),
        };
    }

    return function(element) {
        return new Repeater(element);
    }
    
}());