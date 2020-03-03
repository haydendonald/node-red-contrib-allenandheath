
//Functional
//B[ID] 63 [CH] B[ID] 62 17 B[N] 06 LV[00-7F]

var global = require("./modeGlobal.js");

module.exports = {
    channelValues: {},
    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel, returnPayload) {    
        if(msg.payload.function == "faderLevel") {
            //Validate

            //Need to add support for msg.payload.type="get/set"
            if(msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }

            
            //If no level was passed return the stored channel value
            if(Number.isInteger(parseInt(msg.payload.channel)) && (msg.payload.level === undefined || msg.payload.level === null)) {
                

                console.log(this.channelValues);
                if(this.channelValues[msg.payload.channelSelection] === undefined || this.channelValues[msg.payload.channelSelection][parseInt(msg.payload.channel)] === undefined) {
                    return "Value is not stored in memory. Please move the fader to get the value";
                }

                returnPayload({
                    "payload": {
                        "function": "faderLevel",
                        "channelSelection": msg.payload.channelSelection,
                        "channel": parseInt(msg.payload.channel),
                        "level": this.channelValues[msg.payload.channelSelection][parseInt(msg.payload.channel)]
                    }
                });
                return true;
            }

            if(!Number.isInteger(parseInt(msg.payload.channel))){return "No msg.payload.channel\n";}
            if(!Number.isInteger(parseInt(msg.payload.level))){return "No msg.payload.level\n";}

            var faderValue = parseInt(msg.payload.level);
            if(faderValue > 127){faderValue = 127;}
            if(faderValue < 0){faderValue = 0;}


            //Send out request
            var buffer = new Buffer(7);
            var channelSelection = global.setChannelSelection(msg.payload.channelSelection, midiChannel, msg.payload.channel)
            if(channelSelection == "ERROR") {return "Invalid Channel Selection";} 

            buffer.writeUInt8(0xB0 + channelSelection[0], 0);
            buffer.writeUInt8(0x63, 1);
            buffer.writeUInt8(channelSelection[1], 2);
            buffer.writeUInt8(0x62, 3);
            buffer.writeUInt8(0x17, 4);
            buffer.writeUInt8(0x06, 5);
            buffer.writeUInt8(faderValue, 6);
            return buffer;
        }
        else{
            return false;
        }
    },

    //Recieved data
    recieve: function recieve(midiChannel, data) {
        var msg = {payload:{}};
        msg.payload.function = "faderLevel";
        msg.payload.channelSelection = global.getChannelSelection(midiChannel, 0xB0, data[0], data[2]);
        if(msg.payload.channelSelection == "ERROR"){return false;}
        if(data[1] != 0x63){return false;}
        if(data[3] != 0x62){return false;}
        if(data[4] != 0x17){return false;}
        if(data[5] != 0x06){return false;}

        msg.payload.channel = data[2];
        msg.payload.level = data[6];
        if(this.channelValues[msg.payload.channelSelection] == undefined || this.channelValues[msg.payload.channelSelection] == null){this.channelValues[msg.payload.channelSelection] = {};}
        this.channelValues[msg.payload.channelSelection][msg.payload.channel] = msg.payload.level;
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}