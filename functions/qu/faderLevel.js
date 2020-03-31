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
                if(msg.payload.channelType === undefined && msg.payload.channel === undefined && msg.payload.level === undefined) {
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
                    var channelId = -1;
                    if(msg.payload.rawChannel !== undefined) {
                        channelId = parseInt(msg.payload.rawChannel);
                    }
                    else {
                        if(msg.payload.channelType === undefined){return "channelType is not specified";}
                        if(msg.payload.channel === undefined){return "channel is not specified";}

                        //Find the channel id
                        channelId = temp.parameters.channelTypes[msg.payload.channelType][msg.payload.channel];
                        if(channelId === undefined){return "channel id was not found";}

                    }
                    if(msg.payload.level === undefined){return "level is not specified";}
                    var level = (parseFloat(msg.payload.level) / 100) * 127;

                    //Generate the packet!
                    var retMsg = {
                        "payload": {
                            "function": "faderLevel"
                        }
                    }
                    
                    try {
                        temp.data[msg.payload.channelType][msg.payload.channel] = msg.payload.level;
                        Object.assign(retMsg.payload, temp.data);
                        callback(retMsg);
                    }
                    catch(e){}

                    var NRPNMSB = Buffer.from([(0xB0 + parseInt(midiChannel, 16)), 0x63, channelId]);
                    var NRPNLSB = Buffer.from([(0xB0 + parseInt(midiChannel, 16)), 0x62, 0x17]);
                    var dataMSB = Buffer.from([(0xB0 + parseInt(midiChannel, 16)), 0x06, level]);
                    var dataLSB = Buffer.from([(0xB0 + parseInt(midiChannel, 16)), 0x26, 0x07]);

                    return Buffer.concat([NRPNMSB, NRPNLSB, dataMSB, dataLSB]);
                }
            }

            return false;
        },

        //Recieved data
        recieve: function recieve(midiChannel, data, server, syncActive) {
            var object = this;

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

        //Ping
        sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
            return false;
        }
    }}
}