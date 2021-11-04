var AHNetwork = require("../AHNetwork/AHNetwork.js");

module.exports = function(RED)
{
    function MixRack(config) {
        RED.nodes.createNode(this,config);
        var network = RED.nodes.getNode(config.network);
        var node = this;
        node.status({fill:"gray",shape:"dot",text:"Waiting"});

        //On error
        network.addErrorCallback(function(sender, message) {
            if(sender.id == node.id) {
                node.status({fill:"red",shape:"dot",text:message});
            }
            else if(sender == "any") {
                node.status({fill:"red",shape:"dot",text:message});
            }
        }); 

        //On success
        network.addSuccessCallback(function(sender, message) {
            if(sender.id == node.id) {
                node.status({fill:"green",shape:"dot",text:message});
            }
            else if(sender == "any") {
                node.status({fill:"green",shape:"dot",text:message});
            }
        }); 

        //On message
        network.addMessageCallback(function(sender, message) {
            //If the message is for this device
            if(sender.id == node.id) {
                //Most likely an error
                node.send(message);

            }
            else if(sender == "any") {
                if(config.alwaysSend == "yes") {
                    node.status({fill:"green",shape:"dot",text:"Got Data"});
                    node.send(message);
                    output = false;
                }
            }   
        });

        //When a request is received on the input
        this.on("input", function(msg) {
            network.sendCommand(msg, node, network);
        });
    }

    RED.nodes.registerType("allenandheath-MixRack", MixRack);
}