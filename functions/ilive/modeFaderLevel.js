
//Functional
//B[ID] 63 [CH] 62 17 06 [LV00-7F]

module.exports = {
    //Send out
    generatePacket: function generatePacket(console, server, midiChannel) {
        if(msg.payload.function == "faderLevel") {

            //Need to add support for msg.payload.type="get/set"
            if(msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }


            //Validate
            if(!Number.isInteger(parseInt(msg.payload.channel))){return "No msg.payload.channel\n";}
            if(!Number.isInteger(parseInt(msg.payload.level))){return "No msg.payload.level\n";}

            var faderValue = parseInt(msg.payload.level);
            if(faderValue > 127){faderValue = 127;}
            if(faderValue < 0){faderValue = 0;}


            //Send out request
            var buffer = new Buffer(7);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(0x63, 1);
            buffer.writeUInt8(msg.payload.channel, 2);
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
        if(data[0] != (0xB0 + parseInt(midiChannel, 16))){return false;}
        if(data[1] != 0x63){return false;}
        if(data[3] != 0x62){return false;}
        if(data[4] != 0x17){return false;}
        if(data[5] != 0x06){return false;}

        msg.payload.channel = data[2];
        msg.payload.level = data[6];
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}