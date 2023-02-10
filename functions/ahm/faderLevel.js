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
            var temp = this;
            if(msg.payload.function == "faderLevel") {
                if(msg.payload.channel === undefined && msg.payload.level === undefined && msg.payload.zone == undefined) {
                    //Just return the stored information
                    var msg = {
                        "payload": {
                            "function": "faderLevel"
                        }
                    }
                    
                    Object.assign(msg.payload, temp.data);

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
                    if(channelNumber == undefined || zoneNumber == undefined){return "channel or zone id was not found. " + channelNumber + " " + zoneNumber + " " + msg.payload.channel + " " + msg.payload.zone;}
                    
                    if(msg.payload.level === undefined){return "level is not specified";}
                    var level = (parseFloat(msg.payload.level) / 100) * 127;

                    //Generate the packet!
                    var retMsg = {
                        "payload": {
                            "function": "faderLevel"
                        }
                    }
                    
                    try {
                        temp.data[msg.payload.channel][msg.payload.zone] = msg.payload.level;
                        Object.assign(retMsg.payload, temp.data);
                        callback(retMsg);
                    }
                    catch(e){}

                    var header = Buffer.from(temp.parameters.sysexHeader.allCall);
                    var input = Buffer.from([0x00, 0x02, channelNumber]);
                    var output = Buffer.from([0x01, zoneNumber]);
                    var level = Buffer.from([level, 0xF7]);

                    // final output should look like SysEx Header, 00, 02, CH, SndN, SndCH, LV, F7
                    // for sending input 1 to zone 1 at -inf
                    // F0, 00, 00, 1A, 50, 12, 01, 00, 00, 02, 00, 01, 00, 00, f7 
                    return Buffer.concat([header, input, output, level]);
                }
            }

            return false;
        },

        //Recieved data
        recieve: function recieve(midiChannel, data, server, syncActive) {
            var object = this;

            object.data = data;

            return true;

            var ret = false;
            for(var i = 0; i < data.length; i++) {
                if(data[i + 0] == (0xB0 + parseInt(midiChannel, 16)) && data[i + 3] == (0xB0 + parseInt(midiChannel, 16)) && data[i + 6] == (0xB0 + parseInt(midiChannel, 16)) && data[i + 9] == (0xB0 + parseInt(midiChannel, 16))) {
                    if(data[i + 1] == 0x63 && data[i + 4] == 0x62 && data[i + 7] == 0x06 && data[i + 10] == 0x26 && data[i + 11] == 0x07) {
                        //Valid NRPN command

                        //Fader
                        if(data[i + 5] == 0x17) {
                            if(object.data["inputChannel"] === undefined){
                                object.data["inputChannel"] = {};
                            }

                            //Find the channe;
                            var channelType = undefined;
                            var channel = undefined;
                            Object.keys(object.parameters.channelTypes).forEach(function(key) {
                                Object.keys(object.parameters.channelTypes[key]).forEach(function(key2) {

                                    if(parseInt(object.parameters.channelTypes[key][key2]) == parseInt(data[i + 2])) {
                                        channelType = key;
                                        channel = key2;
                                    }
                                });
                            });

                            if(object.data[channelType] === undefined){
                                object.data[channelType] = {};
                            }
                            object.data[channelType][channel] = (data[i + 8] / 127) * 100;

                            ret = true;
                        }
                    }
                }
            }

            //If we found something and sync is not active send it out!
            if(syncActive == false && ret == true) {
                var msg = {
                    "payload": {
                        "function": "faderLevel"
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
                    "function": "faderLevel"
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