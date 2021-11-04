
//Functional
//Mute On 9[N] [CH] 7F [CH] 00
//Mute Off 9[N] [CH] 3F [CH] 00

module.exports = {
    values: {},

    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel, callback) {
        var self = this;
        if (msg.payload.function == "muteControl") {

            //Send the stored values if we only get the function
            if (msg.payload.channel === undefined && msg.payload.state === undefined) {
                callback({
                    "payload": {
                        "function": "muteControl",
                        "states": self.values
                    }
                });
                return true;
            }

            //Need to add support for msg.payload.type="get/set"
            if (msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }

            //Validate
            if (!Number.isInteger(parseInt(msg.payload.channel))) { return "No msg.payload.channel\n"; }
            if (!(typeof (msg.payload.state) === "boolean")) { return "No msg.payload.state\n"; }

            //Send out request
            var state;
            if (msg.payload.state == true) { state = 0x7F; } else { state = 0x3F; }
            var buffer = new Buffer(5);
            buffer.writeUInt8((0x90 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(msg.payload.channel, 1);
            buffer.writeUInt8(state, 2);
            buffer.writeUInt8(msg.payload.channel, 3);
            buffer.writeUInt8(0x00, 4);

            //Send our new value to the output
            self.values[msg.payload.channel] = msg.payload.state;
            callback({
                "payload": {
                    "function": "muteControl",
                    "states": self.values
                }
            });
            return buffer;
        }
        else {
            return false;
        }
    },

    //Recieved data
    recieve: function recieve(midiChannel, data, server, syncActive, parent) {
        var self = this;
        var msgs = [];
        var remove = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i] == (0x90 + parseInt(midiChannel, 16))) {
                if (data[i + 1] == data[i + 3]) {
                    //We got a command!
                    msgs.push({
                        "payload": {
                            "function": "muteControl",
                            "channel": data[i + 1],
                            "state": data[i + 2] == 0x7F
                        }
                    });

                    self.values[data[i + 1]] = data[i + 2] == 0x7F;

                    //Remove it from the buffer
                    remove.push(i);
                }
            }
        }

        //Remove all the index's from our buffer
        for (var i = 0; i < remove.length; i++) {
            data = Buffer.concat([data.slice(0, remove[i]), data.slice(remove[i] + 5)]);
        }
        parent.receiveBuffer = data;
        if (msgs.length == 0) {
            return false;
        }
        return [msgs];
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, successFunction) {
        return false;
    }
}