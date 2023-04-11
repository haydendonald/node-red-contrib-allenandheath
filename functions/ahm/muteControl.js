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
                    if (msg.payload.channelSelection === undefined && msg.payload.channel === undefined && msg.payload.muted === undefined) {
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
                        if (msg.payload.channelSelection === undefined) { return "channelSelection is not specified"; }
                        if (msg.payload.channel === undefined) { return "channel is not specified"; }
                        if (msg.payload.muted === undefined) { return "muted is not specified"; }

                        //Validate the channel selection
                        var channel = parseInt(msg.payload.channel);
                        var state = msg.payload.muted == true ? 0x7F : 0x3F;
                        var channelSelectionIdx = {
                            "channel": 0,
                            "zone": 1,
                            "controlGroup": 2
                        }[msg.payload.channelSelection];
                        if (channelSelectionIdx === undefined) { return "Invalid channel selection"; }

                        //Validate the channel
                        if (channel < 1 || channel > object.parameters.totalChannelSelection[channelSelectionIdx] + 1) {
                            return "Invalid channel";
                        }

                        //Generate the packet!
                        var retMsg = {
                            "payload": {
                                "function": "muteControl"
                            }
                        }
                        try {
                            object.data[msg.payload.channelSelection][channel] = msg.payload.muted;
                            Object.assign(retMsg.payload, object.data);
                            callback(retMsg);
                        }
                        catch (e) { }

                        var packet = Buffer.from([(0x90 + channelSelectionIdx), channel - 1, state, 0x90 + channelSelectionIdx, channel - 1, 0x00]);
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
                    if (data[i + 2] >= 1 && data[i + 2] <= 0x3F) {
                        state = false;
                    }
                    else if (data[i + 2] >= 0x40 && data[i + 2] <= 0x7F) {
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