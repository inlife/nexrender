/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global Folder, File, $, app, RQItemStatus, PREFType */
$.__bodymovin.bm_renderQueueHelper = (function () {
    var ob = {};
    var playSound, autoSave, canEditPrefs;
    var storedRenderQueue = [];

    function backupRenderQueue() {
        try {
            playSound = app.preferences.getPrefAsLong("Misc Section", "Play sound when render finishes", PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            autoSave = app.preferences.getPrefAsLong("Auto Save", "Enable Auto Save RQ2", PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Misc Section", "Play sound when render finishes", 0, PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Auto Save", "Enable Auto Save RQ2", 0, PREFType.PREF_Type_MACHINE_INDEPENDENT);
        }  catch(err) {
            canEditPrefs = false;
        }
        storedRenderQueue = [];
        for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
            var item = app.project.renderQueue.item(i);
            if (item.status === RQItemStatus.QUEUED) {
                storedRenderQueue.push(i);
                item.render = false;
            }
        }
    }

    function restoreRenderQueue() {
        for (var i = 0; i < storedRenderQueue.length; i++) {
            try {
                app.project.renderQueue.item(storedRenderQueue[i]).render = true;
            } catch(error) {}
        }
        if (canEditPrefs) {
            app.preferences.savePrefAsLong("Misc Section", "Play sound when render finishes", playSound, PREFType.PREF_Type_MACHINE_INDEPENDENT);  
            app.preferences.savePrefAsLong("Auto Save", "Enable Auto Save RQ2", autoSave, PREFType.PREF_Type_MACHINE_INDEPENDENT);   
        }
    }
    
    function renderQueueIsBusy() {
        for (var i = 1; i <= app.project.renderQueue.numItems; i++) {
            if (app.project.renderQueue.item(i).status == RQItemStatus.RENDERING) {
                return true;
            }
        }
        return false;
    }

    ob.backupRenderQueue = backupRenderQueue;
    ob.restoreRenderQueue = restoreRenderQueue;
    ob.renderQueueIsBusy = renderQueueIsBusy;

    return ob;
}());