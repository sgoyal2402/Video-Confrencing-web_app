
const express = require('express');

const app = express()

const http = require('http').Server(app)

var io = require('socket.io')(http)

// const {PeerServer} = require('peer')

// const peerServer = PeerServer({port: 3001, path: '/serve'})

app.use(express.static('public'))

io.on('connection' , (socket) => {

    console.log('a user connected');

    socket.on('join', (roomId, userId) => {

        console.log("User Joined ", roomId)


      socket.join(roomId)
      socket.to(roomId).broadcast.emit('connected', userId)
  
      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('disconnected', userId)
      })
    })


    

})


http.listen(3000, () => {
    console.log('Server running on 3000');
})