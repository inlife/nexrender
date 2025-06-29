/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_textSelectorReport = (function () {
    
    var MessageClass = $.__bodymovin.bm_messageClassReport;
    var generalUtils = $.__bodymovin.bm_generalUtils;
    var bm_eventDispatcher = $.__bodymovin.bm_eventDispatcher;
    var animatorMessageFactory = $.__bodymovin.bm_reportAnimatorSelectorMessageFactory;
    var rendererTypes = $.__bodymovin.bm_reportRendererTypes;
    var messageTypes = $.__bodymovin.bm_reportMessageTypes;
    var builderTypes = $.__bodymovin.bm_reportBuilderTypes;

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

    var defaultMessageType = messageTypes.ERROR;

    var unsupportedProperties = {
    }

    function TextSelector(selector) {
        this.selector = selector;
        this.messages = [];
        this.selectors = [];
        this.process();
    }
    
    generalUtils.extendPrototype(TextSelector, MessageClass);

    TextSelector.prototype.getMessageByTypeAndRenderers = function(type, renderers) {

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

    TextSelector.prototype.addProperty = function(selectorData) {
        var messages = selectorData.messages;
        var messageData;
        for (var i = 0; i < messages.length; i += 1) {
            messageData = messages[i];
            var message = this.getMessageByTypeAndRenderers(messageData.type, messageData.renderers);
            message.addProperty(selectorData.name);
        }
    }

    TextSelector.prototype.processSelectorProperties = function(selectorProperty) {
        var advancedProperty = selectorProperty.property('ADBE Text Range Advanced');
        var isRandomized = advancedProperty.property("ADBE Text Randomize Order").value;
        if (isRandomized === 1) {
            this.addProperty({
                messages: [
                    {
                        type: defaultMessageType,
                        renderers: onlyBrowserRenderers,
                    }
                ],
                name: 'Randomize',
            })
        }
    }

    TextSelector.prototype.processSelector = function() {
        var propertyName = this.selector.matchName;
        if (propertyName === 'ADBE Text Selector') {
            this.processSelectorProperties(this.selector)
        } else if (propertyName === 'ADBE Text Expressible Selector'
            || propertyName === 'ADBE Text Wiggly Selector'
        ) {
            this.addMessage(defaultMessageType,
            defaultRenderers,
            builderTypes.TEXT_SELECTOR_TYPE);
        };
    }

    TextSelector.prototype.process = function() {
        this.processSelector();
    }

    TextSelector.prototype.serialize = function() {
        var messages = this.serializeMessages()
        var i
        for (i = 0; i < this.messages.length; i += 1) {
            messages.push(this.messages[i].message.serialize());
        }

        return {
            messages: messages,
            name: this.selector.name,
        };
    }

    return function(element) {
        return new TextSelector(element);
    }
    
}());