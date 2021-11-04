# How to use for iLive consoles

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

# Limitations
Due to the iLive protocol not having the ability to get initial values the values stored may be incorrect or missing!

## Mute Control (Get/Set)
Sets the mute state of a channel
- `function` "muteControl"
- `channel` The channel to control
- `state` The state of the mute (true/false)

### Example message from the console
```
var msg = {
    "payload": {
        "function": "muteControl",
        "channel": 0,
        "state": true
    }
}
```

### Example request to the console
```
//Request to set the mute to on for channel 1
var msg = {
    "payload": {
        "function": "muteControl",
        "channel": "1",
        "state": true
    }
}
```

### Example get from the console
Due to limitations on the iLive protocol these values may be unpopulated until updated!
```
var msg = {
    "payload": {
        "function": "muteControl"
    }
}

//Returns 
var msg = {
    "payload": {
        "function": "muteControl",
        "states": {}
    }
}
```

## Fader Control (Get/Set)
Sets the fader level of a channel
- `function` "faderControl"
- `channel` The channel to control
- `level` The level of the channel 0-127

### Example message from the console
```
var msg = {
    "payload": {
        "function": "faderControl",
        "channel": 0,
        "level": 0-127
    }
}
```

### Example request to the console
```
//Request to set the mute to on for channel 1
var msg = {
    "payload": {
        "function": "faderControl",
        "channel": "1",
        "state": 0-127
    }
}
```

### Example get from the console
Due to limitations on the iLive protocol these values may be unpopulated until updated!
```
var msg = {
    "payload": {
        "function": "faderControl"
    }
}

//Returns 
var msg = {
    "payload": {
        "function": "faderControl",
        "levels": {}
    }
}
```

## Scene Control (Get/Set)
Recall a scene on the console 
- `function` "sceneRecall"
- `sceneNumber` The scene number

### Example message from the console
```
var msg = {
    "payload": {
        "function": "sceneRecall",
        "sceneNumber": 0
    }
}
```

### Example request to the console
```
//Request to set the mute to on for channel 1
var msg = {
    "payload": {
        "function": "sceneRecall",
        "sceneNumber": 0
    }
}
```

### Example get from the console
Due to limitations on the iLive protocol these values may be unpopulated until updated!
```
var msg = {
    "payload": {
        "function": "sceneRecall"
    }
}

//Returns 
var msg = {
    "payload": {
        "function": "sceneRecall",
        "scene": 0
    }
}
```