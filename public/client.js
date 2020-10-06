var divSelectRoom = document.getElementById("selectRoom")
var divConsultRoom = document.getElementById("consultingRoom")
var inputroomNumber = document.getElementById("roomNumber")
var btnGo = document.getElementById("goRoom")
var myVideo = document.createElement('video');


var roomNumber

const peer = new Peer (undefined, {
    host: '/',
    port: 3001,
    
});

var peers = {}

var streamConstraints = {audio:true , video: true};
var isCaller

var socket = io()

btnGo.onclick = () => {
    if(inputroomNumber.value === '')
    alert("Enter a room number!!!")
    else {
        roomNumber = inputroomNumber.value;
        
        peer.on('open', id=> {
            socket.emit('join', roomNumber, id)
            console.log('joined');
        })
        
        divSelectRoom.style= "display : none";
        divConsultRoom.style = "display:block";

    }

};


peer.on('open', id=> {
    socket.emit('join', roomNumber, id)
    console.log('joined');
})


    navigator.mediaDevices.getUserMedia(streamConstraints).then((stream) => {
        addVideoStream(myVideo, stream)

        peer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
              addVideoStream(video, userVideoStream)
            })
        })

        socket.on('connected', userId => {
            console.log(userId, "connected");

            connectToNewUser(userId, stream);

        } )
    })
    .catch((err) => {
        console.log("An error occured while connecting to media", err);
    })

    socket.on('disconnected', userId => {
        if (peers[userId]) 
        peers[userId].close()
    })



function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
      video.remove()
    })
  
    peers[userId] = call
  }
  
  function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
      video.play()
    })
    divConsultRoom.appendChild(video)
  }
