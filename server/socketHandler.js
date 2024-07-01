const {getDataNowMW} = require('./middleware');

const connectedSockets = [];

exports.addSocket = (adafruit_username, socket) => {
    connectedSockets[adafruit_username] = socket;
};

exports.getSocket = (adafruit_username) => {
    return connectedSockets[adafruit_username];
};

exports.removeSocket = (adafruit_username) => {
    delete connectedSockets[adafruit_username];
};

exports.getDataNow = async (socket) => {
    try {
        const {adafruit_username, adafruit_key} = socket.handshake.query;
        const data = await getDataNowMW({adafruit_username, adafruit_key});
        socket.emit('dataNow', data);
    } catch (error) {
        console.log(error);
        socket.emit('error', error);
    }
}
