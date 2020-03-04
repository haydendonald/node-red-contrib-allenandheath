
//Functional
//B[ID] 63 [CH] 62 17 06 [LV00-7F]

module.exports = {
    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        if(msg.payload.function == "sceneRecall") {

            //Need to add support for msg.payload.type="get/set"
            if(msg.payload.type !== undefined) {
                return "msg.payload.type is not supported by this function, it only supports setting";
            }


            //Validate
            if(!Number.isInteger(parseInt(msg.payload.sceneNumber))){return "No msg.payload.sceneNumber\n";}
            if(msg.payload.sceneNumber < 0 || msg.payload.sceneNumber > 128){return "msg.payload.sceneNumber out of bounds. Needs to be between 0 and 128";}

            //Send out request
            var offset = 0x00;
            var sceneNumber = msg.payload.sceneNumber;
            if(msg.payload.sceneNumber > 128){offset = 0x01; sceneNumber - 127;}
            var buffer = new Buffer(5);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(0x00, 1);
            buffer.writeUInt8(offset, 2);
            buffer.writeUInt8((0xC0 + parseInt(midiChannel, 16)), 3);
            buffer.writeUInt8(sceneNumber, 4);
            return buffer;  
        }
        else{
            return false;
        }
    },

    //Recieved data 
    recieve: function recieve(midiChannel, data, server, syncActive) {
        return false;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}