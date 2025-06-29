/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global File, Folder, $*/

$.__bodymovin.bm_smilExporter = (function () {

	var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var exporterHelpers = $.__bodymovin.bm_exporterHelpers;

	var ob = {};
	var _callback;

    function saveSMILDataSuccess() {
        _callback(exporterHelpers.exportTypes.SMIL, exporterHelpers.exportStatuses.SUCCESS);
    }

    function saveSMILFailed() {
        _callback(exporterHelpers.exportTypes.SMIL, exporterHelpers.exportStatuses.FAILED);
    }

	function save(destinationPath, config, callback) {
		_callback = callback;

		if (config.export_modes.smil) {
			var destinationData = exporterHelpers.parseDestination(destinationPath, 'smil');

			var smilDestinationFileName = new File(destinationData.folder.fsName)
			smilDestinationFileName.changePath(destinationData.fileName + '.svg')

			var temporaryFolder = bm_fileManager.getTemporaryFolder();
			var jsonFile = new File(temporaryFolder.fsName);
			jsonFile.changePath('raw');
			jsonFile.changePath(destinationData.fileName + '.json');

			// var animationStringData = exporterHelpers.getJsonData(rawFiles);
			bm_eventDispatcher.sendEvent('bm:create:smil', {origin: jsonFile.fsName, destination: smilDestinationFileName.fsName});
		
		} else {
			_callback(exporterHelpers.exportTypes.SMIL, exporterHelpers.exportStatuses.SUCCESS);
		}
	}


	ob.save = save;
    ob.saveSMILDataSuccess = saveSMILDataSuccess;
    ob.saveSMILFailed = saveSMILFailed;
    
    return ob;
}());