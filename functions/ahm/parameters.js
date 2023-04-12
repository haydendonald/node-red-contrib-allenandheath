module.exports = {
    object: function () {
        return {
            sysexHeader: {
                allCall: [0xF0, 0x00, 0x00, 0x1A, 0x50, 0x12, 0x01, 0x00],
                currentHeader: undefined
            },
            recieveBuffer: Buffer.from([]),
            processTimeout: undefined,
            syncActive: true,
            syncTimeout: undefined,
            totalChannelSelection: [64, 64, 32], //[inputs, zones, control groups]
            functions: {
                muteControl: require("./muteControl.js").object(),
                faderLevel: require("./faderLevel.js").object(),
                zoneSendMuteControl: require("./zoneSendMuteControl.js").object(),
                zoneSendFaderLevel: require("./zoneSendFaderLevel.js").object(),
            },

            //Reset this object
            reset: function () {
                this.sysexHeader.currentHeader = undefined;
                this.syncActive = true;

                Object.keys(this.functions).forEach(function (key) {
                    try { this.functions[key].reset(); }
                    catch (e) { }
                });
            },

            recieve: function (msg, midiChannel, server, callback) {
                var object = this;
                var value = [];

                //Store the buffer
                object.recieveBuffer = Buffer.concat([object.recieveBuffer, msg]);

                //Process our buffer once we stop getting commands
                clearTimeout(object.processTimeout);
                object.processTimeout = setTimeout(function () {
                    //Find the function and process
                    Object.keys(object.functions).forEach(function (key) {
                        var temp = object.functions[key].recieve(midiChannel, object.recieveBuffer, server);
                        if (temp !== false && temp !== true) {
                            value.push(temp);
                        }
                    });
                    callback(value);
                }, 100);

                clearTimeout(object.syncTimeout);
                object.syncTimeout = setTimeout(function () {
                    //Once we're done syncing send the values
                    if (object.syncActive == true) {
                        object.syncActive = false;
                        var value = [];
                        Object.keys(object.functions).forEach(function (key) {
                            var temp = object.functions[key].getData()
                            if (temp !== false && temp !== true) {
                                value.push(temp);
                            }
                        });
                        callback(value);
                    }

                    //Clear the unused buffer
                    object.recieveBuffer = Buffer.from([]);
                }, 1000);

                return true;
            },

            generatePacket: function (msg, server, midiChannel, returnPayload) {
                var value = false;
                var temp = this;
                Object.keys(temp.functions).forEach(function (key) {
                    if (value === false) {
                        var func = temp.functions[key];
                        value = func.generatePacket(msg, server, midiChannel, returnPayload);
                    }
                });

                return value;
            },

            sendPing: function (server, midiChannel, successFunction) {
                return false;
            },

            //Send message on initial connection
            initialConnection: function (server, midiChannel) {
                var temp = this;
                Object.keys(this.functions).forEach(function (func) {
                    var mode = temp.functions[func];
                    mode.setup(temp);
                });

                for (var func in temp.functions) {
                    temp.functions[func].initial(server, midiChannel);
                }

                return true;
            }
        }
    }
}