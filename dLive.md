# How to use for dLive consoles

## General Command Layout

```
//Received Information Format
var msg.payload = {
    "function": "The function received",
    ...
}

//Send Information Format
var msg.payload = {
    "function": "functionName",
    "channelType": "inputChannel",
    "channel": "channelNumber",
    ...
}

//Connection Updates
{
    "topic": "connectionState",
    "payload": "connected/disconnected/reconnecting"
}


... = Specific function parameters, see below functions for more
```