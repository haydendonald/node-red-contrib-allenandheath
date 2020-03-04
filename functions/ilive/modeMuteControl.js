
//Functional
//Mute On 9[N] [CH] 7F [CH] 00
//Mute Off 9[N] [CH] 3F [CH] 00

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
            var buffer = new Buffer(5);
            buffer.writeUInt8((0x90 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(msg.payload.channel, 1);
            buffer.writeUInt8(state, 2);
            buffer.writeUInt8(msg.payload.channel, 3);
            buffer.writeUInt8(0x00, 4);
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
        if(data[0] != (0x90 + parseInt(midiChannel, 16))){return false;}
        if(data[1] != data[3]){return false;}
        msg.payload.channel = data[1];
        msg.payload.state = data[2] == 0x7F;
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}