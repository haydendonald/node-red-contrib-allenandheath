module.exports = {
    object: function () {
        return {
            parameters: undefined,
            data: {
                "channel": {},
                "zone": {},
                "controlGroup": {}
            },

            setup: function (parameters) {
                this.parameters = parameters;
            },

            reset: function () {
                data = {
                    "channel": {},
                    "zone": {},
                    "controlGroup": {}
                }
            },

            //Request all the channels
            initial: function (server, midiChannel) {
                var self = this;
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < self.parameters.totalChannelSelection[i]; j++) {
                        var packet = Buffer.concat([Buffer.from(self.parameters.sysexHeader.allCall), Buffer.from([i, 0x01, 0x09, j, 0xF7])]);
                        try { server.write(packet); }
                        catch (e) { console.log("Failed to send packet! "); console.log(e); return false; }
                    }
                }
            },

            //Send out
            generatePacket: function generatePacket(msg, server, midiChannel, callback) {
                var object = this;
                if (msg.payload.function == "muteControl") {
                    if (msg.payload.source === undefined && msg.payload.muted === undefined) {
                        //Just return the stored information
                        var msg = {
                            "payload": {
                                "function": "muteControl"
                            }
                        }

                        Object.assign(msg.payload, object.data);

                        callback(msg);
                        return true;
                    }
                    else {
                        if (msg.payload === undefined) { return "payload is not specified"; }
                        if (msg.payload.source === undefined) { return "source is not specified"; }
                        if (msg.payload.muted === undefined) { return "muted is not specified"; }

                        //Get the source selection + id
                        var sourceSelection;
                        var sourceId;
                        if (msg.payload.source.includes("channel")) { sourceSelection = 0; sourceId = parseInt(msg.payload.source.split("channel")[1]); }
                        else if (msg.payload.source.includes("zone")) { sourceSelection = 1; sourceId = parseInt(msg.payload.source.split("zone")[1]); }
                        else if (msg.payload.source.includes("controlGroup")) { sourceSelection = 2; sourceId = parseInt(msg.payload.source.split("controlGroup")[1]); }
                        else {
                            return "Invalid source channel selection";
                        }
                        if (sourceId < 1 || sourceId > object.parameters.totalChannelSelection[sourceSelection] + 1) {
                            return "Invalid source id";
                        }

                        var state = msg.payload.muted == true ? 0x7F : 0x3F;

                        //Validate the channel
                        if (sourceId < 1 || sourceId > object.parameters.totalChannelSelection[sourceSelection] + 1) {
                            return "Invalid channel";
                        }

                        //After a little bit ask for the channel
                        setTimeout(function () {
                            try { server.write(Buffer.concat([Buffer.from(object.parameters.sysexHeader.allCall), Buffer.from([sourceSelection, 0x01, 0x09, sourceId - 1, 0xF7])])); }
                            catch (e) { console.log("Failed to send packet! "); console.log(e); return false; }
                        }, 100);

                        var packet = Buffer.from([(0x90 + sourceSelection), sourceId - 1, state, 0x90 + sourceSelection, sourceId - 1, 0x00]);
                        return packet;
                    }
                }
            },

            //Recieved data
            recieve: function recieve(midiChannel, data, server, syncActive) {
                var object = this;
                var updated = false;
                for (var i = 0; i < data.length;) {
                    if (data[i + 1] != data[i + 3]) { break; }
                    if (data[i + 4] != 0) { break; }
                    var channelSelection = data[i + 0] - 144;
                    var channel = data[i + 1];
                    var state = undefined;
                    if (data[i + 2] == 0x3F) {
                        state = false;
                    }
                    else if (data[i + 2] == 0x7F) {
                        state = true;
                    }
                    if (state === undefined) { break; }
                    if (channelSelection < 0 || channelSelection > 2) { break; }
                    if (channel < 0 || channel > object.parameters.totalChannelSelection[channelSelection]) { break; }
                    object.data[Object.keys(object.data)[channelSelection]][channel + 1] = state;
                    data = data.slice(i + 5, data.length);
                    i = 0;
                    updated = true;
                }

                if (updated == true) {
                    var msg = {
                        "payload": {
                            "function": "muteControl"
                        }
                    }

                    Object.assign(msg.payload, object.data);
                    return msg;
                }

                return true;
            },

            //Send the data
            getData() {
                var msg = {
                    "payload": {
                        "function": "muteControl"
                    }
                }

                Object.assign(msg.payload, this.data);
                return msg;
            },

            //Ping
            sendPing: function sendPing(server, midiChannel, successFunction) {
                return false;
            }
        }
    }
}