const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection',(socket) => {

    socket.broadcast.emit('serverMessage', 'A new user has joined');

    socket.on('locationSent', (coords) => {
        console.log(coords);
        io.emit('locationRecieved', coords)
    });

    socket.on('disconnect',() => {
        io.emit('serverMessage', 'A new user left');
    });

    socket.on('onClientMessageSent', message => {
        io.emit('onClientMessageRecieved', message);
    });
});

server.listen(port, () => {
    console.log('App running on port: ', port)
});