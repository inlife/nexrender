/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global app, $, Folder */

$.__bodymovin.bm_projectManager = (function () {
    'use strict';
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_XMPHelper = $.__bodymovin.bm_XMPHelper;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var commands = {};
    var projectId = '';
    var tempId = '';
    var project;
    function getItemType(item) {
        var getType = {};
        var type = getType.toString.call(item);
        var itemType = '';
        switch (type) {
        case "[object FolderItem]":
            itemType = 'Folder';
            break;
        case "[object FootageItem]":
            itemType = 'Footage';
            break;
        case "[object CompItem]":
            itemType = 'Comp';
            break;
        default:
            itemType = type;
            break;

        }
        return itemType;
    }
    
    function searchCommands() {
        //commands.shapesFromText = app.findMenuCommandId("Create Shapes from Text");
        //commands.duplicate = app.findMenuCommandId("Duplicate");
        commands.shapesFromText = 3781;
        commands.duplicate = 2080;
    }
    
    function getCommandID(key) {
        return commands[key];
    }
    
    function checkProject() {
        //bm:application:id
        var storedProjectId;
        storedProjectId = bm_XMPHelper.getMetadata('project_id');
        if(!app.project || app.project.numItems === 0) {
            return;
        }

        if(!storedProjectId) {
            storedProjectId = bm_generalUtils.random(20);
            bm_XMPHelper.setMetadata('project_id',storedProjectId);
        }
        if(projectId !== storedProjectId){
            projectId = storedProjectId;
            bm_eventDispatcher.sendEvent('bm:project:id', {id:projectId, name: app.project.file.name});
        } else {
            // This try catch will identify if the project was updated but the stored id is the same.
            // If that's the case, the project is very likely a copy of the original one
            // So we are assigning a new id to the current one.
            try {
                // This comparison will throw an error because we're keeping a reference to and old project
                // And AE crashes when trying to use it.
                var areEqual = app.project === project;
            } catch (err) {
                storedProjectId = bm_generalUtils.random(20);
                bm_XMPHelper.setMetadata('project_id',storedProjectId);
                projectId = storedProjectId;
                bm_eventDispatcher.sendEvent('bm:project:id', {id:projectId, name: app.project.file.name});
            }
        }
        
    }

    function createTempId() {
        if (tempId) {
            return;
        }
        tempId = bm_generalUtils.random(32);
        bm_fileManager.removeOldTemporaryFolder();

        // This tempId is used to send requests with a specific header so localhost open port can't be exploited
        bm_eventDispatcher.sendEvent('bm:temp:id', {id:tempId});

        try {
            var tempIdFile = new File(Folder.temp.absoluteURI + '/bodymovin_uid.txt');
            tempIdFile.open('w', 'TEXT', '????');
            tempIdFile.encoding = 'UTF-8';
            tempIdFile.write(tempId);
            tempIdFile.close();
        } catch(error) {
            // bm_eventDispatcher.log('error');
            // bm_eventDispatcher.log(error.message);
            // bm_eventDispatcher.log(error.line);
            // bm_eventDispatcher.log(error.fileName);
        }
    }
    
    function getCompositions() {
    
        project = app.project;
        var arr = [];
        if (!project) {
            return;
        }
        var i, numItems = project.numItems;
        for (i = 0; i < numItems; i += 1) {
            if (getItemType(project.item(i + 1)) === 'Comp') {
                arr.push(project.item(i + 1));
            }
        }
        return arr;
    }

    function getCompositionById(id){
        var i, numItems = project.numItems;
        for (i = 0; i < numItems; i += 1) {
            if (getItemType(project.item(i + 1)) === 'Comp') {
                if(project.item(i + 1).id == id){
                    return project.item(i + 1);
                }
            }
        }
    }

    function getFile(path) {
        var extensionPath = $.fileName.split('/').slice(0, -1).join('/') + '/';
        var folder = new Folder(extensionPath);
        folder = folder.parent;
        var file = new File(folder.absoluteURI + '/' + path)
        return file;
    }

    function getProjectPath() {
        if (app.project && app.project.file && app.project.file.parent) {
            var projectFolder = app.project.file.parent;
            bm_eventDispatcher.sendEvent('bm:project:path', {path: projectFolder.fsName});
        }
    }

    function getUserFolders() {
        bm_eventDispatcher.sendEvent('bm:user:folders', {userData: Folder.userData.fsName});
    }

    function setDestinationPath(path) {
        /*var i = 0, len = compositions.length, compData;
        while (i < len) {
            if (compositions[i].id === id) {
                compData = compositions[i];
                break;
            }
            i += 1;
        }*/
        var uri;
        if (path) {
            uri = path;
        } else {
            uri = Folder.desktop.absoluteURI + '/settings.json';
        }

        var f = new File(uri);
        var saveFileData = f.saveDlg();
        if (saveFileData !== null) {
            //compData.absoluteURI = saveFileData.absoluteURI;
            //compData.destination = saveFileData.fsName;
            var compositionDestinationData = {
                absoluteURI: saveFileData.absoluteURI,
                destination: saveFileData.fsName,
                fsName: saveFileData.fsName,
            }
            bm_eventDispatcher.sendEvent('bm:destination:selected', compositionDestinationData);
        } else {
            bm_eventDispatcher.sendEvent('bm:destination:cancelled');
        }
    }

    function getSelectedProperties() {
        var props = [];
        if (app.project && app.project.activeItem && app.project.activeItem.selectedLayers) {
            var selectedLayers = app.project.activeItem.selectedLayers
            var i = 0;
            for (i = 0; i < selectedLayers.length; i += 1) {
                var layer = selectedLayers[i];
                try {
                    for (var j = 0; j < layer.selectedProperties.length; j += 1) {
                        props.push({
                            matchName: layer.selectedProperties[j].matchName,
                            name: layer.selectedProperties[j].name,
                        });
                    }
                } catch (error) {
                }
            }
        }
        bm_eventDispatcher.sendEvent('bm:properties:list', props);
    }
    
    var ob = {
        checkProject: checkProject,
        createTempId: createTempId,
        getCompositions: getCompositions,
        getCompositionById: getCompositionById,
        searchCommands: searchCommands,
        getCommandID: getCommandID,
        getFile: getFile,
        getProjectPath: getProjectPath,
        getUserFolders: getUserFolders,
        setDestinationPath: setDestinationPath,
        getSelectedProperties: getSelectedProperties,
    };
    return ob;
}());