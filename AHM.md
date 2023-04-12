# How to use for AHM consoles

## General Command Layout

```javascript
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
```javascript
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
```javascript
var msg = {
    "payload": {
        "function": "muteControl",
        "source": "channel1" //Example would be channel1, zone5, or controlGroup9
        "muted": true
    }
}
```

```javascript
//Request to get channels
var msg = {
    "payload": {
        "function": "muteControl"
    }
}
```


## Fader Level (faderLevel) (Get/Set)
Sets/Gets the level of a channel

### Example message from the console
```javascript
var msg = {
    "payload": {
        "function": "faderLevel",
        "channel": {
            1: 0-127
            2: 0-127
            ...
        },
        "zone": {
            1: 0-127
            2: 0-127
            ...
        },
        "controlGroup": {
            1: 0-127
            2: 0-127
            ...
        }
    }
}
```

### Example request to the console
```javascript
var msg = {
    "payload": {
        "function": "faderLevel",
        "source": "channel1" //Example would be channel1, zone5, or controlGroup9
        "level": 0-127
    }
}
```

```javascript
//Request to get channels
var msg = {
    "payload": {
        "function": "faderLevel"
    }
}
```

## Zone Send Mute Control (zoneSendMuteControl) (Get/Set)

### Example message from the console
```javascript
return {
    "payload": {
        "function": "zoneSendMuteControl",
        "channel": {
            1: {
                "zone": {
                    1: true/false,
                    2: true/false
                    ...
                }
            }
            ...
        },
        "zone": {
            1: {
                "zone": {
                    1: true/false,
                    2: true/false
                    ...
                }
                ...
            }
            ...
        }
    }
}
```

### Example request to the console
```javascript
return {
    "payload": {
        "function": "zoneSendMuteControl",
        "source": "zone5", //Examples would be channel1, zone5, or controlGroup9
        "send": "zone28", //Examples would be channel1, zone5, or controlGroup9
        "muted": false
    }
}
```

```javascript
//Request to get channels
var msg = {
    "payload": {
        "function": "zoneSendMuteControl"
    }
}
```

## Zone Send Fader Level (zoneSendFaderLevel) (Get/Set)

### Example message from the console
```javascript
return {
    "payload": {
        "function": "zoneSendFaderLevel",
        "channel": {
            1: {
                "zone": {
                    1: 0-127
                    2: 0-127
                    ...
                }
            }
            ...
        },
        "zone": {
            1: {
                "zone": {
                    1: 0-127
                    2: 0-127
                    ...
                }
                ...
            }
            ...
        }
    }
}
```

### Example request to the console
```javascript
return {
    "payload": {
        "function": "zoneSendFaderLevel",
        "source": "zone5", //Examples would be channel1, zone5, or controlGroup9
        "send": "zone28", //Examples would be channel1, zone5, or controlGroup9
        "level": 0-127
    }
}
```

```javascript
//Request to get channels
var msg = {
    "payload": {
        "function": "zoneSendFaderLevel"
    }
}
```