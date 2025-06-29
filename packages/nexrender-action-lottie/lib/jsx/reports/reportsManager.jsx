/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_reportsManager = (function () {
    
    var ob;
    var animationReportFactory = $.__bodymovin.bm_animationReport;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var compsManager = $.__bodymovin.bm_compsManager;

    function createReport(animation, onReportComplete, onReportFail) {
    	var animationReport = animationReportFactory(animation, onReportComplete, onReportFail);
    }

    function createReportFromCompositionId(compositionId) {

    }

    ob = {
        createReport: createReport,
        createReportFromCompositionId: createReportFromCompositionId,
    };
    
    return ob;
}());