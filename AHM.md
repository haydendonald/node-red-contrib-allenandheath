# How to use for AHM consoles

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
    ...
}

//Connection Updates
{
    "topic": "connectionState",
    "payload": "connected/disconnected/reconnecting"
}

... = Specific function parameters, see below functions for more
```

## Mute Control (muteControl) (Get/Set)
Sets/Gets the mute state of a channel

### Example message from the console
```
var msg = {
    "payload": {
        "function": "muteControl",
        "channel": {
            1: true/false,
            2: true/false
            ...
        },
        "zone": {
            1: true/false,
            2: true/false
            ...
        },
        "controlGroup": {
            1: true/false,
            2: true/false
            ...
        }
    }
}
```

### Example request to the console
```
//Request to set the mute to on for channel 1
var msg = {
    "payload": {
        "function": "muteControl",
        "channelSelection": "channel/zone/controlGroup",
        "channel": 1,
        "muted": true
    }
}
```

```
//Request to get channels
var msg = {
    "payload": {
        "function": "muteControl"
    }
}
```


## Fader Level (Get/Set)
Sets/Gets the channel fader level
- `function` "faderLevel"
- `inputChannel` which is an array containing each input

- `channelType` The channel type to set
- `channel` The channel id
- `level` The level of the fader (0-100%)

### Example message from the console
```
var msg = {
    "payload": {
        "function": "faderLevel",
        "inputChannel": {
            1: 100,
            2:  0
        }
        ...
    }
}
```

### Example request to the console
```
//Request to set the channel level
var msg = {
    "payload": {
        "function": "faderLevel",
        "channelType": "inputChannel",
        "channel": "1",
        "level": 100
    }
}
```

```
//Request to get channel levels
var msg = {
    "payload": {
        "function": "faderLevel"
    }
}
```

## Channel Name (Get/Set)
Sets/Gets the channel name
- `function` "channelName"
- `inputChannel` Array of the channels

- `channelType` The channel type to set
- `channel` The channel id
- `name` The string to set the channel name to

### Example message from the console
```
var msg = {
    "payload": {
        "function": "channelName",
        "inputChannel": {
            1: "Hello World!",
            2: "Hello World!"
        }
    }
}
```

### Example request to the console
```
//Request to set the channel name
var msg = {
    "payload": {
        "function": "channelName",
        "channelType": "inputChannel",
        "channel": "1",
        "name": "Nice"
    }
}
```

```
//Request to get channel names
var msg = {
    "payload": {
        "function": "channelName"
    }
}
```

## Scene Recall (Get/Set)
Recalls a scene
- `function` "sceneRecall"
- `currentScene` The current scene

- `scene` The scene id to recall

### Example message from the console
```
var msg = {
    "payload": {
        "function": "sceneRecall",
        "currentScene": 1
    }
}
```

### Example request to the console
```
//Request to recall a scene
var msg = {
    "payload": {
        "function": "sceneRecall",
        "scene": 2
    }
}
```

```
//Request to get the current scene
var msg = {
    "payload": {
        "function": "sceneRecall"
    }
}
```