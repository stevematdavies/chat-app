const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection',(socket) => {

    socket.broadcast.emit('serverMessage', 'A new user has joined');

    socket.on('locationSent', (coords) => {
        const { latitude, longitude } = coords;
        const url = `https://google.com/maps/?q=${latitude},${longitude}`;
        io.emit('locationRecieved', url)
    });

    socket.on('disconnect',() => {
        io.emit('serverMessage', 'A new user left');
    });

    socket.on('onClientMessageSent', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Watch your language please!!');
        }
        io.emit('onClientMessageRecieved', message);
    });
});

server.listen(port, () => {
    console.log('App running on port: ', port)
});