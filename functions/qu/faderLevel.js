module.exports = {
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
                    temp.data[msg.payload.channelType][msg.payload.channel] = level;
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
        var temp = this;
        if(data[0] == (0xB0 + parseInt(midiChannel, 16))){
            //NRPN command
            var messages = [];
            var current = [];
            for(var i = 0; i < data.length; i++) {
                current.push(data[i]);
                if(current.length == 12) {
                    //We have a message process it

                    var valid = true;
                    if(current[1] != 0x63){valid = false;}
                    if(current[3] != (0xB0 + parseInt(midiChannel, 16))){valid = false;}
                    if(current[4] != 0x62){valid = false;}
                    if(current[5] != 0x17){valid = false;}
                    if(current[6] != (0xB0 + parseInt(midiChannel, 16))){valid = false;}
                    if(current[7] != 0x06){valid = false;}
                    if(current[9] != (0xB0 + parseInt(midiChannel, 16))){valid = false;}
                    if(current[10] != 0x26){valid = false;}
                    if(current[11] != 0x07){valid = false;}

                    if(valid == true){
                        var channelType = undefined;
                        var channel = undefined;
                        Object.keys(temp.parameters.channelTypes).forEach(function(key) {
                            Object.keys(temp.parameters.channelTypes[key]).forEach(function(key2) {

                                if(parseInt(temp.parameters.channelTypes[key][key2]) == parseInt(current[2])) {
                                    channelType = key;
                                    channel = key2;
                                }
                            });
                        });

                        if(temp.data[channelType] === undefined){
                            temp.data[channelType] = {};
                        }
                        temp.data[channelType][channel] = current[8];
                    }
                    
                    current = [];
                }
            }

            if(syncActive === false) {
                var msg = {
                    "payload": {
                        "function": "faderLevel"
                    }
                }
                
                Object.assign(msg.payload, temp.data);
                return msg;
            }
            return true;
        }

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
}