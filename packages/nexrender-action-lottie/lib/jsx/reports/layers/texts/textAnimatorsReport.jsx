/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_textAnimatorsReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var animatorMessageFactory = $.__bodymovin.bm_reportAnimatorMessageFactory;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var textSelector = $.__bodymovin.bm_textSelectorReport;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;

    var defaultRenderers = [
        rendererTypes.BROWSER,
        rendererTypes.IOS,
        rendererTypes.ANDROID,
        rendererTypes.SKOTTIE
    ];
    var onlyBrowserRenderers = [
        rendererTypes.IOS,
        rendererTypes.ANDROID,
        rendererTypes.SKOTTIE
    ];
    var onlySkottieRenderers = [
        rendererTypes.BROWSER,
        rendererTypes.IOS,
        rendererTypes.ANDROID,
    ];

    var defaultMessageType = messageTypes.ERROR;

    var unsupportedProperties = {
        'ADBE Text Line Anchor': {
        },
        'ADBE Text Track Type': {
        },
        'ADBE Text Character Replace': {
        },
        'ADBE Text Character Offset': {
        },
        'ADBE Text Line Spacing': {
            message: [
                {
                    type: defaultMessageType,
                    renderers: [
                        rendererTypes.BROWSER,
                        rendererTypes.IOS,
                        rendererTypes.ANDROID
                    ],
                }
            ]
        },
        'ADBE Text Blur': {
            renderers: onlySkottieRenderers,
        },
        'ADBE Text Anchor Point 3D': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Skew': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Skew Axis': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Fill Hue': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Fill Saturation': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Fill Brightness': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Stroke Hue': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Stroke Saturation': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Stroke Brightness': {
            renderers: onlyBrowserRenderers,
        },
        'ADBE Text Stroke Width': {
            renderers: onlyBrowserRenderers,
        }
    }

    function Animator(element) {
        this.element = element;
        this.messages = [];
        this.selectors = [];
        this.process();
    }
    
    generalUtils.extendPrototype(Animator, MessageClass);

    Animator.prototype.getMessageByTypeAndRenderers = function(type, renderers) {

        var key = type + '_' + renderers.join('-');
        for (var i = 0; i < this.messages.length; i += 1) {
            if (this.messages[i].key === key) {
                return this.messages[i].message;
            }
        }
        var message = {
            key: key,
            message: animatorMessageFactory(type, renderers),
        }
        this.messages.push(message);
        return message.message;
    }

    Animator.prototype.addProperty = function(animatorData) {
        var messages = animatorData.messages;
        var messageData;
        for (var i = 0; i < messages.length; i += 1) {
            messageData = messages[i];
            var message = this.getMessageByTypeAndRenderers(messageData.type, messageData.renderers);
            message.addProperty(animatorData.name);
        }
    }

    Animator.prototype.processProperties = function(animatorProperty) {
        var i, len = animatorProperty.numProperties;
        var property;
        for (i = 0; i < len; i += 1) {
            property = animatorProperty.property(i + 1);
            if (property.canSetExpression) {
                if (unsupportedProperties[property.matchName]) {
                    var propertyData = unsupportedProperties[property.matchName];
                    this.addProperty({
                        messages: propertyData.message || [
                            {
                                type: propertyData.type || defaultMessageType,
                                renderers: propertyData.renderers || defaultRenderers,
                            }
                        ],
                        name: property.name,
                    })
                }
            }
        }
    }

    Animator.prototype.processSelectors = function(selectorProperty) {
        var i, len = selectorProperty.numProperties;
        var property;
        for (i = 0; i < len; i += 1) {
            property = selectorProperty.property(i + 1);
            this.selectors.push(textSelector(property));
        }
    }

    Animator.prototype.processAnimator = function() {
        var i, len = this.element.numProperties;
        var property
        for (i = 0; i < len; i += 1) {
            property = this.element.property(i + 1);
            if (property.matchName === 'ADBE Text Animator Properties') {
                this.processProperties(property);
            } else if (property.matchName === 'ADBE Text Selectors') {
                this.processSelectors(property);
            }
        }
    }

    Animator.prototype.process = function() {
        this.processAnimator();
    }

    Animator.prototype.serialize = function() {
        var messages = [];
        var i
        for (i = 0; i < this.messages.length; i += 1) {
            messages.push(this.messages[i].message.serialize());
        }
        var selectors = [];
        for (i = 0; i < this.selectors.length; i += 1) {
            selectors.push(this.selectors[i].serialize());
        }
        return {
            messages: messages,
            selectors: selectors,
            name: this.element.name,
        };
    }

    return function(element) {
        return new Animator(element);
    }
    
}());