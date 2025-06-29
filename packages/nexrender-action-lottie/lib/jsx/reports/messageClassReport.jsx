/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder, File, app */

$.__bodymovin.bm_messageClassReport = (function () {
    
    var reportMessageFactory = $.__bodymovin.bm_reportMessageFactory;

    function MessageClass() {
    }
    
    MessageClass.prototype.initializeMessages = function() {
        this.__messages = [];
    }

    MessageClass.prototype.addMessage = function(type, renderers, builder) {
        if(!this.__messages) {
            this.initializeMessages();
        }
        var reportMessage = reportMessageFactory(type, renderers, builder);
        this.__messages.push(reportMessage);
    }

    MessageClass.prototype.serializeMessages = function() {
        if(!this.__messages) {
            this.initializeMessages();
        }
        var messages = [];
        for(var i = 0; i < this.__messages.length; i += 1) {
            messages.push(this.__messages[i].serialize());
        }
        return messages;
    }
    
    return MessageClass;
}());