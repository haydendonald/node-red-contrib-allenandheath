
//OLD STUFF


// //Mute control function, true on, false off
// function muteControl(server, midiChannel, channel, state)
// {
//     if(state == true) {state = 0x7F;}else{state = 0x3F;}
//     var buffer = new Buffer(5);
//     buffer.writeUInt8((0x90 + parseInt(midiChannel, 16)), 0);
//     buffer.writeUInt8(parseInt(channel, 16), 1);
//     buffer.writeUInt8(state, 2);
//     buffer.writeUInt8(parseInt(channel, 16), 3);
//     buffer.writeUInt8(0x00, 4);
//     server.write(buffer);
// }

// //Assign the channel to the main mix
// function assignChannelToMainMix(server, midiChannel, channel, state)
// {
//     if(state == true) {state = 0x7F;}else{state = 0x3F;}
//     var buffer = new Buffer(7);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(0x63, 1);
//     buffer.writeUInt8(parseInt(channel, 16), 2);
//     buffer.writeUInt8(0x62, 3);
//     buffer.writeUInt8(0x18, 4);
//     buffer.writeUInt8(0x06, 5);
//     buffer.writeUInt8(state, 6);
//     server.write(buffer); 
// }

// //AUX / FX Send Level
// function auxFXSendLevel(server, midiChannel, channel, send, level)
// {
//     var buffer = new Buffer(9);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(0x63, 1);
//     buffer.writeUInt8(parseInt(channel, 16), 2);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 3);
//     buffer.writeUInt8(0x62, 4);
//     buffer.writeUInt8(parseInt(send, 16), 5);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 6);
//     buffer.writeUInt8(0x06, 7);
//     buffer.writeUInt8(parseInt(level, 16), 8);
//     server.write(buffer);     
// }

// //DCA assignment control
// function DCAAssignmentControl(server, midiChannel, channel, state)
// {
//     if(state == true) {state = 0x40;}else{state = 0x0F;}
//     var buffer = new Buffer(7);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(0x63, 1);
//     buffer.writeUInt8(parseInt(channel, 16), 2);
//     buffer.writeUInt8(0x62, 3);
//     buffer.writeUInt8(0x40, 4);
//     buffer.writeUInt8(0x06, 5);
//     buffer.writeUInt8(state, 6);
//     server.write(buffer);     
// }

// //Channel Preamp Gain
// function channelPreampGain(server, midiChannel, channel, gain)
// {
//     var buffer = new Buffer(7);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(0x63, 1);
//     buffer.writeUInt8(parseInt(channel, 16), 2);
//     buffer.writeUInt8(0x62, 3);
//     buffer.writeUInt8(0x19, 4);
//     buffer.writeUInt8(0x06, 5);
//     buffer.writeUInt8(parseInt(gain, 16), 6);
//     server.write(buffer);     
// }

// //Socket preamp gain
// function socketPreampGain(server, midiChannel, socket, gain)
// {
//     var buffer = new Buffer(3);
//     buffer.writeUInt8((0xE0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(parseInt(socket, 16), 1);
//     buffer.writeUInt8(parseInt(gain, 16), 2);
//     server.write(buffer);     
// }

// //Set Socket Preamp Pad
// function setSocketPreampPad(server, midiChannel, socket, state)
// {
//     if(state == true) {state = 0x00;}else{state = 0x7F;}
//     var buffer = new Buffer(13);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x07, 9);
//     buffer.writeUInt8(parseInt(socket, 16), 10);
//     buffer.writeUInt8(state, 11);
//     buffer.writeUInt8(0xF7, 12);
//     server.write(buffer);     
// }

// //Get socket preamp pad, returns the pad state via the callback
// function getSocketPreampPad(server, midiChannel, socket, handler)
// {
//     if(state == true) {state = 0x00;}else{state = 0x7F;}
//     var buffer = new Buffer(12);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x07, 9);
//     buffer.writeUInt8(parseInt(socket, 16), 10);
//     buffer.writeUInt8(0xF7, 11);
//     server.write(buffer);
    
//     var answerbackHandler = function() {
//         if(data[0] != 0xF0){return;}
//         if(data[1] != 0x00){return;}
//         if(data[2] != 0x00){return;}
//         if(data[3] != 0x1A){return;}
//         if(data[4] != 0x50){return;}
//         if(data[5] != 0x10){return;}
//         if(data[6] != 0x01){return;}
//         if(data[7] != 0x00){return;}
//         if(data[8] != (0x00 + parseInt(midiChannel))){return;}
//         if(data[9] != 0x08){return;}
//         if(data[10] != parseInt(socket, 16)){return;}
//         if(data[12] != 0xF7){return;}
//         if(data[11] == 0x00){handler(false);}
//         if(data[11] == 0x7F){handler(true);}
//         server.removeListener(answerbackHandler);
//     } 
//     server.on("data", answerbackHandler);
// }

// //Set Socket Preamp 48V
// function setSocketPreamp48V(server, midiChannel, socket, state)
// {
//     if(state == true) {state = 0x00;}else{state = 0x7F;}
//     var buffer = new Buffer(13);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x0A, 9);
//     buffer.writeUInt8(parseInt(socket, 16), 10);
//     buffer.writeUInt8(state, 11);
//     buffer.writeUInt8(0xF7, 12);
//     server.write(buffer);     
// }

// //Get socket preamp pad, returns the pad state via the callback
// function getSocketPreampPad48V(server, midiChannel, socket, handler)
// {
//     if(state == true) {state = 0x00;}else{state = 0x7F;}
//     var buffer = new Buffer(12);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x0A, 9);
//     buffer.writeUInt8(parseInt(socket, 16), 10);
//     buffer.writeUInt8(0xF7, 11);
//     server.write(buffer);
    
//     var answerbackHandler = function() {
//         if(data[0] != 0xF0){return;}
//         if(data[1] != 0x00){return;}
//         if(data[2] != 0x00){return;}
//         if(data[3] != 0x1A){return;}
//         if(data[4] != 0x50){return;}
//         if(data[5] != 0x10){return;}
//         if(data[6] != 0x01){return;}
//         if(data[7] != 0x00){return;}
//         if(data[8] != (0x00 + parseInt(midiChannel))){return;}
//         if(data[9] != 0x0B){return;}
//         if(data[10] != parseInt(socket, 16)){return;}
//         if(data[12] != 0xF7){return;}
//         if(data[11] == 0x00){handler(false);}
//         if(data[11] == 0x7F){handler(true);}
//         server.removeListener(answerbackHandler);
//     } 
//     server.on("data", answerbackHandler);
// }

// //Set channel name
// function setChannelName(server, midiChannel, channel, name)
// {
//     var buffer = new Buffer(13);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x01, 9);
//     buffer.writeUInt8(parseInt(channel, 16), 10);
//     buffer.write(name, 11);
//     buffer.writeUInt8(0xF7, 12);
//     server.write(buffer);     
// }

// //Get channel name
// function getChannelName(server, midiChannel, channel, handler)
// {
//     var buffer = new Buffer(12);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x01, 9);
//     buffer.writeUInt8(parseInt(channel, 16), 10);
//     buffer.writeUInt8(0xF7, 11);
//     server.write(buffer);
    
//     var answerbackHandler = function() {
//         if(data[0] != 0xF0){return;}
//         if(data[1] != 0x00){return;}
//         if(data[2] != 0x00){return;}
//         if(data[3] != 0x1A){return;}
//         if(data[4] != 0x50){return;}
//         if(data[5] != 0x10){return;}
//         if(data[6] != 0x01){return;}
//         if(data[7] != 0x00){return;}
//         if(data[8] != (0x00 + parseInt(midiChannel))){return;}
//         if(data[9] != 0x02){return;}
//         if(data[10] != parseInt(channel, 16)){return;}
//         if(data[12] != 0xF7){return;}
//         handler(data[11]);
//         server.removeListener(answerbackHandler);
//     } 
//     server.on("data", answerbackHandler);
// }

// //Set channel colour
// function setChannelColour(server, midiChannel, channel, colour)
// {
//     var buffer = new Buffer(13);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x04, 9);
//     buffer.writeUInt8(parseInt(channel, 16), 10);
//     buffer.write(colour, 11);
//     buffer.writeUInt8(0xF7, 12);
//     server.write(buffer);     
// }

// //Get channel colour
// function getChannelColour(server, midiChannel, channel, handler)
// {
//     var buffer = new Buffer(12);
//     buffer.writeUInt8(0xF0, 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(0x00, 2);
//     buffer.writeUInt8(0x1A, 3);
//     buffer.writeUInt8(0x50, 4);
//     buffer.writeUInt8(0x10, 5);
//     buffer.writeUInt8(0x01, 6);
//     buffer.writeUInt8(0x00, 7);
//     buffer.writeUInt8((0x00 + parseInt(midiChannel)), 8);
//     buffer.writeUInt8(0x04, 9);
//     buffer.writeUInt8(parseInt(channel, 16), 10);
//     buffer.writeUInt8(0xF7, 11);
//     server.write(buffer);
    
//     var answerbackHandler = function() {
//         if(data[0] != 0xF0){return;}
//         if(data[1] != 0x00){return;}
//         if(data[2] != 0x00){return;}
//         if(data[3] != 0x1A){return;}
//         if(data[4] != 0x50){return;}
//         if(data[5] != 0x10){return;}
//         if(data[6] != 0x01){return;}
//         if(data[7] != 0x00){return;}
//         if(data[8] != (0x00 + parseInt(midiChannel))){return;}
//         if(data[9] != 0x04){return;}
//         if(data[10] != parseInt(channel, 16)){return;}
//         if(data[12] != 0xF7){return;}
//         handler(data[11]);
//         server.removeListener(answerbackHandler);
//     } 
//     server.on("data", answerbackHandler);
// }

// //Recall scene
// function recallScene(server, midiChannel, sceneNumber)
// {
//     var offset = 0x00;
//     if(sceneNumber > 128){offset = 0x01; sceneNumber - 127;}
//     var buffer = new Buffer(5);
//     buffer.writeUInt8((0xB0 + parseInt(midiChannel)), 0);
//     buffer.writeUInt8(0x00, 1);
//     buffer.writeUInt8(offset, 2);
//     buffer.writeUInt8((0xC0 + parseInt(midiChannel)), 3);
//     buffer.writeUInt8(parseInt(sceneNumber, 16), 4);
//     server.write(buffer);     
// }