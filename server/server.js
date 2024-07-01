const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');
const socketHandler = require('./socketHandler');
const getDataRoute = require('./routes/getDataRoute');
const authenticRoute = require('./routes/authenticRoute');
const updateDataRoute = require('./routes/updateDataRoute');
const adafruitInteractRoute = require('./routes/adafruitInteractRoute');

const app = express();
const port = 3001

app.use(cors());
app.use(express.json())
app.use('/api', getDataRoute);
app.use('/api', authenticRoute);
app.use('/api', updateDataRoute);
app.use('/api', adafruitInteractRoute);


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }

});

let interval;
io.on('connection', (socket) => {
    console.log('a user connected');
    socketHandler.addSocket(socket.handshake.query.adafruit_username, socket);
    if (interval) {
        clearInterval(interval);
    }
    interval = setInterval(() => socketHandler.getDataNow(socket), 5000);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        clearInterval(interval);
        socketHandler.removeSocket(socket.handshake.query.adafruit_username);
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
