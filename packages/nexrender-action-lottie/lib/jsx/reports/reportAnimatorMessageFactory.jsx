/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportAnimatorMessageFactory = (function () {

    var reportMessageFactory = $.__bodymovin.bm_reportMessageFactory;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function ReportAnimatorMessage(type, renderers) {
        this._message = reportMessageFactory(type, renderers, builderTypes.ANIMATOR_PROPERTIES);
        this._properties = [];
    }

    ReportAnimatorMessage.prototype.addProperty = function(property) {
        this._properties.push(property);
    }

    ReportAnimatorMessage.prototype.serialize = function() {
        var messageData = this._message.serialize();
        var serializedData = {}
        for (var s in messageData) {
            if (messageData.hasOwnProperty(s)) {
                serializedData[s] = messageData[s];
            }
        }
        serializedData.payload = {
            properties: this._properties
        };
        return serializedData;
    }

    function factory(type, renderers) {
        return new ReportAnimatorMessage(type, renderers)
    };
    
    return factory;
}());