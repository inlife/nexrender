(function() {
    var temporaryFolder;
    var textBoxPadding = 10;

    function writeLog(message) {
        // In ExtendScript, $.writeln goes to the ExtendScript Toolkit Console.
        // For After Effects Info panel, you might need a more complex setup or use alerts for critical info.
        $.writeln(new Date().toTimeString().split(" ")[0] + " - " + message);
    }

    function random(len) {
        var sequence = "abcdefghijklmnoqrstuvwxyz1234567890",
            returnString = "",
            i;
        for (i = 0; i < len; i += 1) {
            returnString += sequence.charAt(Math.floor(Math.random() * sequence.length));
        }
        return returnString;
    }

    function fixBugNameFile(imageName, fsName, suffix) {
        var bug = new File(fsName + suffix);
        if (bug.exists) {
            bug.rename(imageName + ".png");
        } else {
            var namename = fsName.substr(0, fsName.lastIndexOf(".")) + "_" + suffix + ".png";
            bug = new File(namename);
            if (bug.exists) {
                bug.rename(imageName);
            }
        }
    }

    function centerAnchorPoint(layer) {
        var comp = layer.containingComp;
        var curTime = comp.time;
        var layerAnchor = layer.anchorPoint.value;

        /* find center by bounding box of the layer */
        var x = layer.sourceRectAtTime(curTime, false).width / 2.0;
        var y = layer.sourceRectAtTime(curTime, false).height / 2.0;

        /* we need this for text layer */
        x += layer.sourceRectAtTime(curTime, false).left;
        y += layer.sourceRectAtTime(curTime, false).top;
        var xAdd = (x - layerAnchor[0]) * (layer.scale.value[0] / 100.0);
        var yAdd = (y - layerAnchor[1]) * (layer.scale.value[1] / 100.0);

        /* set new anchor point*/
        layer.anchorPoint.setValue([x, y]);
        var layerPosition = layer.position.value;

        /* fix position with adjustments */
        layer.transform.position.setValue([layerPosition[0] + xAdd, layerPosition[1] + yAdd, layerPosition[2]]);
        // layer.transform.property("X Position").setValue(layerPosition[0] + xAdd);
        // layer.transform.property("Y Position").setValue(layerPosition[1] + yAdd);
    }

    function createImageLayer(textLayer) {
        var currentSource = textLayer;
        currentSource.transform.position.dimensionsSeparated = false;
        centerAnchorPoint(currentSource);

        var size = currentSource.sourceRectAtTime(0, false);
        var scale = currentSource.transform.scale.value;
        var newWidth = Math.round(size.width * scale[0] / 100.0 + textBoxPadding * 2);
        var newHeight = Math.round(size.height * scale[1] / 100.0 + textBoxPadding * 2);
        var helperComp = app.project.items.addComp("tempConverterComp", newWidth, newHeight, 1, 1, 1);
        currentSource.copyToComp(helperComp);

        var newLayer = helperComp.layer(1);
        newLayer.transform.position.dimensionsSeparated = false;
        newLayer.transform.position.expression = "";
        newLayer.transform.opacity.expression = "";

        newLayer.transform.position.setValue([
            size.width / 2.0 * scale[0] / 100.0 + textBoxPadding,
            size.height / 2.0 * scale[1] / 100.0 + textBoxPadding
        ]);

        newLayer.transform.opacity.setValue(textLayer.transform.opacity.value);
        newLayer.transform.scale.setValue(textLayer.transform.scale.value);
        newLayer.sourceText.setValue(textLayer.sourceText.value);
        newLayer.sourceText.expression = "";

        // Add composition item to render queue and set to render.
        var item = app.project.renderQueue.items.add(helperComp);
        item.render = true;

        var imageName = random(10) + "_" + new Date().getTime();
        var file = new File(temporaryFolder.absoluteURI + "/" + imageName + ".png");
        var outputModule = item.outputModule(1);
        outputModule.applyTemplate("_HIDDEN X-Factor 8 Premul");
        outputModule.file = file;

        // Set cleanup.
        item.onStatusChanged = function () {
            if (item.status === RQItemStatus.DONE) {
                fixBugNameFile(imageName, file.fsName, "00000");
            }
        };

        // Render.
        app.project.renderQueue.render();
        replaceOriginalLayerWithImage(textLayer, newLayer, file, scale);
        // helperComp.remove();
        // item.remove();
    }

    function replaceOriginalLayerWithImage(textLayer, newTextLayer, file, originalScale) {
        var parent = textLayer.containingComp;
        var newSolidLayer = parent.layers.addSolid([0,0,0], textLayer.name, newTextLayer.width, newTextLayer.height, 1);
        newSolidLayer.name = textLayer.name;
        // var boxOffset = textLayer.sourceText.value.boxTextPos;
        var sourceRect = textLayer.sourceRectAtTime(0, false);

        var position = [
            textLayer.transform.position.value[0] - textLayer.transform.anchorPoint.value[0] + sourceRect.left * originalScale[0] / 100.0 - textBoxPadding,
            textLayer.transform.position.value[1] - textLayer.transform.anchorPoint.value[1] + sourceRect.top * originalScale[1] / 100.0 - textBoxPadding,
        ];
        newSolidLayer.transform.property("Anchor Point").setValue([0, 0]);
        newSolidLayer.transform.property("Position").setValue(position);
        // newSolidLayer.transform.property("Scale").setValue(textLayer.transform.property("Scale").value);
        newSolidLayer.transform.property("Rotation").setValue(textLayer.transform.property("Rotation").value);
        newSolidLayer.transform.property("Opacity").setValue(textLayer.transform.property("Opacity").value);
        var importOptions = new ImportOptions(file)
        var theImport = app.project.importFile(importOptions);
        newSolidLayer.replaceSource(theImport, false)
        textLayer.enabled = false;

        newSolidLayer.moveAfter(textLayer);
    }

    function scanCompositions(composition, textLayers) {
        // iterate over all layers in the composition and find all text layers recursively
        var layers = composition.layers;
        for (var i = 1; i <= layers.length; i++) {
            var layer = layers[i];
            if (layer instanceof TextLayer && layer.enabled) {
                textLayers.push(layer);
            }

            if (layer.source instanceof CompItem) {
                scanCompositions(layer.source, textLayers);
            }
        }

    }

    function main() {
        var compositionName = null;

        try {
            compositionName = NX.get("composition");
        } catch (e) {
            compositionName = app.project.activeItem.name;
        }

        var folder_random_name = random(10);
        temporaryFolder = new Folder(Folder.temp.absoluteURI);
        temporaryFolder.changePath("nx-lottie/" + folder_random_name);

        if (!temporaryFolder.exists) {
            if (!temporaryFolder.create()) {
                writeLog("folder failed to be created at: " + temporaryFolder.fsName);
                return false;
            }
        }

        // debug
        // createImageLayer(app.project.activeItem.selectedLayers[0]);

        var textLayers = [];

        for (var i = 1; i <= app.project.items.length; i++) {
            var item = app.project.items[i];
            if (item.name === compositionName) {
                var composition = item;
                scanCompositions(composition, textLayers);
            }
        }

        $.writeln("Found " + textLayers.length + " text layers");

        // create image layers for all text layers
        for (var i = 0; i < textLayers.length; i++) {
            createImageLayer(textLayers[i]);
        }
    }

    main();
})();
