/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeTrimPathsReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;

    function TrimPaths(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(TrimPaths, MessageClass);

    TrimPaths.prototype.processProperties = function() {
        this.start = propertyReport(this.element.property('Start'));
        this.end = propertyReport(this.element.property('End'));
        this.offset = propertyReport(this.element.property('Offset'));
    }

    TrimPaths.prototype.process = function() {
        this.processProperties();
    }

    TrimPaths.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.trim,
            properties: {
                Start: this.start.serialize(),
                End: this.end.serialize(),
                Offset: this.offset.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new TrimPaths(element);
    }
    
}());