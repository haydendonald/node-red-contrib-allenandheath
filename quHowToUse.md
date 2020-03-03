# How to use for QU consoles

## General Command Layout

```
//Received Information Format
var msg.payload = {
    "mode": "The mode recieved",
    ...
}

//Send Information Format
var msg.payload = {
    "mode": "The mode to perform",
    "type": "get/set",
    ...
}

... = Specific mode parameters, see below modes for more
```




## Super Source Box Control (Get/Set)
Controls the box control under the super source
- `cmd` "superSourceBox"
- `data` Array[superSourceID][boxID] where super source 1 box 3 will be Array[1][3]
- `superSourceID` the super source to change the box on
- `box` the box to change
- `enabled` should the box be enabled?
- `inputNumber` `videoSource` the input to set the box to (can be either a raw inputNumber or a videoSource object)
- `xPosition` the x position
- `yPosition` the y position
- `size` the size of the box
- `cropEnabled` should the crop be enabled?
- `cropTop` the top crop position
- `cropBottom` the bottom crop position
- `cropLeft` the left crop position
- `cropRight` the right crop position

### Example message from the ATEM
```
var msg = {
    "payload": {
        "cmd": "superSourceBox",
        "data": {
            //Super Source ID
            1: {
                //Box ID
                1: {
                    "enabled": true,
                    "inputNumber": 0,
                    "videoSource": {
                        "id": 0,
                        "longName": "black"
                    },
                    "xPosition": 15.0,
                    "yPosition": 20.0,
                    "size": 1.0,
                    "cropEnabled": true,
                    "cropTop": 1.0,
                    "cropBottom": 1.0,
                    "cropLeft": 1.0,
                    "cropRight": 1.0
                },
                2: {
                    ....
                }
            }
        }
    }
}
```

### Example request to the ATEM
```
//Request to set the super source box on super source 1 box 4 to change input
var msg = {
    "payload": {
        "cmd": "superSourceBox",
        "data": {
            "superSourceID": 1,
            "box": 4,
            "videoSource": {
                "id": 5
            }

            //You don't need to set everything if a parameter is not set it will set it to what was read in
        }
    }
}
