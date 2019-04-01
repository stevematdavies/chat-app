const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT | 3000;

app.use(express.static(path.join(__dirname, '../public')));

let COUNT = 0;

io.on('connection',(socket) => {
    console.log('New Socket connection!');
    socket.emit('countUpdated')
});

server.listen(port, () => {
    console.log('App running on port: ', port)
});