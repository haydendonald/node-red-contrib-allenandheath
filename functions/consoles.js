module.exports = {
    object: function() { return {
        iLive: require("./ilive/parameters.js"),
        dLive: require("./dlive/parameters.js"),
        qu: require("./qu/parameters.js").object()
    }}
}