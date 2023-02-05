// Allen and Heath AHM Node-Red Module.

module.exports = {
    object: function() { return {
        sysexHeader: {
            //Order of the SysEX header.
            // F0, 00, 00, 1A, 50, 12, MV, mV
            allCall: [0xF0, 0x00, 0x00, 0x1A, 0x50, 0x12, 0x01, 0x00],
            currentHeader: undefined
        },
        syncActive: true,
        recieveBuffer: new Buffer(0),
        inputChannel: {
            "1": 0x00,
            "2": 0x01,
            "3": 0x02,
            "4": 0x03,
            "5": 0x04,
            "6": 0x05,
            "7": 0x06,
            "8": 0x07,
            "9": 0x08,
            "10": 0x09,
            "11": 0x0A,
            "12": 0x0B,
            "13": 0x0C,
            "14": 0x0D,
            "15": 0x0E,
            "16": 0x0F,
            "17": 0x10,
            "18": 0x11,
            "19": 0x12,
            "20": 0x13,
            "21": 0x14,
            "22": 0x15,
            "23": 0x16,
            "24": 0x17,
            "25": 0x18,
            "26": 0x19,
            "27": 0x1A,
            "28": 0x1B,
            "29": 0x1C,
            "30": 0x1D,
            "31": 0x1E,
            "32": 0x1F, 
            "33": 0x20,
            "34": 0x21,
            "35": 0x22,
            "36": 0x23,
            "37": 0x24,
            "38": 0x25,
            "39": 0x26,
            "40": 0x27,
            "41": 0x28,
            "42": 0x29,
            "43": 0x2A,
            "44": 0x2B,
            "45": 0x2C,
            "46": 0x2D,
            "47": 0x2E,
            "48": 0x2F,
            "49": 0x30,
            "50": 0x31,
            "51": 0x32,
            "52": 0x33,
            "53": 0x34,
            "54": 0x35,
            "55": 0x36,
            "56": 0x37,
            "57": 0x38,
            "58": 0x39,
            "59": 0x3A,
            "60": 0x3B,
            "61": 0x3C,
            "62": 0x3D,
            "63": 0x3E,
            "64": 0x3F
        },
        zones: {
            "1": 0x00,
            "2": 0x01,
            "3": 0x02,
            "4": 0x03,
            "5": 0x04,
            "6": 0x05,
            "7": 0x06,
            "8": 0x07,
            "9": 0x08,
            "10": 0x09,
            "11": 0x0A,
            "12": 0x0B,
            "13": 0x0C,
            "14": 0x0D,
            "15": 0x0E,
            "16": 0x0F,
            "17": 0x10,
            "18": 0x11,
            "19": 0x12,
            "20": 0x13,
            "21": 0x14,
            "22": 0x15,
            "23": 0x16,
            "24": 0x17,
            "25": 0x18,
            "26": 0x19,
            "27": 0x1A,
            "28": 0x1B,
            "29": 0x1C,
            "30": 0x1D,
            "31": 0x1E,
            "32": 0x1F, 
            "33": 0x20,
            "34": 0x21,
            "35": 0x22,
            "36": 0x23,
            "37": 0x24,
            "38": 0x25,
            "39": 0x26,
            "40": 0x27,
            "41": 0x28,
            "42": 0x29,
            "43": 0x2A,
            "44": 0x2B,
            "45": 0x2C,
            "46": 0x2D,
            "47": 0x2E,
            "48": 0x2F,
            "49": 0x30,
            "50": 0x31,
            "51": 0x32,
            "52": 0x33,
            "53": 0x34,
            "54": 0x35,
            "55": 0x36,
            "56": 0x37,
            "57": 0x38,
            "58": 0x39,
            "59": 0x3A,
            "60": 0x3B,
            "61": 0x3C,
            "62": 0x3D,
            "63": 0x3E,
            "64": 0x3F
        },
        functions: {
            //endInitialSync: require("./endInitialSync.js"),
            sendPing: require("./sendPing.js").object()
            // channelName: require("./channelName.js").object(),
            // muteControl: require("./muteControl.js").object(),
            faderLevel: require("./faderLevel.js").object(),
            // sceneRecall: require("./sceneRecall.js").object()
        },

        //Reset this object
        reset: function() {
            this.sysexHeader.currentHeader = undefined;
            this.syncActive = true;

            Object.keys(this.functions).forEach(function(key) {
                try{this.functions[key].reset();}
                catch(e){}
            });
        },

        recieve: function(msg, midiChannel, server) {
            var object = this;
            var value = [];
            //Only process commands when FE is recieved
            if(msg[0] == 0xFE) {
                try{server.write(Buffer.from([0xFE]));}
                catch(e){console.log("Failed to send heartbeat packet"); console.log(e); return false;}

                //Attempt to get the sysex header if required
                if(object.sysexHeader.currentHeader === undefined) {
                    if(object.syncActive === true) {
                        if(object.sysexHeader.currentHeader === undefined) {
                            //Search for this command
                            for(var i = 0; i < object.recieveBuffer.length; i++) {
                                if(object.recieveBuffer[i + 0] == 0xF0 && object.recieveBuffer[i + 13] == 0xF7) {
                                    object.sysexHeader.currentHeader = object.recieveBuffer.slice(i + 0, i + 9);
                                }
                            }
                        }              
                    }
                }
                else {
                    //Find the function and process
                    Object.keys(object.functions).forEach(function(key) {
                        var temp = object.functions[key].recieve(midiChannel, object.recieveBuffer, server, object.syncActive);
                        if(temp !== false && temp !== true) {
                            value.push(temp);  
                        }
                    });

                    //Check if we have finished syncing    
                    if(object.sysexHeader.currentHeader !== undefined && object.syncActive == true) {
                        object.syncActive = false;

                        //Send out all the initial data
                        var msgs = [];
                        Object.keys(object.functions).forEach(function(key) {
                            msgs.push(object.functions[key].getData());
                        });

                        return [msgs];
                    }
                    //Clear the buffer
                    object.recieveBuffer = new Buffer(0);
                }
            
            }
            else {
                object.recieveBuffer = Buffer.concat([object.recieveBuffer, msg]);
            }

            return [value];
        },

        generatePacket: function(msg, server, midiChannel, returnPayload) {
            var value = false;
            var temp = this;
            Object.keys(temp.functions).forEach(function(key){
                if(value === false) {
                    var func = temp.functions[key];
                    value = func.generatePacket(msg, server, midiChannel, returnPayload);
                }
            });

            return value;
        },

        sendPing: function(server, midiChannel, successFunction) {
            var value = false;
            var temp = this;
            Object.keys(temp.functions).forEach(function(key){
                if(value === false) {
                    var func = temp.functions[key];
                    value = func.sendPing(server, midiChannel, successFunction);
                }
            });

            return value;
        },

        //Send message on initial connection
        initialConnection: function(server, midiChannel) {
            var temp = this;
            Object.keys(this.functions).forEach(function(func){
                var mode = temp.functions[func];   
                mode.setup(temp);
            });

            //Ask for system state
            var buffer = Buffer.concat([new Buffer.from(this.sysexHeader.allCall), new Buffer.from([0x10, 0x01, 0xF7])]);
            try {server.write(buffer);}
            catch(e) {console.log("Failed to send packet! "); console.log(e); return false;}
            return true;
        }
    }}
}