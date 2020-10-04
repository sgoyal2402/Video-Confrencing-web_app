const { log } = require('console');
const express = require('express');

const app = express()

const http = require('http').Server(app)

var io = require('socket.io')(http)

app.use(express.static('public'))

io.on('connection' , (socket) => {

    console.log('a user connected');

    socket.on('create or join', (room) => {
        console.log('create or join to room', room);

        var myRoom = io.sockets.adapter.rooms[room] || {length: 0}
        var numCLients = myRoom.length;

        console.log(room +' has'+ numCLients + ' clients');

        if(numCLients === 0){
            socket.join(room);
            socket.emit('created', room)
        }

        else if(numCLients === 1){
            socket.join(room)
            socket.emit('joined', room)
        }

        else{
            socket.emit('full', room)
        }

    })


    socket.on('ready', (room) => {
        socket.broadcast.to(room).emit('ready');
    })

    socket.on('candidate', (event) => {
        socket.broadcast.to(event.room).emit('candidate', event)
    })

    socket.on('offer', (event) => {
        socket.broadcast.to(event.room).emit('offer', event.sdp)
    })

    socket.on('answer', (event) => {
        socket.broadcast.to(event.room).emit('answer', event.sdp)
    })

})


http.listen(3000, () => {
    console.log('Server running on 3000');
})