
//Functional
//B[ID] 63 [CH] B[ID] 62 17 B[N] 06 LV[00-7F]

module.exports = {
    //Send out
    generatePacket: function generatePacket(console, server, midiChannel) {
        if(msg.payload.mode == "faderLevel") {
            //Validate
            if(!Number.isInteger(parseInt(msg.payload.channel))){return "No msg.payload.channel\n";}
            if(!Number.isInteger(parseInt(msg.payload.level))){return "No msg.payload.level\n";}

            var faderValue = parseInt(msg.payload.level);
            if(faderValue > 127){faderValue = 127;}
            if(faderValue < 0){faderValue = 0;}


            //Send out request
            var buffer = new Buffer(9);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
            buffer.writeUInt8(0x63, 1);
            buffer.writeUInt8(msg.payload.channel, 2);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 3);
            buffer.writeUInt8(0x62, 4);
            buffer.writeUInt8(0x17, 5);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 6);
            buffer.writeUInt8(0x06, 7);
            buffer.writeUInt8(faderValue, 8);
            return buffer;
        }
        else{
            return false;
        }
    },

    //Recieved data
    recieve: function recieve(midiChannel, data) {
        var msg = {payload:{}};
        msg.payload.mode = "faderLevel";
        if(data[0] != (0xB0 + parseInt(midiChannel))){return false;}
        if(data[3] != (0xB0 + parseInt(midiChannel))){return false;}
        if(data[6] != (0xB0 + parseInt(midiChannel))){return false;}
        if(data[1] != 0x63){return false;}
        if(data[4] != 0x62){return false;}
        if(data[5] != 0x17){return false;}
        if(data[7] != 0x06){return false;}

        msg.payload.channel = data[2];
        msg.payload.level = data[8];
        return msg;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}