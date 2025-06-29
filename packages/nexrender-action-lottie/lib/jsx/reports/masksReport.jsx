/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_masksReportFactory = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var maskReportFactory = $.__bodymovin.bm_maskReportFactory;

    function Masks(maskElements) {
        this.maskElements = maskElements;
        this.masks = [];
        this.process();
    }

    generalUtils.extendPrototype(Masks, MessageClass);

    Masks.prototype.process = function() {

        var maskElement;
        for (var i = 0; i < this.maskElements.numProperties; i += 1) {
            maskElement = this.maskElements(i + 1);
            this.masks.push(maskReportFactory(maskElement));
        }
    }

    Masks.prototype.serialize = function() {
        var serializedMasks = [];
        for(var i = 0; i < this.masks.length; i += 1) {
            serializedMasks.push(this.masks[i].serialize())
        }

        return {
            messages: this.serializeMessages(),
            masks: serializedMasks,
        }
    }

    return function(maskElements) {
        return new Masks(maskElements);
    }
    
}());