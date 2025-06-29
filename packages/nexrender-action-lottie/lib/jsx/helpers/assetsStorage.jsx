/*jslint vars: true , plusplus: true, continue:true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder */

$.__bodymovin.assetsStorage = (function () {

  var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
  var JSON = $.__bodymovin.JSON;

  function createFilePath(compositionUid) {
    var appTemporaryFolder = new Folder(Folder.temp.absoluteURI);
    appTemporaryFolder.changePath('Bodymovin');
    appTemporaryFolder.changePath(compositionUid);
    if (!appTemporaryFolder.exists) {
        if (!appTemporaryFolder.create()) {
          // TODO: address filder failing to be created
          return null;
        }
    }
    var file = new File(appTemporaryFolder.absoluteURI);
    file.changePath('assets.json');
    return file;
  }

  function filterStoringAssets(assets) {
    var i  = 0;
    var len = assets.length;
    var storingAssets = [];
    for (i = 0; i < len; i += 1) {
      if (!assets[i].layers) {
        storingAssets.push(assets[i]);
      }
    }
    return storingAssets;
  }

  function storeAssets(assets, compositionUid) {
    var file = createFilePath(compositionUid);
    var storingAssets = filterStoringAssets(assets);
    if (file) {
      file.open('w', 'TEXT', '????');
      file.encoding = 'UTF-8';
      try {
        file.write(JSON.stringify(storingAssets)); //DO NOT ERASE, JSON FORMATTED
      } catch (error) {
        bm_eventDispatcher.log(error.message);
        bm_eventDispatcher.log(error.line);
        bm_eventDispatcher.log(error.fileName);
        bm_eventDispatcher.log($.stack);
      }
    }
    bm_eventDispatcher.log(file.absoluteURI);
  }

  function getAssets(compositionUid) {
    var file = createFilePath(compositionUid);
    if (file) {
      try {
        file.open('r');
        var str = file.read();
        var assets = JSON.parse(str);
        if (assets.length) {
          return assets;
        }
      } catch (error) {
      }
    }
    return null;
  }
  
  return {
    storeAssets: storeAssets,
    getAssets: getAssets,
    createFilePath: createFilePath,
  }
}());
