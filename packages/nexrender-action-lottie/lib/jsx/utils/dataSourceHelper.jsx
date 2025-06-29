/*jslint vars: true , plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global layerElement, $, RQItemStatus, File, app, PREFType, ImportOptions */
$.__bodymovin.bm_dataSourceHelper = (function () {
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var bm_generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_downloadManager = $.__bodymovin.bm_downloadManager;
    var renderQueueHelper = $.__bodymovin.bm_renderQueueHelper;
    var bm_fileManager = $.__bodymovin.bm_fileManager;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;
    var dataSources = []
    , assetsArray
    , originalAssetsFlag, dataCount = 0;
    var currentExportingDataIndex = 0;
    var imageNameIndex = 0;
    var finishCallback;
    var _lastSecond = -1;
    var _lastMilliseconds = -1;

    function checkDataSource(item) {
        var i = 0, len = dataSources.length;
        while (i < len) {
            if (dataSources[i].source === item.source) {
                return dataSources[i].id;
            }
            i += 1;
        }
        dataSources.push({
            source: item.source,
            source_name: item.source.name,
            name: item.name,
            id: 'footage_' + dataCount,
        });
        dataCount += 1;
        return dataSources[dataSources.length - 1].id;
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

    function saveData() {
        var currentSourceData = dataSources[currentExportingDataIndex];
        
        var imageName = getImageName(currentSourceData.source_name, 'footage_' + currentExportingDataIndex, 'json');
        var renderFileData = bm_fileManager.createFile(imageName, ['raw','images']);
        var file = currentSourceData.source.file;
        file.copy(renderFileData.file.fsName);

        assetsArray.push({
            id: currentSourceData.id,
            u: 'images/',
            p: imageName,
            e: 0,
            fileId: renderFileData.id,
            t: 3,
        });
        currentExportingDataIndex += 1;
        if (currentExportingDataIndex === dataSources.length) {
            finishCallback();
        } else {
            saveData();
        }

        ////
        ////
    }

    function saveNextData() {
        bm_eventDispatcher.log('DATA: ')

        if (currentExportingDataIndex === dataSources.length) {
            finishCallback();
        } else {
            saveData();
        }
    }

    function reset() {
        dataSources.length = 0;
        dataCount = 0;
        currentExportingDataIndex = 0;
    }

    function save(_callback, _assetsArray) {
        assetsArray = _assetsArray;
        finishCallback = _callback;
        if (dataSources.length > 0) {
            saveNextData();
        } else {
            finishCallback();
        }
    }

    function isEmpty() {
        return dataSources.length === 0;
    }
    
    return {
        reset: reset,
        save: save,
        isEmpty: isEmpty,
        checkDataSource: checkDataSource,
    };
    
}());