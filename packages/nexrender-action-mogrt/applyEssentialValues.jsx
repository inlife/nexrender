/* eslint-disable */
(function () {
    function emptyDuplicate(comp, name) {
        name = name || ('empty ' + comp.name);
        return app.project.items.addComp(name, comp.width, comp.height, comp.pixelAspect, comp.duration, comp.frameRate);
    }

    function compByName(name) {
        for (var i = 1; i <= app.project.items.length; i++) {
            var item = app.project.items[i];
            if (item instanceof CompItem && item.name === name) {
                return item;
            }
        }
    }

    function lookInside(prop, subArray) {
        if (!subArray.hasOwnProperty(prop.name)) {
            return null;
        }

        subArray = subArray[prop.name];

        if (prop instanceof PropertyGroup) {
            for (var i = 1; i <= prop.numProperties; i++) {
                lookInside(prop.property(i), subArray);
            }
        }
        else if (prop instanceof Property) {
            if (prop.essentialPropertySource.matchName == 'ADBE AV Layer') {
                prop.essentialPropertySource.name = subArray;
            }
            else if (prop.essentialPropertySource.matchName == 'ADBE Text Document' && typeof subArray !== 'string') {
                var value = prop.essentialPropertySource.value;
                if (subArray.hasOwnProperty('Size')) value.fontSize = subArray['Size'];
                if (subArray.hasOwnProperty('Text')) value.text = subArray['Text'];
                prop.essentialPropertySource.setValue(value);
            }
            else {
                prop.setValue(subArray);
            }
        }
    }

    const compName = typeof _essential !== 'undefined' && _essential.get('composition') || 'Comp 1';
    const essentialParameters = typeof _essential !== 'undefined' && _essential.get('essentialParameters') || {};
    const templateComp = compByName(compName);
    const comp = emptyDuplicate(templateComp, "__mogrt__");
    var layer = comp.layers.add(templateComp);
    for (var i = 1; i <= layer.essentialProperty.numProperties; i++) {
        var prop = layer.essentialProperty(i);
        lookInside(prop, essentialParameters);
    }
})();
/* eslint-enable */
