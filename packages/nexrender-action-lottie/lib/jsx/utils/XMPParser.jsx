/*global app, $, ExternalObject, XMPMeta */

$.__bodymovin.bm_XMPHelper = (function(){
    var ob = {};
    ob.init = init;
    ob.setMetadata = setMetadata;
    ob.getMetadata = getMetadata;
    ob.getMetadataFromCep = getMetadataFromCep;
    var namespace = 'bodymovin';
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var JSON = $.__bodymovin.JSON;
    
    function init(){
        var proj = app.project;

        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
            schemaNS = XMPMeta.registerNamespace(namespace, namespace);
        }
    }
    
   function setMetadata(property, value) {
        var proj = app.project;

        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var metaData = new XMPMeta(proj.xmpPacket);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
        } else {
            try {
                metaData.setProperty(schemaNS, namespace+":"+property, value);
            } catch(err) {
            }
        }
        proj.xmpPacket = metaData.serialize();
    }


    // To get metadata from within a script, a function like so:
    function getMetadata(property) {
        var proj = app.project;


        if(ExternalObject.AdobeXMPScript == undefined) {
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
        }
        var metaData = new XMPMeta(proj.xmpPacket);
        var schemaNS = XMPMeta.getNamespaceURI(namespace);
        if(schemaNS == "" || schemaNS == undefined) {
            return undefined;
        }
        var metaValue = metaData.getProperty(schemaNS, property);
        if(!metaValue) {
            return undefined;
        }
        return metaValue.value;
    } 

    function getMetadataFromCep(property, returnAsJson) {
        var data = getMetadata(property);
        if (data) {
            if (returnAsJson) {
                try {
                    data = JSON.parse(data.replace(/\\/g,'\\\\'))
                } catch (error) {
                }
            }
            bm_eventDispatcher.sendEvent('bm:xmpData:success:' + property, {value: data, property: property});
        } else {
            bm_eventDispatcher.sendEvent('bm:xmpData:failed:' + property, {property: property});
        }
    }
    
    init();
    
    return ob;
}())