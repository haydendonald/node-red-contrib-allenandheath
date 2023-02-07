module.exports = {
    object: function() { return {
        parameters: undefined,
        data: {},

        setup: function(parameters) {
            this.parameters = parameters;
        },

        reset: function() {
            data = {};
        },

        //Send out
        generatePacket: function generatePacket(msg, server, midiChannel, callback) {
            var object = this;
            if(msg.payload.function == "muteControl") {
                if(msg.payload.channel === undefined && msg.payload.zone == undefined) {
                    //Just return the stored information
                    var msg = {
                        "payload": {
                            "function": "muteControl"
                        }
                    }
                    
                    Object.assign(msg.payload, object.data);

                    callback(msg);
                    return true;
                }
                else {
                    var channelNumber = -1;
                    var zoneNumber = -1;

                    if(msg.payload.channel == undefined){return "channel not specified";}
                    if(msg.payload.zone == undefined){return "zone not specified";}

                    channelNumber = this.toHex(msg.payload.channel);
                    zoneNumber = this.toHex(msg.payload.zone);

                    //SysEx Header, 0N, 01, 0F, 03, CH, SndN, SndCH, F7

                    var header = Buffer.from(temp.parameters.sysexHeader.allCall);
                    var input = Buffer.from([0x00, 0x01, 0x0F, 0x03, channelNumber]);
                    var output = Buffer.from([0x01, zoneNumber]);
                    var ending = Buffer.from([0xF7]);

                    return Buffer.from([header, input, output, ending]);
                }
            }

            return false;
        },

        //Recieved data
        recieve: function recieve(midiChannel, data, server, syncActive) {
            var object = this;

            var ret = false;
            for(var i = 0; i < data.length; i++) {
                if(data[i + 0] == (0x90 + parseInt(midiChannel, 16))) {
                    if(data[i + 2] == 0x7F || data[i + 2] == 0x3F) {
                        if(object.data["inputChannel"] === undefined){
                            object.data["inputChannel"] = {};
                        }

                        //Find the channe;
                        var channelType = undefined;
                        var channel = undefined;
                        Object.keys(object.parameters.channelTypes).forEach(function(key) {
                            Object.keys(object.parameters.channelTypes[key]).forEach(function(key2) {

                                if(parseInt(object.parameters.channelTypes[key][key2]) == parseInt(data[i + 1])) {
                                    channelType = key;
                                    channel = key2;
                                }
                            });
                        });

                        if(object.data[channelType] === undefined){
                            object.data[channelType] = {};
                        }
                        object.data[channelType][channel] = data[i + 2] == 0x7F;

                        ret = true;
                    }
                }
            }

            //If we found something and sync is not active send it out!
            if(syncActive == false && ret == true) {
                var msg = {
                    "payload": {
                        "function": "muteControl"
                    }
                }
                
                Object.assign(msg.payload, object.data);

                return msg;
            }
            else if(ret == true){return true;}

            return false;
        },

        //Send the data
        getData() {
            var msg = {
                "payload": {
                    "function": "muteControl"
                }
            }
            
            Object.assign(msg.payload, this.data);
            return msg;
        },

        toHex(num) {
            var temp = num - 1;
            var hex = temp.toString(16);
            return "0x" + "0".repeat(2 - hex.length) + hex;
        },

        //Ping
        sendPing: function sendPing(server, midiChannel, successFunction) {
            return false;
        }
    }}
}