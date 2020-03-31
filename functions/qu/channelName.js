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
            var object = this;

            var ret = false;
            for(var i = 0; i < data.length; i++) {
                if(data.slice(i + 0, i + 9).equals(object.parameters.sysexHeader.currentHeader) == true && data[i + 9] == 0x02) {
                    //Find the end of the packet
                    var end = i;
                    for(var j = i; j < data.length; j++) {if(data[j] == 0xF7){end = j; break;}}

                    if(object.data["inputChannel"] === undefined){
                        object.data["inputChannel"] = {};
                    }

                    //Find the channel
                    var channelType = object.parameters.channelTypes["inputChannel"];
                    var channel = "unknown";
                    Object.keys(channelType).forEach(function(key2) {
                        if(parseInt(channelType[key2]) == parseInt(data[i + 10])) {
                            channel = key2;
                        }
                    });

                    object.data["inputChannel"][channel] = data.slice(i + 11, end).toString();

                    ret = true;
                }
            }

            //If we found something and sync is not active send it out!
            if(syncActive == false && ret == true) {
                var msg = {
                    "payload": {
                        "function": "channelName"
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
    }}
}