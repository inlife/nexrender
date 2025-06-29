/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeGroupReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var shapeCollectionFactory = $.__bodymovin.bm_shapeCollectionReport;
    var transformFactory = $.__bodymovin.bm_transformReportFactory;

    function Group(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Group, MessageClass);

    Group.prototype.processProperties = function() {
        if (!shapeCollectionFactory) {
            shapeCollectionFactory = $.__bodymovin.bm_shapeCollectionReport;
        }
        this.shapes = shapeCollectionFactory(this.element.property('Contents'));
        this.transform = transformFactory(this.element.property('Transform'), false);
    }

    Group.prototype.process = function() {
        this.processProperties();
    }

    Group.prototype.serialize = function() {

        var shapesData = this.shapes.serialize();

        return {
            name: this.element.name,
            type: shapeTypes.group,
            shapes: shapesData.shapes,
            transform: this.transform.serialize(),
        };
    }

    return function(element) {
        return new Group(element);
    }
    
}());