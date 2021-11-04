
//Functional
//B[ID] 63 [CH] 62 17 06 [LV00-7F]

module.exports = {
    //Send out
    generatePacket: function generatePacket(console, server, midiChannel) {
        if (msg.payload.function == "faderLevel") {

            //Need to add support for msg.payload.type="get/set"
            if (msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }


            //Validate
            if (!Number.isInteger(parseInt(msg.payload.channel))) { return "No msg.payload.channel\n"; }
            if (!Number.isInteger(parseInt(msg.payload.level))) { return "No msg.payload.level\n"; }

            var faderValue = parseInt(msg.payload.level);
            if (faderValue > 127) { faderValue = 127; }
            if (faderValue < 0) { faderValue = 0; }


            //Send out request
            var buffer = new Buffer(7);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(0x63, 1);
            buffer.writeUInt8(msg.payload.channel, 2);
            buffer.writeUInt8(0x62, 3);
            buffer.writeUInt8(0x17, 4);
            buffer.writeUInt8(0x06, 5);
            buffer.writeUInt8(faderValue, 6);
            return buffer;
        }
        else {
            return false;
        }
    },

    //Received data
    recieve: function recieve(midiChannel, data, server, syncActive, parent) {
        var msgs = [];
        var remove = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i] == (0xB0 + parseInt(midiChannel, 16))) {
                if (data[i + 1] == 0x63) {
                    if (data[i + 3] == 0x62) {
                        if (data[i + 4] == 0x17) {
                            if (data[i + 5] == 0x06) {
                                //We got a command!
                                msgs.push({
                                    "payload": {
                                        "function": "faderControl",
                                        "channel": data[i + 2],
                                        "level": data[i + 6]
                                    }
                                });

                                //Remove it from the buffer
                                remove.push(i);
                            }
                        }
                    }
                }
            }
        }

        //Remove all the index's from our buffer
        for (var i = 0; i < remove.length; i++) {
            data = Buffer.concat([data.slice(0, remove[i]), data.slice(remove[i] + 7)]);
        }
        parent.receiveBuffer = data;
        if(msgs.length == 0) {
            return false;
        }
        return [msgs];
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, successFunction) {
        return false;
    }
}