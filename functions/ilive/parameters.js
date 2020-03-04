module.exports = {
    functions: {
        muteControl: require("./modeMuteControl.js"),
        faderLevel: require("./modeFaderLevel.js"),
        sceneRecall: require("./modeSceneRecall.js"),
        sendPing: require("./modeSendPing.js")
    },

    recieve: function(msg, midiChannel, server) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function(key){
            if(value === false) {
                var func = temp.functions[key];
                value = func.recieve(midiChannel, msg, server, false);
            }
        });

        return value;
    },

    //Reset this object
    reset: function() {
    },

    generatePacket: function(msg, server, midiChannel, returnPayload) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function(key){
            if(value === false) {
                var func = temp.functions[key];
                value = func.generatePacket(msg, server, midiChannel, returnPayload);
            }
        });

        return value;
    },

    sendPing: function(server, midiChannel, recentlySentMessage, successFunction) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function(key){
            if(value === false) {
                var func = temp.functions[key];
                value = func.sendPing(server, midiChannel, recentlySentMessage, successFunction);
            }
        });

        return value;
    },

    //Send message on initial connection
    initialConnection: function(server, midiChannel) {
        return true;
    }
}