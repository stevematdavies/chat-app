const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocation} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersForRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection',(socket) => {

    socket.on('join', (data, callback) => {

        const userToJoin = {id: socket.id, ...data};
        const {user, error }  =  addUser(userToJoin);

        if (error) {return callback(error)}
        socket.join(user.room);
        socket.emit('serverMessage', generateMessage(`Welcome ${user.username}`));
        socket.broadcast.to(user.room).emit('serverMessage',generateMessage(`${ user.username} has joined!`));
        callback()
    });

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if(removedUser) {
            io.to(removedUser.room).emit('serverMessage', generateMessage(`${removedUser.username}, has left the room`));
        }
    });

    socket.on('onClientMessageSent', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback(generateMessage('Watch your language please!!'));
        }
        io.to('Digia').emit('onClientMessageRecieved', generateMessage(message));
    });

    socket.on('locationSent', (coords) => {
        const { latitude, longitude } = coords;
        const url = `https://google.com/maps/?q=${latitude},${longitude}`;
        io.emit('locationRecieved', generateLocation(url));
    });

});

server.listen(port, () => {
    console.log('App running on port: ', port)
});