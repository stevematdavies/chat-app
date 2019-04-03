const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocation} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection',(socket) => {

    socket.on('locationSent', (coords) => {
        const { latitude, longitude } = coords;
        const url = `https://google.com/maps/?q=${latitude},${longitude}`;
        io.emit('locationRecieved', generateLocation(url));
    });

    socket.on('disconnect',() => {
        io.emit('serverMessage', generateMessage('A user has left'));
    });

    socket.on('join',({username, room }) => {
        socket.join(room);
        socket.emit('serverMessage', generateMessage(`Welcome ${username}`));
        socket.broadcast.to(room).emit('serverMessage',generateMessage(`${username} has joined!`));
    })

    socket.on('onClientMessageSent', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback(generateMessage('Watch your language please!!'));
        }
        io.to('Digia').emit('onClientMessageRecieved', generateMessage(message));
    });
});

server.listen(port, () => {
    console.log('App running on port: ', port)
});