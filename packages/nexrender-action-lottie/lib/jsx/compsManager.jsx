/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app, ViewerType */

$.__bodymovin.bm_compsManager = (function () {
    'use strict';
    
    var compositions = [], projectComps, ob, currentComposition;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_projectManager = $.__bodymovin.bm_projectManager;
    
    
    function getCompositionData(comp) {
        //
        var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === comp.id) {
                compData = compositions[i];
                break;
            }
            i += 1;
        }
        if (!compData) {
            compData = {
                id: comp.id,
                name: comp.name,
                width: comp.width, 
                height: comp.height
            };
        }
        
        return compData;
    }
    
    function searchCompositionDestination(id, absoluteURI, fileName) {
        /*var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compData = compositions[i];
                break;
            }
            i += 1;
        }*/
        var uri;
        if (absoluteURI) {
            uri = absoluteURI;
        } else {
            uri = Folder.desktop.absoluteURI + '/' + fileName;
        }

        var f = new File(uri);
        var saveFileData = f.saveDlg();
        if (saveFileData !== null) {
            //compData.absoluteURI = saveFileData.absoluteURI;
            //compData.destination = saveFileData.fsName;
            var compositionDestinationData = {
                absoluteURI: saveFileData.absoluteURI,
                destination: saveFileData.fsName,
                id: id
            }
            bm_eventDispatcher.sendEvent('bm:composition:destination_set', compositionDestinationData);
        }
    }
    
    //Opens folder where json is rendered
    function browseFolder(destination) {
        var file = new File(destination);
        file.parent.execute();
    }
    
    function browseFolderFromPath(path) {
        path = path ? path : Folder.desktop.absoluteURI
        var f = new Folder(path);
        var openFileData = f.selectDlg();
        if (openFileData !== null) {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:folder:uri', {
                absoluteURI: openFileData.absoluteURI,
                fsName: openFileData.fsName,
                path: openFileData.absoluteURI,
            });
        } else {
            $.__bodymovin.bm_eventDispatcher.sendEvent('bm:folder:cancel');
        }

    }
    
    function updateData(){
        bm_projectManager.checkProject();
        getCompositions();
    }
    
    function getCompositions() {
        var compositions = [];
        projectComps = bm_projectManager.getCompositions();
        var i, len = projectComps.length;
        for (i = 0; i < len; i += 1) {
            compositions.push(getCompositionData(projectComps[i]));
        }
        bm_eventDispatcher.sendEvent('bm:compositions:list', compositions);
    }

    function renderComposition(compositionData) {
        ob.cancelled = false;
        currentComposition = compositionData;
        projectComps = bm_projectManager.getCompositions();
        var comp;
        var i = 0, len = projectComps.length;
        while (i < len) {
            if (projectComps[i].id === currentComposition.id) {
                comp = projectComps[i];
                break;
            }
            i += 1;
        }

        bm_eventDispatcher.sendEvent('bm:render:start', currentComposition.id);
        var destination = currentComposition.absoluteURI;
        var fsDestination = currentComposition.destination;
        var destinationFile = new File(destination);
        var destinationFolder = destinationFile.parent;
        if (!destinationFolder.exists) {
            destinationFolder.create();
        }

        $.__bodymovin.bm_renderManager.render(comp, destination, fsDestination, currentComposition.settings, currentComposition.uid);
    }
    
    function renderComplete() {
        bm_eventDispatcher.sendEvent('bm:render:complete', currentComposition.id);
    }
    
    function cancel() {
        ob.cancelled = true;
        $.__bodymovin.bm_textShapeHelper.removeComps();
        bm_eventDispatcher.sendEvent('bm:render:cancel');
    }

    function navigateToLayer(compositionId, layerIndex) {
        // audioComp.openInViewer();
        var comps = bm_projectManager.getCompositions();
        var i = 0, len = comps.length, comp;
        while (i < len) {
            comp = projectComps[i];
            if (comp.id === compositionId) {
                try {
                    comp.openInViewer();
                    app.executeCommand(2004); // Deselect all
                    var layer = comp.layer(layerIndex);
                    layer.selected = true;
                } catch(err) {
                    bm_eventDispatcher.sendEvent('bm:navigation:cancel');
                }
                break;
            }
            i += 1;
        }
    }
    function getTimelinePosition() {
        var activeItem = app.project.activeItem;
        if (activeItem) {
            var comp = activeItem
            bm_eventDispatcher.sendEvent('bm:composition:timelinePosition', {
                active: true,
                data: {
                    inPoint: comp.workAreaStart * comp.frameRate,
                    outPoint: (comp.workAreaStart + comp.workAreaDuration) * comp.frameRate,
                    time: comp.time * comp.frameRate,
                }
            });
        } else {
            bm_eventDispatcher.sendEvent('bm:composition:timelinePosition', {
                active: false
            });
        }
    }

    function setTimelinePosition(progress) {
        var activeItem = app.project.activeItem;
        if (activeItem) {
            var comp = activeItem;
            var timeInSeconds = comp.workAreaStart + comp.workAreaDuration * progress;
            var timeInFrames = timeInSeconds * comp.frameRate;
            comp.time = Math.floor(timeInFrames) / comp.frameRate;
        }
    }
    
    ob = {
        updateData : updateData,
        searchCompositionDestination : searchCompositionDestination,
        renderComplete : renderComplete,
        browseFolder : browseFolder,
        browseFolderFromPath : browseFolderFromPath,
        renderComposition : renderComposition,
        getTimelinePosition : getTimelinePosition,
        setTimelinePosition : setTimelinePosition,
        cancel : cancel,
        navigateToLayer : navigateToLayer,
        cancelled: false
    };
    
    return ob;
}());