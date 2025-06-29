/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportMessageFactory = (function () {

    function ReportMessage(type, renderers, builder) {
        this._type = type || 'warning';
        this._renderers = renderers || [];
        this._builder = builder || '';
    }

    ReportMessage.prototype.serialize = function() {
        return {
            type: this._type,
            renderers: this._renderers,
            builder: this._builder,
        }
    }

    function factory(type, renderers, builder) {
        return new ReportMessage(type, renderers, builder)
    };
    
    return factory;
}());