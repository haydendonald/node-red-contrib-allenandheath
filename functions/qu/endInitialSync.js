
module.exports = {
    parameters: undefined,

    setup: function(parameters) {
        this.parameters = parameters;
    },

    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        return false;
    },

    //Recieved data 
    recieve: function recieve(midiChannel, data, server, syncActive, syncChangedCallback) {
        if(syncActive === true) {
            if(this.parameters.sysexHeader.currentHeader === undefined) {
                if(data.length == 13) {
                    //Valid inital connection flag
                    this.parameters.sysexHeader.currentHeader = data.slice(0, 9);
                }
            }
            
            
            if(this.parameters.sysexHeader.currentHeader !== undefined) {
                if(data[0] == 0x14) {

                    
                    console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
                }
                // if(data == Buffer.concat([Buffer.from(this.parameters.sysexHeader.currentHeader), Buffer.from([0x14])])) {
                //     console.log("HIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
                // }
            }
            
        }

        return false;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        return false;
    }
}