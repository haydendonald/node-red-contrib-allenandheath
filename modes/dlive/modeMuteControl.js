
//Functional
//Mute 9[N] [CH] 7F/3F 9[N] [CH] 00

module.exports = {
    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        if(msg.payload.mode == "muteControl") {
            //Validate
            if(!Number.isInteger(parseInt(msg.payload.channel))){return "No msg.payload.channel\n";}
            if(!(typeof(msg.payload.state) === "boolean")){return "No msg.payload.state\n";}

            //Send out request
            var state;
            if(msg.payload.state == true) {state = 0x7F;}else{state = 0x3F;}
            var buffer = new Buffer(6);
            buffer.writeUInt8((0x90 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(msg.payload.channel, 1);
            buffer.writeUInt8(state, 2);
            buffer.writeUInt8((0x90 + parseInt(midiChannel, 16)), 3);
            buffer.writeUInt8(msg.payload.channel, 4);
            buffer.writeUInt8(0x00, 5);
            return buffer;
        }
        else{
            return false;
        }
    },

    //Recieved data
    recieve: function recieve(midiChannel, data) {
        var msg = {payload:{}};
        msg.payload.mode = "muteControl";
        if(data[0] != (0x90 + parseInt(midiChannel, 16))){return false;}
        if(data[1] != data[4]){return false;}
        msg.payload.channel = data[1];
        msg.payload.state = data[2] == 0x7F;
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}