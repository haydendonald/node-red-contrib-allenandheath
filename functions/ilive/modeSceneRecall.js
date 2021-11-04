
//Functional
//B[ID] 63 [CH] 62 17 06 [LV00-7F]

module.exports = {
    scene: undefined,

    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel, callback) {
        var self = this;
        if (msg.payload.function == "sceneRecall") {


            //Send the stored values if we only get the function
            if (msg.payload.sceneNumber === undefined) {
                callback({
                    "payload": {
                        "function": "sceneRecall",
                        "sceneNumber": self.scene
                    }
                });
                return true;
            }

            //Need to add support for msg.payload.type="get/set"
            if (msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }


            //Validate
            if (!Number.isInteger(parseInt(msg.payload.sceneNumber))) { return "No msg.payload.sceneNumber\n"; }
            if (msg.payload.sceneNumber < 0 || msg.payload.sceneNumber > 128) { return "msg.payload.sceneNumber out of bounds. Needs to be between 0 and 128"; }

            //Send out request
            var offset = 0x00;
            var sceneNumber = msg.payload.sceneNumber;
            if (msg.payload.sceneNumber > 128) { offset = 0x01; sceneNumber - 127; }
            var buffer = new Buffer(5);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(0x00, 1);
            buffer.writeUInt8(offset, 2);
            buffer.writeUInt8((0xC0 + parseInt(midiChannel, 16)), 3);
            buffer.writeUInt8(sceneNumber, 4);
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
            if (data[i] == (0xB0 + parseInt(midiChannel, 16))) {
                if (data[i + 1] == 0x00) {
                    if (data[i + 3] == (0xC0 + parseInt(midiChannel, 16))) {
                        //We got a command!
                        msgs.push({
                            "payload": {
                                "function": "sceneRecall",
                                "sceneNumber": (data[i + 2] * 129) + data[i + 4]
                            }
                        });

                        self.scene = (data[i + 2] * 129) + data[i + 4];

                        //Remove it from the buffer
                        remove.push(i);
                    }
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