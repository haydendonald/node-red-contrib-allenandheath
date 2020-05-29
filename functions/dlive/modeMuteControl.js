
//Functional
//Mute 9[N] [CH] 7F/3F 9[N] [CH] 00

var global = require("./modeGlobal.js");

module.exports = {
    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        if(msg.payload.function == "muteControl") {

            //Need to add support for msg.payload.type="get/set"
            if(msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }

            //Validate
            if(!Number.isInteger(parseInt(msg.payload.channel))){return "No msg.payload.channel\n";}
            if(!(typeof(msg.payload.state) === "boolean")){return "No msg.payload.state\n";}

            //Send out request
            var state;
            if(msg.payload.state == true) {state = 0x7F;}else{state = 0x3F;}
            var channelSelection = global.setChannelSelection(msg.payload.channelSelection, midiChannel, msg.payload.channel)
            if(channelSelection == "ERROR") {return "Invalid Channel Selection";} 

            var buffer = new Buffer(6);
            buffer.writeUInt8((0x90 + channelSelection[0]), 0);
            buffer.writeUInt8(channelSelection[1], 1);
            buffer.writeUInt8(state, 2);
            buffer.writeUInt8((0x90 + channelSelection[0]), 3);
            buffer.writeUInt8(channelSelection[1], 4);
            buffer.writeUInt8(0x00, 5);
            return buffer;
        }
        else{
            return false;
        }
    },

    //Recieved data
    recieve: function recieve(midiChannel, data, server, syncActive) {
        var msg = {payload:{}};
        msg.payload.function = "muteControl";
        msg.payload.channelSelection = global.getChannelSelection(midiChannel, 0x90, data[0], data[1]);
        if(msg.payload.channelSelection == "ERROR"){return false;}
        if(data[1] != data[3]){return false;}
        msg.payload.channel = data[1];
        msg.payload.state = data[2] == 0x7F;
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, successFunction) {
        return false;
    }
}