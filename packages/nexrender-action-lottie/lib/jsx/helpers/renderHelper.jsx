/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global Folder, File, $ */
$.__bodymovin.bm_renderHelper = (function () {
    var ob = {};
    var _renderRange = [];

    function pushRenderRange(range) {
        _renderRange.push(range);
    }

    function popRenderRange() {
        return _renderRange.pop();
    }

    function getCurrentRange() {
        return _renderRange[_renderRange.length - 1];
    }

    function resetRenderRange() {
        return _renderRange = [];
    }

    ob.pushRenderRange = pushRenderRange;
    ob.popRenderRange = popRenderRange;
    ob.getCurrentRange = getCurrentRange;
    ob.resetRenderRange = resetRenderRange;

    return ob;
}());