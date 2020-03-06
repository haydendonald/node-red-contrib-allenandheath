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
        var object = this;
        if(msg.payload.function == "muteControl") {
            if(msg.payload.channelType === undefined && msg.payload.channel === undefined && msg.payload.level === undefined) {
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
                var channelId = -1;
                if(msg.payload.rawChannel !== undefined) {
                    channelId = parseInt(msg.payload.rawChannel);
                }
                else {
                    if(msg.payload.channelType === undefined){return "channelType is not specified";}
                    if(msg.payload.channel === undefined){return "channel is not specified";}

                    //Find the channel id
                    channelId = object.parameters.channelTypes[msg.payload.channelType][msg.payload.channel];
                    if(channelId === undefined){return "channel id was not found";}

                }
                if(msg.payload.state === undefined){return "state is not specified";}
                var state = msg.payload.state == true ? 0x7F : 0x3F;

                //Generate the packet!
                var retMsg = {
                    "payload": {
                        "function": "muteControl"
                    }
                }
                
                try {
                    object.data[msg.payload.channelType][msg.payload.channel] = msg.payload.state;
                    Object.assign(retMsg.payload, object.data);
                    callback(retMsg);
                }
                catch(e){}

                return Buffer.from([(0x90 + parseInt(midiChannel, 16)), channelId, state, (0x80 + parseInt(midiChannel, 16)), channelId, 0x00]);
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

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}