/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_propertyReport = (function () {
    
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var settingsHelper = $.__bodymovin.bm_settingsHelper;

    function Property(property) {
        this.property = property;
        this.process();
    }

    generalUtils.extendPrototype(Property, MessageClass);

    Property.prototype.processExpressions = function() {
        var property = this.property;
        if (property.expressionEnabled && !property.expressionError && !settingsHelper.shouldBakeExpressions()) {
            this.addMessage(messageTypes.ERROR,
            [
                rendererTypes.SKOTTIE,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
            ],
            builderTypes.EXPRESSIONS);
            if (property.expression.indexOf('wiggle(') !== -1) {
                this.addMessage(messageTypes.ERROR,
                [
                    rendererTypes.BROWSER,
                    rendererTypes.SKOTTIE,
                    rendererTypes.IOS,
                    rendererTypes.ANDROID,
                ],
                builderTypes.WIGGLE);
            }
        }
    }

    Property.prototype.areValuesEqual = function(value1, value2) {
        if (typeof value1 === 'number') {
            return value1 === value2;
        } else if (value1.length) {
            for (var i = 0; i < value1.length; i += 1) {
                if (value1[i] !== value2[i]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    Property.prototype.checkModifiedValue = function(value) {
        if (!this.areValuesEqual(this.property.value, value)
        || this.property.numKeys > 1
        || (this.property.expressionEnabled && !this.property.expressionError)
        ) {
            return true;
        } else {
            return false;
        }
    }

    Property.prototype.process = function() {
        this.processExpressions();
    }

    Property.prototype.serialize = function() {
    	return this.serializeMessages();
    }


    return function(property) {
    	return new Property(property);
    }
    
}());