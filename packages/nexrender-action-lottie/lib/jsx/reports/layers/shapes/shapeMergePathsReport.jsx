/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_shapeMergePathsReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var shapeTypes = $.__bodymovin.shapeTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    function MergePaths(element) {
        this.element = element;
        this.process();
    }
    
    generalUtils.extendPrototype(MergePaths, MessageClass);

    MergePaths.prototype.processProperties = function() {
    }

    MergePaths.prototype.process = function() {
        var mergeType = this.element.property('ADBE Vector Merge Type').value;
        var renderers = []
        for (var s in rendererTypes) {
            if (rendererTypes.hasOwnProperty(s)) {
                renderers.push(rendererTypes[s]);
            }
        }
        if (mergeType === 4) {
            // TODO: decide if showing a message or not since bodymovin tries to remove them automatically
        } else {
            this.addMessage(messageTypes.ERROR,
            renderers,
            builderTypes.MERGE_PATHS);
        }
    }

    MergePaths.prototype.serialize = function() {
        return {
            name: this.element.name,
            type: shapeTypes.merge,
            messages: this.serializeMessages(),
            properties: {
            }
        };
    }

    return function(element) {
        return new MergePaths(element);
    }
    
}());