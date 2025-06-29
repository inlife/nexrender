/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_maskReportFactory = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var propertyReport = $.__bodymovin.bm_propertyReport;
    var getMaskType = $.__bodymovin.getMaskType;
    var maskTypes = $.__bodymovin.maskTypes;

    function Mask(mask) {
        this.mask = mask;
        this.process();
    }

    generalUtils.extendPrototype(Mask, MessageClass);

    Mask.prototype.process = function() {
        this.processProperties()
        this.processMode()
    }
    Mask.prototype.processMode = function() {

        var mode = getMaskType(this.mask.maskMode);
        if (mode === maskTypes.DARKEN || mode === maskTypes.LIGHTEN) {
            this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.BROWSER,
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.UNSUPPORTED_MASK_MODE)
        }
    }

    Mask.prototype.processProperties = function() {
        var opacityProperty = this.mask.property('Mask Opacity');
        this.opacity = propertyReport(opacityProperty);
        if (this.opacity.checkModifiedValue(100)) {
            this.opacity.addMessage(messageTypes.ERROR,
            [
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.UNSUPPORTED_PROPERTY)
        }
        this.expansion = propertyReport(this.mask.property('Mask Expansion'));
        if (this.expansion.checkModifiedValue(0)) {
            this.expansion.addMessage(messageTypes.ERROR,
            [
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.UNSUPPORTED_PROPERTY)
        }
        this.feather = propertyReport(this.mask.property('Mask Feather'));
        if (this.feather.checkModifiedValue([0,0])) {
            this.feather.addMessage(messageTypes.ERROR,
            [
                rendererTypes.BROWSER,
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.UNSUPPORTED_PROPERTY)
        }
        this.path = propertyReport(this.mask.property('maskShape'));

    }

    Mask.prototype.serialize = function() {
        return {
            name: this.mask.name,
            messages: this.serializeMessages(),
            opacity: this.opacity.serialize(),
            expansion: this.expansion.serialize(),
            feather: this.feather.serialize(),
            path: this.path.serialize(),
        }
    }

    return function(mask) {
        return new Mask(mask);
    }
    
}());