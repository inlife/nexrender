/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, File, Folder*/

$.__bodymovin = $.__bodymovin || {esprima:{}}
$.__bodymovin.bm_main = (function () {
    'use strict';
    var ob = {};
    
    function browseFile(path) {
        path = path ? path : Folder.desktop.absoluteURI
        var f = new File(path);
        var openFileData = f.openDlg();
        if (openFileData !== null) {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:uri', {
                absoluteURI: openFileData.absoluteURI,
                fsName: openFileData.fsName,
                path: openFileData.path,
            });
        } else {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:file:cancel');
        }

    }
    
    function browseFolder(path) {
        path = path ? path : Folder.desktop.absoluteURI
        var f = new Folder(path);
        var openFileData = f.selectDlg();
        if (openFileData !== null) {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:folder:uri', {
                absoluteURI: openFileData.absoluteURI,
                fsName: openFileData.fsName,
                path: openFileData.path,
            });
        } else {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:folder:cancel');
        }

    }
    
    ob.browseFile = browseFile;
    ob.browseFolder = browseFolder;

    return ob;
}());