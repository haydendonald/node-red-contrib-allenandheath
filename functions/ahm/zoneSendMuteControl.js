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
                };
            },

            //Request all the channels
            initial: function (server, midiChannel) {
                var self = this;
                var packet = [];
                var currentTimeout = 0;
                var sendPacket = function (server, packet, timeout) {
                    setTimeout(function () {
                        try { server.write(packet); }
                        catch (e) { console.log("Failed to send packet! "); console.log(e); return false; }
                    }, timeout);
                }
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < self.parameters.totalChannelSelection[i]; j++) {
                        for (k = 0; k < 3; k++) {
                            for (var l = 0; l < self.parameters.totalChannelSelection[k]; l++) {
                                packet = Buffer.concat([Buffer.from(packet), Buffer.from(self.parameters.sysexHeader.allCall), Buffer.from([i, 0x01, 0x0F, 0x03, j, k, l, 0xF7])]);
                            };
                        }

                        sendPacket(server, packet, currentTimeout);
                        currentTimeout += 100;
                        packet = [];
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
                    var offset = object.parameters.sysexHeader.allCall.length;

                    if (data[i + offset + 1] != 0x03) { break; }
                    if (data[i + offset + 6] != 0xF7) { break; }
                    var channelSelection = data[i + offset + 0] - 0x00;
                    var channel = data[i + offset + 2] - 0x00;
                    var channelSend = data[i + offset + 4] - 0x00;
                    var channelSelectionSend = data[i + offset + 3] - 0x00;

                    var state = undefined;
                    if (data[i + offset + 5] >= 1 && data[i + offset + 5] <= 0x3F) {
                        state = false;
                    }
                    else if (data[i + offset + 5] >= 0x40 && data[i + offset + 5] <= 0x7F) {
                        state = true;
                    }
                    if (state === undefined) { break; }

                    if (channelSelection < 0 || channelSelection > 2) { break; }
                    if (channel < 0 || channel > object.parameters.totalChannelSelection[channelSelection]) { break; }
                    if (channelSelectionSend < 0 || channelSelectionSend > 2) { break; }
                    if (channelSend < 0 || channelSend > object.parameters.totalChannelSelection[channelSelectionSend]) { break; }

                    if (object.data[Object.keys(object.data)[channelSelection]][channel + 1] === undefined) {
                        object.data[Object.keys(object.data)[channelSelection]][channel + 1] = {};
                    }
                    if (object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]] === undefined) {
                        object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]] = {};
                    }

                    object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]][channelSend] = state;
                    data = data.slice(i + offset + 7, data.length);
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
                    console.log(msg);
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