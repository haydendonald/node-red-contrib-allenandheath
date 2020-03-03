
//Functional
//B[ID] 63 [CH] 62 17 06 [LV00-7F]


//B[ID] 00 BANK C[ID] SCENE

var global = require("./modeGlobal.js");

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
            if(msg.payload.sceneNumber < 0 || msg.payload.sceneNumber > 500){return "msg.payload.sceneNumber out of bounds. Needs to be between 0 and 500";}

            var bank = 0xFF;
            var sceneNumber = msg.payload.sceneNumber;
            if(msg.payload.sceneNumber <= 128) {
                bank = 0x00;
                //sceneNumber -= 127;
            }
            else if(msg.payload.sceneNumber <=129) {
                bank = 0x01;
                sceneNumber -= 129;
            }
            else if(msg.payload.sceneNumber <= 257) {
                bank = 0x02;
                sceneNumber -= 257;
            }
            else if(msg.payload.sceneNumber <= 385 && msg.payload.sceneNumber <= 500) {
                bank = 0x03;   
                sceneNumber -= 385;
            }

            //Send out request
            var buffer = new Buffer(5);
            buffer.writeUInt8((0xB0 + parseInt(midiChannel, 16)), 0);
            buffer.writeUInt8(0x00, 1);
            buffer.writeUInt8(bank, 2);
            buffer.writeUInt8((0xC0 + parseInt(midiChannel, 16)), 3);
            buffer.writeUInt8(sceneNumber - 1, 4);
            return buffer;  
        }
        else{
            return false;
        }
    },

    //Recieved data 
    recieve: function recieve(midiChannel, data) {
        return false;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}