
module.exports = {
    isConnected: false,
    waitForSenseTimeout: undefined,
    parameters: undefined,

    setup: function(parameters) {
        this.parameters = parameters;
    },

    //Send out
    generatePacket: function generatePacket(msg, server, midiChannel) {
        return false;
    },

    //Recieved data 
    recieve: function recieve(midiChannel, data, server, syncActive) {
        if(data[0] == 0xFE) {
            this.isConnected = true;
            server.write(new Buffer.from([0xFE]));

            clearTimeout(this.waitForSenseTimeout);
            this.waitForSenseTimeout = setTimeout(function() {
                this.isConnected = false;
            }, 1000);
        }

        return false;
    },

    //Ping
    sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
        if(!recentlySentMessage) {
            if(this.isConnected === false) {
                successFunction(false);
                return true;
            }
        }
        else {
            successFunction(true);
        }
        return true;
    }
}