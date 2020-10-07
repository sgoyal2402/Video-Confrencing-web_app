
var divConsultRoom = document.getElementById("consultingRoom");

var myVideo = document.createElement("video");

var endCall = document.getElementById('end-call')

var chatBtn = document.querySelector('.chat')

var chat = document.getElementById('chats')

chatBtn.onclick = () => {
    chat.classList.toggle('d-none');

}

var message = document.getElementById('chat');
var messages = document.getElementById('messages');

message.onkeydown = (e) => {
    if(e.keyCode == 13){
        socket.emit('message', message.value)
        console.log(message.value);
        
        addMsg(message.value);
        message.value = null
    }
    
}



var myPeerId;

const peer = new Peer(undefined, {
  host: "/",
  port: 3001,
});

var peers = {};

var streamConstraints = { audio: true, video: true };
var isCaller;

var socket = io();

peer.on("open", (id) => {
    socket.emit("join", roomNumber, id);
    myPeerId = id;
    console.log("joined");
  });


navigator.mediaDevices
  .getUserMedia(streamConstraints)
  .then((stream) => {
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("connected", (userId) => {
      console.log(userId, "connected");

      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => {
    console.log("An error occured while connecting to media", err);
  });

socket.on('messaged', (msg) => {

console.log(msg);
addMsg(msg);

})


socket.on("disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

endCall.onclick = () => {
    socket.emit('disconnect', myPeerId);
    window.location.href = 'http://localhost:3000';
}

function connectToNewUser(userId, stream) {
  const call = peer.call(userId, stream);

  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
    console.log('added a stream');
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  divConsultRoom.appendChild(video);
}


function addMsg(msg) {

    const text = document.createElement('p')
    text.innerText = msg;
    messages.appendChild(text);



}