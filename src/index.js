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
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));



io.on('connection',(socket) => {

    socket.on('join', (data, callback) => {

        const userToJoin = {id: socket.id, ...data};
        const {user, error }  =  addUser(userToJoin);

        if (error) {return callback(error)}
        socket.join(user.room);
        socket.emit('serverMessage', generateMessage(user.username,`Welcome ${user.username}`));
        socket.broadcast.to(user.room).emit('serverMessage',generateMessage(user.username,`${ user.username} has joined!`));
        io.to(user.room).emit('userListUpdated', getUsersForRoom(user.room));
        callback()
    });

    socket.on('disconnect', () => {
        const removedUser = removeUser(socket.id);
        if(removedUser) {
            const { room, username } = removedUser;
            io.to(room).emit('serverMessage', generateMessage(username,`${username}, has left the room`));
            io.to(room).emit('userListUpdated', getUsersForRoom(room));
        }
    });

    socket.on('onClientMessageSent', (message, callback) => {
        const filter = new Filter();
        const { room, username } = getUser(socket.id);
        if (filter.isProfane(message)) {
            return callback(generateMessage(username, 'Watch your language please!!'));
        }
        io.to(room).emit('onClientMessageRecieved', generateMessage(username,message));
        callback();
    });

    socket.on('locationSent', (coords) => {
        const { latitude, longitude } = coords;
        const user = getUser(socket.id);
        const url = `https://google.com/maps/?q=${latitude},${longitude}`;
        io.to(user.room).emit('locationRecieved', generateLocation(user.username, url));
    });
});

server.listen(port, () => {
    console.log('App running on port: ', port)
});