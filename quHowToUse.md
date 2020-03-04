# How to use for QU consoles

## General Command Layout

```
//Received Information Format
var msg.payload = {
    "function": "The function recieved",
    ...
}

//Send Information Format
var msg.payload = {
    "function": "The function to perform",
    "type": "get/set",
    ...
}

... = Specific function parameters, see below functions for more
```


## Fader Level (Get/Set)
Sets/Gets the channel name
- `function` "faderLevel"
- `inputChannel` which is an array containing each input

- `level` The level of the fader (0-100%)
- `id` The raw id of the channel

### Example message from the console
```
var msg = {
    "payload": {
        "function": "channelName",
        "inputChannel": {
            1: {
                "level": 100,
                "id": 10
            },
            2: {
                "level": 0
                "id": 11
            }
        }
    }
}
```

### Example request to the console
```
//Request to set the channel level
var msg = {
    "payload": {
        "function": "channelLevel",
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
        "function": "channelLevel"
    }
}
```

## Channel Name (Get/Set)
Sets/Gets the channel name
- `function` "channelName"
- `inputChannel` Array[channel] where each channel has `name` The channel name, `id` The raw id of the channel

### Example message from the console
```
var msg = {
    "payload": {
        "function": "channelName",
        "inputChannel": {
            1: {
                "name": "Hello World!",
                "id": 10
            },
            2: {
                "name": "Hello World!",
                "id": 11
            }
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