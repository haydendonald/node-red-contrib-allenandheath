var global = require("./modeGlobal.js");

module.exports = {
    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        return false;
    },

    //Recieved data 
    recieve: function recieve(midiChannel, data) {
        return false;
    },

    //Ping [F0, 00, 00, 1A, 50, 10, MV, mV]
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
    if(!recentlySentMessage) {
        var success = false;
        
            //Get a channel colour, just to get a reply
            var buffer = new Buffer(12);
            //SysEx Header
            buffer.writeUInt8(0xF0, 0);
            buffer.writeUInt8(0x00, 1);
            buffer.writeUInt8(0x00, 2);
            buffer.writeUInt8(0x1A, 3);
            buffer.writeUInt8(0x50, 4);
            buffer.writeUInt8(0x10, 5);
            buffer.writeUInt8(global.MV, 6);
            buffer.writeUInt8(global.mV, 7);

            buffer.writeUInt8((0x00 + parseInt(midiChannel, 16)), 8);
            buffer.writeUInt8(0x04, 9);
            buffer.writeUInt8(0x20, 10);
            buffer.writeUInt8(0xF7, 11);
            server.write(buffer);

            console.log("PING OUT");
            console.log(buffer);

        
            var handler = function(message) {
                console.log("PING IN");
                if(message[12] == 0xF7) {
                    success=true;
                    successFunction(true);
                }
            }
            
            server.on("data", handler);
        
            //Timeout check
            setTimeout(function() {
                if(success == false) {
                    successFunction(false);
                }
        
                server.removeListener("data", handler);
            }, 1000);
    }
    else {
        successFunction(true);
    }
        return true;
    }
}