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

            //Generate a flow message to return with our stored information
            generateFlowMessage: function () {
                var msg = {
                    "payload": {
                        "function": "zoneSendMuteControl"
                    }
                }

                Object.assign(msg.payload, this.data);
                return msg;
            },

            //Update a source locally
            updateSource: function (channelSelection, channel, channelSelectionSend, channelSend, state) {
                var object = this;
                if (object.data[Object.keys(object.data)[channelSelection]][channel + 1] === undefined) {
                    object.data[Object.keys(object.data)[channelSelection]][channel + 1] = {};
                }
                if (object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]] === undefined) {
                    object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]] = {};
                }

                object.data[Object.keys(object.data)[channelSelection]][channel + 1][Object.keys(object.data)[channelSelectionSend]][channelSend + 1] = state;
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
                if (msg.payload.function == "zoneSendMuteControl") {
                    if (msg.payload.source === undefined && msg.payload.send === undefined && msg.payload.muted === undefined) {
                        //Just return the stored information
                        callback(object.generateFlowMessage());
                        return true;
                    }
                    else {
                        if (msg.payload === undefined) { return "payload is not specified"; }
                        if (msg.payload.source === undefined) { return "source is not specified"; }
                        if (msg.payload.send === undefined) { return "send is not specified"; }
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

                        //Get the send selection + id
                        var sendSelection;
                        var sendId;
                        if (msg.payload.send.includes("channel")) { sendSelection = 0; sendId = parseInt(msg.payload.send.split("channel")[1]); }
                        else if (msg.payload.send.includes("zone")) { sendSelection = 1; sendId = parseInt(msg.payload.send.split("zone")[1]); }
                        else if (msg.payload.send.includes("controlGroup")) { sendSelection = 2; sendId = parseInt(msg.payload.send.split("controlGroup")[1]); }
                        else {
                            return "Invalid send channel selection";
                        }
                        if (sendId < 1 || sendId > object.parameters.totalChannelSelection[sendSelection] + 1) {
                            return "Invalid send id";
                        }

                        var state = msg.payload.muted == true ? 0x7F : 0x3F;

                        //After a little bit ask for the channel
                        setTimeout(function () {
                            console.log("REQ");
                            try { server.write(Buffer.concat([Buffer.from(object.parameters.sysexHeader.allCall), Buffer.from([sourceSelection, 0x01, 0x0F, 0x03, sourceId - 1, sendSelection, sendId - 1, 0xF7])])); }
                            catch (e) { console.log("Failed to send packet! "); console.log(e); return false; }
                        }, 100);

                        var packet = Buffer.concat([Buffer.from(object.parameters.sysexHeader.allCall), Buffer.from([sourceSelection, 0x03, sourceId - 1, sendSelection, sendId - 1, state, 0xF7])]);
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

                    object.updateSource(channelSelection, channel, channelSelectionSend, channelSend, state);
                    data = data.slice(i + offset + 7, data.length);
                    i = 0;
                    updated = true;
                }

                if (updated == true && object.parameters.syncActive == false) {
                    return object.generateFlowMessage();
                }

                return true;
            },

            //Send the data
            getData() {
                return this.generateFlowMessage();
            },

            //Ping
            sendPing: function sendPing(server, midiChannel, successFunction) {
                return false;
            }
        }
    }
}