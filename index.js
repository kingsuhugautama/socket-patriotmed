const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const antrian = [];
let nomorAntrian = 1;

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('joinQueue', () => {
        antrian.push(socket.id);
        io.emit('queueUpdate', antrian); // Notify all user about the updated queue
    });

    socket.on('callNextNumber', () => {
        if (antrian.length > 0) {
          const nextNumber = nomorAntrian;
          nomorAntrian++;
          const userToCall = antrian.shift();
          io.to(userToCall).emit('yourTurn', nextNumber);
          io.emit('queueUpdate', antrian); // Notify all user about the updated queue
        }
    });

    socket.on('disconnect', () => {
        if(antrian.length > 0){
            const callAntrian = antrian.shift();
            io.emit('queue', antrian);
        }
        console.log('A user disconnected.');
    });
});

server.listen(3000, () => {
console.log('listening on *:3000');
});