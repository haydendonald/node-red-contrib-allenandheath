
module.exports = {
    object: function() { return {
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
                clearTimeout(this.waitForSenseTimeout);
                this.waitForSenseTimeout = setTimeout(function() {
                    this.isConnected = false;
                }, 5000);
            }

            return false;
        },

        //Send the data
        getData() {
            return undefined;
        },

        //Ping
        sendPing: function sendPing(server, midiChannel, recentlySentMessage, successFunction) {
            if(!recentlySentMessage) {
                if(this.isConnected === false) {
                    successFunction(false);
                    return true;
                }
                else {
                    successFunction(true);
                }
            }
            else {
                successFunction(true);
            }
            return true;
        }
    }}
}