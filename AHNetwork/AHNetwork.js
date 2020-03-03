var tcp = require('net');
var modes = require("../modes/modes.js");

module.exports = function(RED)
{
    module.exports.sendCommand = function(msg, sender, network) {
        var value = false;

        value = modes.generatePacket(network.console, msg, network.server, network.midiChannel, function(msg) {
            sendMessage("any", network.node, msg);
        });

        if((typeof value === "string")) {
            network.node.error("Mode Error: " + value);
            sendError(sender, network, "Mode Error: " + value);
        }
        else if(value != false){
            network.server.write(value);
            sendSuccess(sender, network, "Sent!");
        }
        else {
            network.node.error("No Mode Found");
            sendError(sender, network, "Mode Error: No Mode Found");                  
        }
    }
    module.exports.addErrorCallback = function(network, fn) {
        network.errorCallbacks.push(fn);
    },
    module.exports.addSuccessCallback = function(network, fn) {
        network.successCallbacks.push(fn);
    },  
    module.exports.addMessageCallback = function(network, fn) {
        network.messageCallbacks.push(fn);
    }

    //Main functiion
    function AHNetwork(config)
    {
        RED.nodes.createNode(this, config);
        this.log("Created Allen & Heath Network Console: " + config.console + " @ IP: " + config.ipAddress + ":" + config.port);
        this.midiChannel = (config.midiChannel - 1).toString(16);
        this.ipAddress = config.ipAddress;
        this.port = config.port;
        this.server;
        this.connected = false;
        this.connectionCheck;
        this.errorCallbacks = [];
        this.successCallbacks = [];
        this.messageCallbacks = [];
        this.console = config.console;
        this.node = this;
        var node = this.node;
        this.recentlySentMessage = false;
        //On close disconnect
        this.on("close", function() {
            node.server.end();
            this.server.destroy();
            node.connected = false;
            node.server = new tcp.Socket();
            clearInterval(this.connectionCheck);
        });

        var tryToConnect = function() {
            node.log("Attempting Inital Connection");
            connect(node, function(state) {
                if(state) {
                    connected(node);
                    //Check for console connection every 10s
                    clearInterval(this.connectionCheck);
                    this.connectionCheck = setInterval(function() {
                        if(node.connected && node.recentlySentMessage != true) {
                            sendSuccess("any", node, "Checking connection");
                            var value = modes.sendPing(node.console, node.server, node.midiChannel, node.recentlySentMessage, function(success) {
                                if(!success) {
                                    //Disconnected
                                    sendError("any", node, "Ping Failed");
                                    reConnect(node); 
                                }
                                else {
                                    sendSuccess("any", node, "Connected");
                                }
                            });
                            if(value != true) {
                                node.error("Failed To Send Ping: " + value);
                                sendError("any", node, "Sending Ping Failed");
                            }
                        }
                        else {
                            reConnect(node);             
                        }
                    }, 30000);
                }
                else {
                    //Retry after 10 sec
                    setTimeout(function() {
                        node.error("Retrying Inital Connection - Check that your IP is correct");
                        sendError("any", node, "Failed Conection");
                        tryToConnect();
                    }, 30000);
                }
            });
        }
        tryToConnect();
    }     
    RED.nodes.registerType("allenandheath-AHNetwork", AHNetwork);
}

//Set callbacks when we are connected
function connected(node) {
    sendSuccess("any", node, "Connected");
    node.connected = true;

    //When we get in some data
    node.server.on("data", function(message) {
        console.log("QU IN");
        console.log(message);
        if(!node.recentlySentMessage) {
            node.recentlySentMessage = true;
            setTimeout(function(){node.recentlySentMessage = false}, 30000);
        }

        var value = modes.recieve(node.console, message, node.midiChannel);

        if((typeof value === "string")) {
            //An Error Occurred
            node.error("Mode Error: " + value);
            sendError("any", node, "Mode error check debug");
        }
        else if(value != false){
            sendSuccess("any", node, "Got message!");
            sendMessage("any", node, value);
        }
    });
}

//Connect
function connect(node, isConnected) {
    node.server = new tcp.Socket();
    console.log("attempt");


    node.server.on("close", function(yeet) {
        console.log("closed");
    });
    node.server.on("data", function(message) {
        console.log("incmomig");
        console.log(message);
    });

     //Attempt connection
     node.server.connect(node.port, node.ipAddress, function() {
        node.connected = true;
        isConnected(true);
    });

    //Failed connection
    setTimeout(function() {
        if(node.connected == false) {
            isConnected(false);
            sendError("any", node, "Failed connection check debug!");
            node.error("Failed to connect, please check if we can connect");
        }
    }, 5000);


    //Stop crashes when a error comes in (we don't care about it atm)
    node.server.on("error", function(){});

    //If we're connected
    if(node.connected) {
        //Set listeners
        node.server.on("close", function() {
            node.connected = false;
            node.warn("Socket Closed");
            sendError("any", node, "Lost connection");
        });

        node.server.on("timeout", function() {
            node.error("A Timeout Occured, Assuming Disconnected");
            sendError("any", node, "Failed connection check debug!");
            reConnect(node); 
        });

        node.server.on("error", (e) => {      
            switch(e.code) {
                case "EADDRINUSE": {
                    node.error("Critical Error: Socket In Use");
                    sendError("any", node, "Failed connection check debug!");
                    clearInterval(node.connectionCheck);
                    node.connected = false;
                    break;
                }
                case "ECONNRESET": {
                    node.error("Error: Network Reset");
                    sendError("any", node, "Failed connection check debug!");
                    reConnect(node);
                    break;
                }
                case "EHOSTUNREACH": {
                    node.error("Error: Failed To Reach The Console");
                    sendError("any", node, "Failed connection check debug!");
                    setTimeout(function(){reConnect(node);}, 10000);
                    break;
                }
                default: {
                    node.error("An Error Occured " + e);
                    sendError("any", node, "Failed connection check debug!");
                    reConnect(node); 
                    break;
                }
            }
        });
    }
}

//Attempt reconnection
function reConnect(node) {
    if(node.connected) {
        sendError("any", node, "Attempting reconnection..");
    }

    if(node.server !== undefined) {
        node.server.end();
        node.connected = false;

        connect(node, function(state) {
            if(state) {
                connected(node);
            }
        });
    }
    else {
        node.error("Critical Error Attempted To Reconnect On Undefined Server Socket");
        sendError("any", node, "Failed connection check debug!");
        clearInterval(node.connectionCheck);
    }
}

//Send out error
function sendError(sender, network,  message) {
    for(i = 0; i < network.errorCallbacks.length; i++) {
        network.errorCallbacks[i](sender, message);
    }
}

//Send out success
function sendSuccess(sender, network, message) {
    for(i = 0; i < network.successCallbacks.length; i++) {
        network.successCallbacks[i](sender, message);
    }
}

//Send out error
function sendMessage(sender, network,  message) {
    for(i = 0; i < network.messageCallbacks.length; i++) {
        network.messageCallbacks[i](sender, message);
    }
}

