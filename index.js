
const express = require('express');

const app = express()

const http = require('http').Server(app)

var io = require('socket.io')(http)

//Peer server

const {PeerServer} = require('peer')
const peerServer = PeerServer({port: 3001, path: '/'})

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {

    res.render('home');

})

app.get('/:roomId', (req, res) => {

    res.render('room', {roomId: req.params.roomId});
})

app.get('/end/call', (req, res) => {
    res.render('leave');
})

io.on('connection' , (socket) => {

    console.log('a user connected');

    socket.on('join', (roomId, userId) => {

        console.log("User Joined ", roomId)


      socket.join(roomId, (err) => {if(err) console.log(err);})

      //Brodcast to all when needed
      socket.to(roomId).broadcast.emit('connected', userId)

      socket.on('message', (msg, id) => {
          socket.to(roomId).broadcast.emit('messaged', msg, id);
      })
  
      socket.on('disconnect', () => {
        socket.to(roomId).broadcast.emit('disconnected', userId)

      })
    })


    

})


http.listen(3000, () => {
    console.log('Server running on 3000');
})

