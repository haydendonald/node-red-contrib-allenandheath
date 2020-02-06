var ilive = require("./ilive/modes.js");
var dlive = require("./dlive/modes.js");


module.exports = {
    generatePacket: function(consol, msg, server, midiChannel, returnPayload) {
        var modes = undefined;

        //Select the console used
        switch(consol) {
            case "iLive": {
                modes = ilive;
                break;
            }
            case "dLive": {
                modes = dlive;
                break;
            }
            default: {
                return "Console " + consol + " Not Supported";
            }
        }

        var value = false;
        //Find the mode
        Object.keys(modes).forEach(function(mode){
            if(value === false) {
                var mode = modes[mode];
                value = mode.generatePacket(msg, server, midiChannel, returnPayload);
            }
        });

        return value;
    },

    recieve: function(consol, msg, midiChannel) {
        var modes = undefined;

        switch(consol) {
            case "iLive": {
                modes = ilive;
                break;
            }
            case "dLive": {
                modes = dlive;
                break;
            }
            default: {
                return "Console " + consol + " Not Supported";
            }
        }

        var value = false;
        Object.keys(modes).forEach(function(mode){
            if(value === false) {
                var mode = modes[mode];
                value = mode.recieve(midiChannel, msg);
            }
        });

        return value;
    },

    sendPing: function(consol, server, midiChannel, recentlySentMessage, successFunction) {
        var modes = undefined;
        
        //Select the console used
        switch(consol) {
            case "iLive": {
                modes = ilive;
                break;
            }
            case "dLive": {
                modes = dlive;
                break;
            }
            default: {
                return "Console " + consol + " Not Supported";
            }
        }

        var value = false;
        //Find the mode
        Object.keys(modes).forEach(function(mode){
            if(value === false) {
                var mode = modes[mode];
                value = mode.sendPing(server, midiChannel, recentlySentMessage, successFunction);
            }
        });

        return value;
    }
}