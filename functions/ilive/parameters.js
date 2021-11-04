module.exports = {
    functions: {
        muteControl: require("./modeMuteControl.js"),
        faderLevel: require("./modeFaderLevel.js"),
        sceneRecall: require("./modeSceneRecall.js"),
        sendPing: require("./modeSendPing.js")
    },

    receiveBuffer: new Buffer.alloc(0),
    bufferClearer: undefined,

    recieve: function (msg, midiChannel, server) {
        var value = false;
        var self = this;

        //Add the data to the buffer until it is valid or times out
        self.receiveBuffer = Buffer.concat([self.receiveBuffer, msg]);

        for (var key in self.functions) {
            var func = self.functions[key];
            value = func.recieve(midiChannel, self.receiveBuffer, server, false, self);
            if (value !== false) {
                break;
            }
        }

        //After a second of inactivity clear the buffer
        clearTimeout(self.bufferClearer);
        self.bufferClearer = setTimeout(function() {
            self.receiveBuffer = new Buffer.alloc(0);
        }, 1000);

        return value;
    },

    //Reset this object
    reset: function () {
        var self = this;
        clearInterval(self.bufferClearer);
    },

    generatePacket: function (msg, server, midiChannel, returnPayload) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function (key) {
            if (value === false) {
                var func = temp.functions[key];
                value = func.generatePacket(msg, server, midiChannel, returnPayload);
            }
        });

        return value;
    },

    sendPing: function (server, midiChannel, successFunction) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function (key) {
            if (value === false) {
                var func = temp.functions[key];
                value = func.sendPing(server, midiChannel, successFunction);
            }
        });

        return value;
    },

    //Send message on initial connection
    initialConnection: function (server, midiChannel) {
        return true;
    }
}