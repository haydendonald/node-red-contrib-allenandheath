module.exports = {
    sysexHeader: {
        allCall: [0xF0, 0x00, 0x00, 0x1A, 0x50, 0x11, 0x01, 0x00, 0x7F]
    },

    functions: {
        sendPing: require("./modeSendPing.js")
    }
}