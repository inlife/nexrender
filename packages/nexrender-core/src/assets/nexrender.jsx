module.exports = /*syntax:js*/`
try{Object.defineProperty({},'a',{value:0})}catch(err){(function(){var defineProperty=Object.defineProperty;Object.defineProperty=function(object,property,descriptor){delete descriptor.configurable;delete descriptor.enumerable;delete descriptor.writable;try{return defineProperty(object,property,descriptor)}catch(err){object[property]=descriptor.value}}}())}Object.defineProperties||(Object.defineProperties=function defineProperties(object,descriptors){var property;for(property in descriptors){Object.defineProperty(object,property,descriptors[property])}return object});var lambda=function(l){var fn=l.match(/\((.*)\)\s*=>\s*(.*)/);var p=[];var b="";if(fn.length>0){fn.shift()}if(fn.length>0){b=fn.pop()}if(fn.length>0){p=fn.pop().replace(/^\s*|\s(?=\s)|\s*$|,/g,'').split(' ')}fn=((!/\s*return\s+/.test(b))?"return ":"")+b;p.push(fn);try{return Function.apply({},p)}catch(e){return null}};if(typeof(Array.prototype.where)==='undefined'){Array.prototype.where=function(f){var fn=f;if(typeof f=="string"){if((fn=lambda(fn))===null){throw "Syntax error in lambda string: "+f}}var res=[];var l=this.length;var p=[0,0,res];for(var i=1;i<arguments.length;i+=1){p.push(arguments[i])}for(var j=0;j<l;j+=1){if(typeof this[j]=="undefined"){continue}p[0]=this[j];p[1]=j;if(!!fn.apply(this,p)){res.push(this[j])}}return res}}if(!Array.prototype.forEach){Array.prototype.forEach=function(callback,thisArg){var T,k;if(this===null){throw new TypeError(' this is null or not defined')}var O=Object(this);var len=O.length>>>0;if(typeof callback!=="function"){throw new TypeError(callback+' is not a function')}if(arguments.length>1){T=thisArg}k=0;while(k<len){var kValue;if(k in O){kValue=O[k];callback.call(T,kValue,k,O)}k+=1}}}if(!Array.prototype.filter){Array.prototype.filter=function(fun ){'use strict';if(this===void 0||this===null){throw new TypeError()}var t=Object(this);var len=t.length>>>0;if(typeof fun!=='function'){throw new TypeError()}var res=[];var thisArg=arguments.length>=2?arguments[1]:void 0;for(var i=0;i<len;i+=1){if(i in t){var val=t[i];if(fun.call(thisArg,val,i,t)){res.push(val)}}}return res}}if(!Array.prototype.indexOf){Array.prototype.indexOf=function(searchElement,fromIndex){var k;if(this===null){throw new TypeError('"this" is null or not defined')}var O=Object(this);var len=O.length>>>0;if(len===0){return -1}var n= +fromIndex||0;if(Math.abs(n)===Infinity){n=0}if(n>=len){return -1}k=Math.max(n>=0?n:len-Math.abs(n),0);while(k<len){var kValue;if(k in O&&O[k]===searchElement){return k}k+=1}return -1}}if(typeof(String.prototype.localeCompare)==='undefined'){String.prototype.localeCompare=function(str,locale,options){return((this==str)?0:((this>str)?1:-1))}}
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

/* start of nexrender script */

var nexrender = {
    composition: null,
    compositionName: '/*COMPOSITION*/',
};

nexrender.types = [CompItem, FolderItem, FootageItem, AVLayer, ShapeLayer, TextLayer, CameraLayer, LightLayer, Property, PropertyGroup];

nexrender.typesMatch = function (types, layer) {
    return nexrender.types.filter(function (t) {
        return layer instanceof t;
    }).length > 0;
};

nexrender.getComposition = function (composition, callback) {
    if(!composition){ composition = nexrender.compositionName; }

    if (composition == nexrender.compositionName && nexrender.composition) {
        callback(nexrender.composition);
        return;
    }

    for (var i = 1; i <= app.project.items.length; i++) {
        var item = app.project.items[i];
        if (!item instanceof CompItem) {
            continue;
        }

        if(composition == "*"){
            callback(item)
            continue;
        }

        if (item.name != composition) {
            continue;
        }

        if(item.name == nexrender.compositionName){
            nexrender.composition = item;
        }

        callback(item);
        return;
    }
}

nexrender.layers = function (name, types, composition) {
    if (!types) types = nexrender.types;

    var layers = [];

    nexrender.getComposition(composition, function(comp){
        for (var j = 1; j <= comp.numLayers; j++) {
            var layer = comp.layer(j);
            if (nexrender.typesMatch(types, layer)) {
                layers.push(layer);
            }
        }

        return layers.filter(function (l) {
            return l.name == name;
        });
    });
};

/*return a layer by name*/
nexrender.layerName = function (name, types, composition) {
    var results = nexrender.layers(name, types, composition);

    if (results.length > 0) {
        return results[0];
    }

    return null;
};

/*return a layer by index*/
nexrender.layerIndex = function (index, composition) {
    return nexrender.getComposition(composition, function(comp){
        return comp.layer(index);
    })
}

nexrender.replaceFootage = function (layer, filepath) {
    if (!layer) { return false; }

    var file = new File(filepath);if (!file.exists) {
        return false;
    }

    var importOptions = new ImportOptions(file);
    //importOptions.importAs = ImportAsType.COMP; // you can do stuff like this at this point for PSDs
    var theImport = app.project.importFile(importOptions);
    layer.replaceSource(theImport, true);

    return true;
};

/* end of nexrender script */
/* start of custom user script */

/*USERSCRIPT*/

/* end of custom user script */
},{}]},{},[1]);
`
