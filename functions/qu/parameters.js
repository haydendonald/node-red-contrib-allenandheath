module.exports = {
    sysexHeader: {
        allCall: [0xF0, 0x00, 0x00, 0x1A, 0x50, 0x11, 0x01, 0x00, 0x7F],
        currentHeader: undefined
    },

    functions: {
        endInitialSync: require("./endInitialSync.js"),
        sendPing: require("./sendPing.js"),
    },

    recieve: function(msg, midiChannel, server, syncActive) {
        //Messages are separated by 0xF7
        var messages = [];
        var current = [];
        for(var i = 0; i < msg.length; i++) {
            if(msg[i] !== 0xF7) {
                current.push(msg[i]);
            }
            else {
                messages.push(current);
                current = [];
            }
        }

        if(messages.length == 0){messages.push(current);}

        var value = false;
        for(var i = 0; i < messages.length; i++) {
            var temp = this;

            if(temp.sysexHeader.currentHeader === undefined) {
                //Attempt to get the sysex header
                temp.functions["endInitialSync"].recieve(midiChannel, Buffer.from(messages[i]), server, syncActive);
            }
            else {
                //Check that the sysex header is correct and remove it if needed
                var message = Buffer.from(messages[i]);
                if(message.slice(0, 9).equals(temp.sysexHeader.currentHeader) == true) {
                    message = message.slice(9);
                }
                
                //Find the function and process
                Object.keys(temp.functions).forEach(function(key) {
                    value = temp.functions[key].recieve(midiChannel, message, server, syncActive); //Needs to handle breaking when the command worked
                });
            }
        }

        return value;
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
        //Setup supported functions
        var temp = this;
        Object.keys(this.functions).forEach(function(func){
            var mode = temp.functions[func];   
            mode.setup(temp);
        });

        //Ask for system state
        var buffer = Buffer.concat([new Buffer.from(this.sysexHeader.allCall), new Buffer.from([0x10, 0x01, 0xF7])]);
        server.write(buffer);
        return true;
    }
}