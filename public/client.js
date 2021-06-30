var divConsultRoom = document.getElementById("consultingRoom");
var myVideo = document.createElement("video");
var endCall = document.getElementById("end-call");
var chatBtn = document.querySelector(".chat");
var chat = document.getElementById("chats");
var details = document.getElementById("details");
details.click();

chatBtn.onclick = () => {
  chat.classList.toggle("d-none");
};

var message = document.getElementById("chat");
var messages = document.getElementById("messages");

message.onkeydown = (e) => {
  if (e.keyCode == 13) {
    socket.emit("message", message.value, myPeerId);
    console.log(message.value);

    addMsg(message.value, myPeerId);
    message.value = null;
  }
};

var peers = [];
var peersObj = [];
var streamConstraints = { audio: true, video: true };
var socket = io();

navigator.mediaDevices.getUserMedia(streamConstraints).then((stream) => {
  myVideo.srcObject = stream;
  myVideo.muted = true;
  myVideo.autoplay = true;
  divConsultRoom.appendChild(myVideo);
  socket.emit("join room", roomNumber);
  socket.on("all users", (users) => {
    users.forEach((userID) => {
      const peer = createPeer(userID, socket.id, stream);
      peersObj.push({
        peerID: userID,
        peer,
      });
      peers.push(peer);
    });
  });

  socket.on("user joined", (payload) => {
    const peer = addPeer(payload.signal, payload.callerID, stream);
    peersObj.push({
      peerID: payload.callerID,
      peer,
    });
    peers.push(peer);
  });

  socket.on("receiving returned signal", (payload) => {
    const item = peersObj.find((p) => p.peerID === payload.id);
    item.peer.signal(payload.signal);
  });
});

function createPeer(userToSignal, callerID, stream) {
  const peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream,
  });

  peer.on("signal", (signal) => {
    socket.emit("sending signal", {
      userToSignal,
      callerID,
      signal,
    });
  });

  peer.on("stream", (stream) => {
    addVideo(callerID, stream);
  });

  peer.on("close", () => {
    removeVideo(callerID);
  });

  return peer;
}

function addPeer(incomingSignal, callerID, stream) {
  const peer = new SimplePeer({
    initiator: false,
    trickle: false,
    stream,
  });

  peer.on("signal", (signal) => {
    socket.emit("returning signal", { signal, callerID });
  });

  peer.signal(incomingSignal);

  peer.on("stream", (stream) => {
    addVideo(callerID, stream);
  });

  peer.on("close", () => {
    removeVideo(callerID);
  });

  return peer;
}

function addVideo(callerID, stream) {
  console.log(callerID);
  var video = document.createElement("video");
  video.id = callerID;
  video.autoplay = true;
  video.srcObject = stream;
  divConsultRoom.appendChild(video);
}

function removeVideo(callerID) {
  var video = document.getElementById(callerID);
  divConsultRoom.removeChild(video);
}
