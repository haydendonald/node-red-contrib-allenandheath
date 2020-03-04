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
        if(msg.payload.function == "channelName") {
            if(msg.payload.channelType === undefined && msg.payload.channel === undefined && msg.payload.name === undefined) {
                //Just return the stored information
                var msg = {
                    "payload": {
                        "function": "channelName"
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
                if(msg.payload.name === undefined){return "name is not specified";}

                //Generate the packet!
                var retMsg = {
                    "payload": {
                        "function": "channelName"
                    }
                }
                
                try {
                    temp.data[msg.payload.channelType][msg.payload.channel].name = msg.payload.name;
                    Object.assign(retMsg.payload, temp.data);
                    callback(retMsg);
                }
                catch(e) {}

                return Buffer.concat([Buffer.from(temp.parameters.sysexHeader.currentHeader), Buffer.from([0x03, channelId]), Buffer.from(msg.payload.name), Buffer.from([0xF7])]);
            }
        }


        return false;
    },

    //Recieved data
    recieve: function recieve(midiChannel, data, server, syncActive) {
        var temp = this;
    
        if(data[0] == 0x02) {
            if(temp.data["inputChannel"] === undefined){
                temp.data["inputChannel"] = {};
            }

            //Find the channel
            var channelType = temp.parameters.channelTypes["inputChannel"];
            var channel = "unknown";
            Object.keys(channelType).forEach(function(key2) {
                if(parseInt(channelType[key2]) == parseInt(data[1])) {
                    channel = key2;
                }
            });

            temp.data["inputChannel"][channel] = {
                "name": data.slice(2).toString(),
                "id": data[1]
            }

            if(syncActive == false) {
                var msg = {
                    "payload": {
                        "function": "channelName"
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
                "function": "channelName"
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