/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapePuckerAndBloatReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function PuckerAndBloat(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(PuckerAndBloat, MessageClass);

    PuckerAndBloat.prototype.processProperties = function() {
        this.amount = propertyReport(this.element.property('Amount'));
    }

    PuckerAndBloat.prototype.process = function() {
        this.processProperties();
        this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.IOS,
                rendererTypes.ANDROID
            ],
            builderTypes.PUCKER_AND_BLOAT);
    }

    PuckerAndBloat.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.puckerAndBloat,
            properties: {
                Amount: this.amount.serialize(),
            },
            messages: this.serializeMessages(),
        };
    }

    return function(element) {
        return new PuckerAndBloat(element);
    }
    
}());