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
        if(msg.payload.function == "sceneRecall") {
            if(msg.payload.scene === undefined) {
                //Just return the stored information
                var msg = {
                    "payload": {
                        "function": "sceneRecall"
                    }
                }
                
                Object.assign(msg.payload, temp.data);

                callback(msg);
                return true;
            }
            else {   
                if(msg.payload.scene === undefined){return "scene is not specified";}

                //Generate the packet!
                var retMsg = {
                    "payload": {
                        "function": "sceneRecall"
                    }
                }
                
                try {
                    temp.data[msg.payload.channelType][msg.payload.channel].scene = parseInt(msg.payload.scene);
                    Object.assign(retMsg.payload, temp.data);
                    callback(retMsg);
                }
                catch(e) {}

                return Buffer.from([(0xB0 + parseInt(midiChannel, 16)), 0x00, 0x00, (0xB0 + parseInt(midiChannel, 16)), 0x20, 0x00, (0xC0 + parseInt(midiChannel, 16)), parseInt(msg.payload.scene) - 1]);
            }
        }


        return false;
    },

    //Recieved data
    recieve: function recieve(midiChannel, data, server, syncActive) {
        var object = this;

        var ret = false;
        for(var i = 0; i < data.length; i++) {
            if(data[i + 0] == (0xB0 + parseInt(midiChannel, 16)) && data[i + 1] == 0x00 && data[i + 2] == 0x00 && data[i + 3] == (0xB0 + parseInt(midiChannel, 16)) && data[i + 4] == 0x20 && data[i + 5] == 0x00 && data[i + 6] == (0xC0 + parseInt(midiChannel, 16))) {
                object.data["currentScene"] = data[i + 7] + 1;
                ret = true;
            }
        }

        //If we found something and sync is not active send it out!
        if(syncActive == false && ret == true) {
            var msg = {
                "payload": {
                    "function": "sceneRecall"
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
                "function": "sceneRecall"
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