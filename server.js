
const express = require('express');

const app = express()

const http = require('http').Server(app)

var io = require('socket.io')(http)

// const {PeerServer} = require('peer')

// const peerServer = PeerServer({port: 3001, path: '/serve'})
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {

    res.render('home');

})

app.get('/:roomId', (req, res) => {

    res.render('room', {roomId: req.params.roomId});
})

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