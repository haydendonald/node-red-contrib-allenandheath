module.exports = {
    MV: 0x01, //Major version
    mV: 0x00, //Minor version

    //Get the channel selection
    /*
    Inputs 1 to 128: N = N, CH = 00 to 7F
    Mono Groups 1 to 62: N = N + 1, CH = 00 to 3D
    Stereo Groups 1 to 31: N = N + 1, CH = 40 to 5E
    Mono Aux 1 to 62: N = N + 2, CH = 00 to 3D
    Stereo Aux 1 to 31: N = N + 2, CH = 40 to 5E
    Mono Matrix 1 to 62: N = N + 3, CH = 00 to 3D
    Stereo Matrix 1 to 31: N = N + 3, CH = 40 to 5E
    Mono FX Send 1 to 16: N = N + 4, CH = 00 to 0F
    Stereo FX Send 1 to 16: N = N + 4, CH = 10 to 1F
    FX Return 1 to 16: N = N + 4, CH = 20 to 2F
    Mains 1 to 6: N = N + 4, CH = 30 to 35
    DCA 1 to 24: N = N + 4, CH = 36 to 4D
    Mute Group 1 to 8: N = N + 4, CH = 4E to 55
    */
    getChannelSelection: function(midiChannel, preMidi, rawMidiChannel, rawChannel) {
        switch(rawMidiChannel - (preMidi + parseInt(midiChannel, 16))) {
            case 0: {
                return "inputs";
                break;
            }
            case 1: {
                if(rawChannel <= 0x3D) {
                    return "monoGroups";
                }
                else if(rawChannel <= 0x5E) {
                    return "stereoGroups";
                }
                break;
            }
            case 2: {
                if(rawChannel <= 0x3D) {
                    return "monoAux";
                }
                else if(rawChannel <= 0x5E) {
                    return "stereoAux";
                }
                break;
            }
            case 3: {
                if(rawChannel <= 0x3D) {
                    return "monoMatrix";
                }
                else if(rawChannel <= 0x5E) {
                    return "stereoMatrix";
                }
                break;
            }
            case 4: {
                if(rawChannel <= 0x0F) {
                    return "monoFXSend";
                }
                else if(rawChannel <= 0x1F) {
                    return "stereoFXSend";
                }
                else if(rawChannel <= 0x2F) {
                    return "FXReturn";
                }
                else if(rawChannel <= 0x35) {
                    return "mains";
                }
                else if(rawChannel <= 0x4D) {
                    return "DCA";
                }
                else if(rawChannel <= 0x55) {
                    return "muteGroup";
                }
                break;
            }
            default: {
                return "ERROR";
            }
        }
    },

    //Returns the midi channel and channel as a buffer
    setChannelSelection: function(channelSelection, midiChannel, channel) {
        var sendOut = new Buffer(2);
        switch(channelSelection){
            case "inputs": {
                sendOut.writeUInt8((parseInt(midiChannel, 16)), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "monoGroups": {
                if(channel > 0x3D){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 1), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "stereoGroups": {
                if(channel <= 0x3D || channel > 0x5E){return;}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 1), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "monoAux": {
                if(channel > 0x3D){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 2), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "stereoAux": {
                if(channel <= 0x3D || channel > 0x5E){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 2), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "monoMatrix": {
                if(channel > 0x3D){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 3), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "stereoMatrix": {
                if(channel <= 0x3D || channel > 0x5E){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 3), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "monoFXSend": {
                if(channel > 0x0F){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 4), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "FXReturn": {
                if(channel <= 0x0F || channel > 0x1F){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 4), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "mains": {
                if(channel <= 0x1F || channel > 0x35){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 4), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "DCA": {
                if(channel <= 0x35 || channel > 0x4D){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 4), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            case "muteGroup": {
                if(channel <= 0x4D || channel > 0x55){return "ERROR";}
                sendOut.writeUInt8((parseInt(midiChannel, 16) + 4), 0);
                sendOut.writeUInt8(channel, 1);
                break;
            }
            default: {
                return "ERROR";
            }
        }
        return sendOut;
    }
}