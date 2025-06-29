/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_layerCollectionReport = (function () {
    
    var layerReportHelper = $.__bodymovin.bm_layerReportHelper;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;

    function LayerCollection(layers, onComplete, onFail) {
        this.layers = layers;
        this.collection = [];
        this.currentLayerIndex = 0;
        this._onComplete = onComplete;
        this._onFail = onFail;
        this.onLayerComplete = this.onLayerComplete.bm_bind(this);
        this.onLayerFailed = this.onLayerFailed.bm_bind(this);
        this.processCurrentLayer = this.processCurrentLayer.bm_bind(this);
    }

    LayerCollection.prototype.process = function() {
        var layers = this.layers;
        var collection = this.collection;
        var i, len = layers.length;
        var layer;
        for (i = 0; i < len; i += 1) {
            layer = layers[i + 1];
            collection.push(layerReportHelper.createLayer(layer, this.onLayerComplete, this.onLayerFailed));
        }
        this.asynchronouslyProcessCurrentLayer();
    }
    
    LayerCollection.prototype.processCurrentLayer = function() {
        try {
            var currentLayer = this.collection[this.currentLayerIndex];
            if (currentLayer) {
                currentLayer.process();
            } else {
                this._onComplete();
            }
        } catch(error) {
            this._onFail(error);
        }
    }

    LayerCollection.prototype.asynchronouslyProcessCurrentLayer = function() {
        $.__bodymovin.reportScheduledMethod = this.processCurrentLayer;
        $.__bodymovin.reportScheduledMethod();
        // app.scheduleTask('$.__bodymovin.reportScheduledMethod();', 20, false);
    }

    LayerCollection.prototype.onLayerFailed = function(error) {
        if (error) {
            bm_eventDispatcher.log(error.message);
            bm_eventDispatcher.log(error.line);
            bm_eventDispatcher.log(error.fileName);
        }
        bm_eventDispatcher.log($.stack);
        this.collection[this.currentLayerIndex] = layerReportHelper.createFailedLayer(
            this.layers[this.currentLayerIndex + 1],
            this.onLayerComplete,
            this.onLayerFailed
        );
        this.processCurrentLayer();
    }

    LayerCollection.prototype.onLayerComplete = function() {
        this.currentLayerIndex += 1;
        this.asynchronouslyProcessCurrentLayer();
    }

    LayerCollection.prototype.serialize = function() {
        var layers = [];
        for (var i = 0; i < this.collection.length; i += 1) {
            layers.push(this.collection[i].serialize());
        }
        return {
            layers: layers,
        }
    }


    return function(layers, onComplete, onFail) {
    	return new LayerCollection(layers, onComplete, onFail);
    }
    
}());
