/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeUnhandledReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function Unhandled(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(Unhandled, MessageClass);

    Unhandled.prototype.process = function() {
        var renderers = []
        for (var s in rendererTypes) {
            if (rendererTypes.hasOwnProperty(s)) {
                renderers.push(rendererTypes[s]);
            }
        }
        this.addMessage(messageTypes.WARNING,
        renderers,
        builderTypes.UNHANDLED_SHAPE_PROPERTY);
    }

    Unhandled.prototype.serialize = function() {
        return {
            type: 'un',
            name: this.element.name,
            messages: this.serializeMessages(),
        };
    }



    return function(element) {
        return new Unhandled(element);
    }
    
}());