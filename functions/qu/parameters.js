module.exports = {
    sysexHeader: {
        allCall: [0xF0, 0x00, 0x00, 0x1A, 0x50, 0x11, 0x01, 0x00, 0x7F],
        currentHeader: undefined
    },
    syncActive: true,
    recieveBuffer: new Buffer(0),
    channelTypes: {
        "inputChannel": {
            "1": 0x20,
            "2": 0x21,
            "3": 0x22,
            "4": 0x23,
            "5": 0x24,
            "6": 0x25,
            "7": 0x26,
            "8": 0x27,
            "9": 0x28,
            "10": 0x29,
            "11": 0x2A,
            "12": 0x2B,
            "13": 0x2C,
            "14": 0x2D,
            "15": 0x2E,
            "16": 0x2F,
            "17": 0x30,
            "18": 0x31,
            "19": 0x32,
            "20": 0x33,
            "21": 0x34,
            "22": 0x35,
            "23": 0x36,
            "24": 0x37,
            "25": 0x38,
            "26": 0x39,
            "27": 0x3A,
            "28": 0x3B,
            "29": 0x3C,
            "30": 0x3D,
            "31": 0x3E,
            "32": 0x3F,
            "ST1": 0x40,
            "ST2": 0x41,
            "ST3": 0x42
        },
        "FXReturn": {
            "1": 0x08,
            "2": 0x09,
            "3": 0x0A,
            "4": 0x0B
        },
        "FXSend": {
            "1": [0x00, 0x10],
            "2": [0x01, 0x11],
            "3": [0x02, 0x12],
            "4": [0x03, 0x13]
        },
        "Mix": {
            "1": [0x60, 0x00],
            "2": [0x61, 0x01],
            "3": [0x62, 0x02],
            "4": [0x63, 0x03],
            "5-6": [0x64, 0x04],
            "7-8": [0x65, 0x05],
            "9-10": [0x66, 0x06],
            "LR": [0x67, 0x07],
            "Grp1-2": [0x68, 0x08],
            "Grp3-4": [0x69, 0x09],
            "Grp5-6": [0x6A, 0x0A],
            "Grp7-8": [0x6B, 0x0B],
            "MTX1-2": [0x6C, 0x0C],
            "MTX3-4": [0x6D, 0x0D],
        },
        "MuteGroup": {
            "1": 0x50,
            "2": 0x51,
            "3": 0x52,
            "4": 0x53
        },
        "DCAGroup": {
            "1": 0x10,
            "2": 0x11,
            "3": 0x12,
            "4": 0x13
        },
    },
    functions: {
        //endInitialSync: require("./endInitialSync.js"),
        sendPing: require("./sendPing.js"),
        channelName: require("./channelName.js"),
        muteControl: require("./muteControl.js"),
        faderLevel: require("./faderLevel.js"),
        sceneRecall: require("./sceneRecall.js")
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
            server.write(Buffer.from([0xFE]));

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

    sendPing: function(server, midiChannel, recentlySentMessage, successFunction) {
        var value = false;
        var temp = this;
        Object.keys(temp.functions).forEach(function(key){
            if(value === false) {
                var func = temp.functions[key];
                value = func.sendPing(server, midiChannel, recentlySentMessage, successFunction);
            }
        });

        return value;
    },

    //Send message on initial connection
    initialConnection: function(server, midiChannel) {

        //Setup supported functions
        var temp = this;
        Object.keys(this.functions).forEach(function(func){
            var mode = temp.functions[func];   
            mode.setup(temp);
        });

        //Ask for system state
        var buffer = Buffer.concat([new Buffer.from(this.sysexHeader.allCall), new Buffer.from([0x10, 0x01, 0xF7])]);
        server.write(buffer);
        return true;
    }
}