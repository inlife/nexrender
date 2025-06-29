/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, $, RQItemStatus, File, app, PREFType, ImportOptions */
$.__bodymovin.bm_audioSourceHelper = (function () {
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_downloadManager = $.__bodymovin.bm_downloadManager;
    var renderQueueHelper = $.__bodymovin.bm_renderQueueHelper;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var audioSources = []
    , assetsArray
    , originalAssetsFlag, audioCount = 0;
    var currentExportingAudioIndex = 0;
    var imageNameIndex = 0;
    var finishCallback;
    var templateProject;
    var containingCompCopy;
    var _lastSecond = -1;
    var _lastMilliseconds = -1;

    function checkAudioSource(item) {

        audioSources.push({
            item: item,
            source: item.source,
            source_name: item.source.name,
            name: item.name,
            id: 'audio_' + audioCount,
        });
        audioCount += 1;
        return audioSources[audioSources.length - 1].id;
    }

    //                  A-Z      - .    0 - 9     _      a-z
    var validRanges = [[65,90],[45,46],[48,57],[95,95],[97,122]]

    function isValidChar(charCode) {
        var i = 0, len = validRanges.length;
        while(i < len) {
            if(charCode >= validRanges[i][0] && charCode <= validRanges[i][1]){
                return true
            }
            i += 1;
        }
        return false
    }

    function checkSanitizedNameExists(name) {
        var i = 0, len = assetsArray.length;
        while (i < len) {
            if(assetsArray[i].p === name) {
                return true
            }
            i += 1;
        }
        return false
    }

    function incrementSanizitedName(name) {
        return name + '_' + imageNameIndex++
    }

    function formatImageName(name) {
        var sanitizedName = '';
        var totalChars = name.lastIndexOf('.');
        var extensionIndex = name.lastIndexOf('.')
        var extension = extensionIndex !== -1 ? name.substr(extensionIndex) : '.png'
        if(totalChars < 0){
            totalChars = name.length;
        }
        var i;
        for(i = 0; i < totalChars; i += 1) {
            var charCode = name.charCodeAt(i)
            if(isValidChar(charCode)) {
                sanitizedName += name.substr(i,1)
            } else {
                sanitizedName += '_'
            }
            if(checkSanitizedNameExists(sanitizedName + extension)){
                sanitizedName = incrementSanizitedName(sanitizedName)
            }
        }
        return sanitizedName + extension;
    }

    function getImageName(originalName, generatedName, extension) {
        
        var imageName;

        if (settingsHelper.shouldUserOriginalNames()) {
            imageName = formatImageName(originalName);
        } else {
            imageName = generatedName;
            if (originalAssetsFlag) {
                imageName += originalName.substr(originalName.lastIndexOf('.')) || '.' + extension
            } else {
                imageName += '.' + extension;
            }
        }

        return imageName;
    }

    function getOutputModule(rqItem, templateName) {
        var i, len = rqItem.numOutputModules;
        var outputModule;
        for (i = 0; i < len; i += 1) {
            outputModule = rqItem.outputModule(i + 1);
            if (outputModule.name === templateName) {
                return outputModule;
            }
        }
        return rqItem.outputModule(1);
    }

    function installTemplate(templateName) {
        try {
            importTemplateProject();
            var comp = templateProject.item(1);
            var renderQueueItems = app.project.renderQueue.items;
            var i, templateRenderItem;
            for (i = 0; i < renderQueueItems.length; i += 1) {
                templateRenderItem = renderQueueItems[i + 1]
                if (templateRenderItem.comp.name === comp.name) {
                    var outputModule = getOutputModule(templateRenderItem, templateName);
                    outputModule.saveAsTemplate(outputModule.name);
                    break;
                }
            }
            for (i = 0; i < renderQueueItems.length; i += 1) {
                templateRenderItem = renderQueueItems[i + 1]
                if (templateRenderItem.comp === comp) {
                    templateRenderItem.remove();
                    i -= 1;
                }
            }
        } catch(err) {
            bm_eventDispatcher.log(err.message)
        }
    }

    function importTemplateProject() {
        var extensionFolder = bm_downloadManager.getExtensionFolder();
        var templateFile = new File(extensionFolder.absoluteURI + '/assets/templates/__bodymovin_sound_template_2018.aep')
        templateProject = app.project.importFile(new ImportOptions(templateFile));
    }

    function applyTemplateToModule(outputModule, templateName, comp) {
        var installedTemplates = outputModule.templates;
        var isTemplateInstalled = false
        for (var i = 0; i < installedTemplates.length; i += 1) {
            if (installedTemplates[i] === templateName) {
                isTemplateInstalled = true
                break
            }
        }

        if(!isTemplateInstalled) {
            installTemplate(templateName);
        }
        var item = getRenderItemByComp(comp);
        outputModule = item.outputModule(1);
        outputModule.applyTemplate(templateName);
        ////
    }

    function duplicateComposition(comp, layer) {
        var compCopy = comp.duplicate()
        var layerIndex = layer.index
        while (layerIndex > 1) {
            compCopy.layer(1).remove()
            layerIndex -= 1
        }
        while (compCopy.layers.length > 1) {
            compCopy.layer(2).remove()
        }
        compCopy.name = '__bodymovin_copy';

        var audioInPoint = layer.inPoint;
        var audioOutPoint = layer.outPoint;
        var compDuration = comp.duration;
        var workAreaStart = audioInPoint >= 0 ? audioInPoint : 0;
        var workAreaDuration = audioOutPoint - workAreaStart;
        if (workAreaStart + workAreaDuration > compDuration) {
            workAreaDuration = compDuration - workAreaStart;
        }
        // REPEATING IT MULTIPLE TIMES BECAUSE SOMETIMES IT DOESN'T WORK ONLY ONCE :/
        compCopy.workAreaStart = workAreaStart;
        compCopy.workAreaStart = workAreaStart;
        compCopy.workAreaStart = workAreaStart;
        try {
            compCopy.workAreaDuration = workAreaDuration;
        } catch(err) {
            workAreaDuration -= comp.frameDuration;
            compCopy.workAreaDuration = workAreaDuration;
        }

        if (!settingsHelper.shouldRasterizeWaveform()) {
            var audioProperty = compCopy.layer(1).property('Audio');
            var levels = audioProperty.property('Audio Levels');
            while (levels.numKeys !== 0) {
                levels.removeKey(1);
            }
            levels.setValue([0, 0]);
        }
        return compCopy;
    }

    function getRenderItemByComp(comp) {
        var renderQueueItems = app.project.renderQueue.items;
        var i, renderItem;
        for (i = 0; i < renderQueueItems.length; i += 1) {
            renderItem = renderQueueItems[i + 1];
            if (renderItem.comp === comp) {
                return renderItem
            }
        }
    }

    function createContainingComp(sourceData) {
        var containingComp = sourceData.item.containingComp
        var layer = sourceData.item
        containingCompCopy = duplicateComposition(containingComp, layer);
        //
        var item = app.project.renderQueue.items.add(containingCompCopy);
        var outputModule = item.outputModule(1);
        var template = settingsHelper.getAudioBitRateTemplate()
        applyTemplateToModule(outputModule, template, containingCompCopy);
        //
        item = getRenderItemByComp(containingCompCopy);
        outputModule = item.outputModule(1);
        //
        var imageName = getImageName(sourceData.source_name, 'aud_' + currentExportingAudioIndex, 'mp3');
        var renderFileData = bm_fileManager.createFile(imageName, ['raw','images']);
        var file = renderFileData.file;
        outputModule.file = file;
        item.render = false;
        renderQueueHelper.backupRenderQueue();
        item.render = true;
        outputModule.file = file;
        
        item.onStatusChanged = function() {
            if (item.status === RQItemStatus.DONE) {
                updateCurrentSecond();
                currentExportingAudioIndex += 1;

                if (settingsHelper.shouldEncodeImages()) {
                    bm_eventDispatcher.sendEvent('bm:image:process', {
                        path: file.fsName, 
                        should_compress: false, 
                        compression_rate: 100,
                        should_encode_images: settingsHelper.shouldEncodeImages(),
                        assetType: 'audio',
                    });
                } else {
                    app.scheduleTask('$.__bodymovin.bm_audioSourceHelper.scheduleNextSave();', 20, false);
                }
            }
        };

        assetsArray.push({
            id: sourceData.id,
            u: 'images/',
            p: imageName,
            e: 0,
            fileId: renderFileData.id,
            t: 2,
        });

        app.project.renderQueue.render();

    }

    function assetProcessed(_, encoded_data) {
        if (encoded_data) {
            var currentSavingAsset = assetsArray[assetsArray.length - 1];
            currentSavingAsset.p = encoded_data;
            currentSavingAsset.u = '';
            currentSavingAsset.e = 1;
            bm_fileManager.removeFile(currentSavingAsset.fileId);
            app.scheduleTask('$.__bodymovin.bm_audioSourceHelper.scheduleNextSave();', 20, false);
        }
    }

    function updateCurrentSecond() {
        var now = new Date();
        var newSecond = now.getSeconds();
        _lastSecond = newSecond;
    }

    function saveAudio() {
        var currentSourceData = audioSources[currentExportingAudioIndex];
        ////
        createContainingComp(currentSourceData);
        ////
    }

    function scheduleNextSave() {

        var now = new Date();
        var newSecond = now.getSeconds();
        var newMilliSeconds = now.getMilliseconds();
        if (newSecond !== _lastSecond) {
            _lastSecond = newSecond;
            _lastMilliseconds = newMilliSeconds;
            saveNextAudio();
        } else {
            app.scheduleTask('$.__bodymovin.bm_audioSourceHelper.scheduleNextSave();', (1000 - _lastMilliseconds), false);
        }
    }

    function saveNextAudio() {
        try {
            containingCompCopy.remove();
            containingCompCopy = null;
        } catch(err) {

        }

        if (currentExportingAudioIndex === audioSources.length) {
            if (templateProject) {
                try {
                    templateProject.remove();
                } catch(err) {}
            }
            renderQueueHelper.restoreRenderQueue();
            finishCallback();
        } else {
            saveAudio();
        }
    }

    function reset() {
        audioSources.length = 0;
        audioCount = 0;
        currentExportingAudioIndex = 0;
    }

    function save(_callback, _assetsArray) {
        assetsArray = _assetsArray;
        finishCallback = _callback;
        if (audioSources.length > 0) {
            saveNextAudio();
        } else {
            finishCallback();
        }
    }

    function isEmpty() {
        return audioSources.length === 0;
    }
    
    return {
        reset: reset,
        save: save,
        isEmpty: isEmpty,
        checkAudioSource: checkAudioSource,
        scheduleNextSave: scheduleNextSave,
        assetProcessed: assetProcessed,
    };
    
}());