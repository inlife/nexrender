/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_effectsReportFactory = (function () {
    
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var effectMessageFactory = $.__bodymovin.bm_reportEffectMessageFactory;
    var effectsMessages = $.__bodymovin.bm_reportsEffectMessages;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    var skippedEffectMatchNames = {
        'ADBE Effect Built In Params': 'ADBE Effect Built In Params',
        'Pseudo/Bodymovin Text Props 3': 'Pseudo/Bodymovin Text Props 3',
    }

    var supportedEffects = [
        'ADBE Tint',
        'ADBE Fill',
        'ADBE Stroke',
        'ADBE Tritone',
        'ADBE Pro Levels2',
        'ADBE Drop Shadow',
        'ADBE Set Matte3',
        'ADBE Gaussian Blur 2',
    ]

    function Effects(effects) {
        this.effectsProperty = effects;
        this.messages = [];
        this._addedEffects = [];
        this.process();
    }

    Effects.prototype.getMessageByTypeAndRenderers = function(type, renderers, builder) {

        var key = type + '_' + renderers.join('-');
        for (var i = 0; i < this.messages.length; i += 1) {
            if (this.messages[i].key === key) {
                return this.messages[i].message;
            }
        }
        var message = {
            key: key,
            message: effectMessageFactory(type, renderers, builder),
        }
        this.messages.push(message);
        return message.message;
    }

    Effects.prototype.addEffect = function(effectData) {
        var messages = effectData.messages;
        var messageData;
        for (var i = 0; i < messages.length; i += 1) {
            messageData = messages[i];
            var message = this.getMessageByTypeAndRenderers(messageData.type, messageData.renderers, messageData.builder);
            message.addEffect(effectData.name);
        }
    }
    Effects.prototype.process = function() {
        for (var i = 0; i < this.effectsProperty.numProperties; i += 1) {
            var effectElement = this.effectsProperty(i + 1);
            bm_eventDispatcher.log('effectElement.matchName')
            bm_eventDispatcher.log(effectElement.matchName)
            if (effectElement.enabled && !skippedEffectMatchNames[effectElement.matchName]) {
                if (effectsMessages[effectElement.matchName]) {
                    this.addEffect(effectsMessages[effectElement.matchName]);
                } else {
                    this.addUnhandledEffect(effectElement);
                }
                this.checkSupportedEffects(effectElement.matchName)
            }
        }
    }

    Effects.prototype.checkSupportedEffects = function(effectName) {
        for (var i = 0; i < supportedEffects.length; i += 1) {
            if (supportedEffects[i] === effectName) {
                this._addedEffects.push(effectName);
            }
        }
    }

    Effects.prototype.hasSupportedEffects = function() {
        return this._addedEffects.length > 0;
    }

    Effects.prototype.addUnhandledEffect = function(effect) {
        var message = this.getMessageByTypeAndRenderers(messageTypes.ERROR,
            [
                rendererTypes.BROWSER,
                rendererTypes.IOS,
                rendererTypes.ANDROID,
                rendererTypes.SKOTTIE
            ]);
        message.addEffect(effect.name);
    }

    Effects.prototype.serialize = function() {
        if (this.messages.length === 0) {
            return undefined
        } else {
            var messages = [];
            for (var i = 0; i < this.messages.length; i += 1) {
                messages.push(this.messages[i].message.serialize());
            }
            return messages;
        }
    }

    return function(effects) {
        return new Effects(effects);
    }
    
}());