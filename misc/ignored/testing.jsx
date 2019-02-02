//app.project.activeItem.layer(1).text.sourceText.expression = "timeToCurrentFormat(time)";



function layer(name, types) {
    var layers = [];
    for (var i = 1; i <= app.project.items.length; i++) {
        var item = app.project.items[i];
        if (!item instanceof CompItem) {
            continue;
        }
        
        for (var j =1; j <= item.numLayers; j++) {
            var layer = item.layer(j);
            if (typesMatch(types, layer)) {
                layers.push(layer);
            }
        }  
    }
    
    return layers.filter(function(l) {
        return l.name == name;
    })[0];
}

function typesMatch(types, layer) {
    return types.filter(function(t) {
        return layer instanceof t 
    }).length > 0
}
var types = [
    CompItem,
    FolderItem,
    FootageItem,
    AVLayer,
    ShapeLayer,
    TextLayer,
    CameraLayer,
    LightLayer,
    Property,
    PropertyGroup
];

var lay = layer("background.jpg", types) 

function replacer(key, value) {
  // Filtering out properties
  if (key == 'parent' || key == "containingComp" || key == "usedIn") {
    return undefined;
  }
  return value;
}
/*
var myFile = new File("C:/Users/Vladg/Desktop/2bef51b0.jpg");

if (myFile.exists) {
     alert("file exists!");
     var importOptions = new ImportOptions(myFile);
     //importOptions.importAs = ImportAsType.COMP; // you can do stuff like this at this point for PSDs
     var theImport = app.project.importFile(importOptions);
    lay.replaceSource(theImport, true)
}
*/
global.foo = [15, 20]

//var foo = app.project.item(7).layer(12)
//write("aaaaa\n\n\n\n\n")
//JSON.stringify(lay, replacer)
//foo
