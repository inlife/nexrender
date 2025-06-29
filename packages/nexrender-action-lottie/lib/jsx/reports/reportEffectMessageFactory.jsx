/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportEffectMessageFactory = (function () {

    var reportMessageFactory = $.__bodymovin.bm_reportMessageFactory;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function ReportEffectMessage(type, renderers, builderType) {
        builderType = builderType || builderTypes.EFFECTS;
        this._message = reportMessageFactory(type, renderers, builderType);
        this._effects = [];
    }

    ReportEffectMessage.prototype.addEffect = function(effect) {
        this._effects.push(effect);
    }

    ReportEffectMessage.prototype.serialize = function() {
        var messageData = this._message.serialize();
        var serializedData = {}
        for (var s in messageData) {
            if (messageData.hasOwnProperty(s)) {
                serializedData[s] = messageData[s];
            }
        }
        serializedData.payload = {
            effects: this._effects
        };
        return serializedData;
    }

    function factory(type, renderers, effects) {
        return new ReportEffectMessage(type, renderers, effects)
    };
    
    return factory;
}());