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
                        var packet = Buffer.concat([Buffer.from(self.parameters.sysexHeader.allCall), Buffer.from([i, 0x01, 0x0B, 0x17, j, 0xF7])]);
                        try { server.write(packet); }
                        catch (e) { console.log("Failed to send packet! "); console.log(e); return false; }
                    }
                }
            },

            //Send out
            generatePacket: function generatePacket(msg, server, midiChannel, callback) {
                var object = this;
                if (msg.payload.function == "faderLevel") {
                    if (msg.payload.channelSelection === undefined && msg.payload.channel === undefined && msg.payload.level === undefined) {
                        //Just return the stored information
                        var msg = {
                            "payload": {
                                "function": "faderLevel"
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
                        if (msg.payload.level === undefined) { return "muted is not specified"; }

                        //Validate the channel selection
                        var channel = parseInt(msg.payload.channel);
                        var level = parseInt(msg.payload.level);
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

                        //Validate the level
                        if(level < 0 || level > 0x7F) {
                            return "Invalid level";
                        }

                        //Generate the packet!
                        var retMsg = {
                            "payload": {
                                "function": "faderLevel"
                            }
                        }
                        try {
                            object.data[msg.payload.channelSelection][channel] = msg.payload.level;
                            Object.assign(retMsg.payload, object.data);
                            callback(retMsg);
                        }
                        catch (e) { }

                        var packet = Buffer.from([(0xB0 + channelSelectionIdx), 0x63, channel - 1, (0xB0 + channelSelectionIdx), 0x62, 0x17, (0xB0 + channelSelectionIdx), 0x06, level]);
                        return packet;
                    }
                }
            },

            //Recieved data
            recieve: function recieve(midiChannel, data, server, syncActive) {
                var object = this;
                var updated = false;

                for (var i = 0; i < data.length;) {
                    if (data[i + 1] != 0x63) { break; }
                    if (data[i + 3] != 0x62) { break; }
                    if (data[i + 4] != 0x17) { break; }
                    if (data[i + 5] != 0x06) { break; }

                    var channelSelection = data[i + 0] - 0xB0;
                    var channel = data[i + 2];
                    var level = data[i + 6];

                    if (channelSelection < 0 || channelSelection > 2) { break; }
                    if (channel < 0 || channel > object.parameters.totalChannelSelection[channelSelection]) { break; }
                    object.data[Object.keys(object.data)[channelSelection]][channel + 1] = level;
                    data = data.slice(i + 7, data.length);
                    i = 0;
                    updated = true;
                }

                if (updated == true) {
                    var msg = {
                        "payload": {
                            "function": "faderLevel"
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