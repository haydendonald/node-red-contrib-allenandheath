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
            var object = this;
            object.isConnected = true;
            clearTimeout(object.waitForSenseTimeout);
            object.waitForSenseTimeout = setTimeout(function() {
                object.isConnected = false;
            }, 5000);
        },

        //Send the data
        getData() {
            return undefined;
        },

        //Ping
        sendPing: function sendPing(server, midiChannel, successFunction) {
            if(this.isConnected === false) {
                successFunction(false);
                return true;
            }
            else {
                successFunction(true);
            }
            return true;
        }
    }}
}