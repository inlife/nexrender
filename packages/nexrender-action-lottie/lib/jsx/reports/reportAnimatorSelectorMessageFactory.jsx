/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportAnimatorSelectorMessageFactory = (function () {

    var reportMessageFactory = $.__bodymovin.bm_reportMessageFactory;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function ReportAnimatorSelectorMessage(type, renderers) {
        this._message = reportMessageFactory(type, renderers, builderTypes.TEXT_SELECTOR_PROPERTIES);
        this._properties = [];
    }

    ReportAnimatorSelectorMessage.prototype.addProperty = function(property) {
        this._properties.push(property);
    }

    ReportAnimatorSelectorMessage.prototype.serialize = function() {
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
        return new ReportAnimatorSelectorMessage(type, renderers)
    };
    
    return factory;
}());