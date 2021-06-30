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

endCall.onclick = () => {
  window.location.href = "/end/call";
};

var message = document.getElementById("chat");
var messages = document.getElementById("messages");

message.onkeydown = (e) => {
  if (e.keyCode == 13) {
    socket.emit("message", message.value, socket.id);
    console.log(message.value);

    addMsg(message.value, socket.id);
    message.value = null;
  }
};

var peers = [];
var peersObj = [];
var streamConstraints = { audio: true, video: true };
var socket = io();

navigator.mediaDevices.getUserMedia(streamConstraints).then((stream) => {
  //Adding own stream-video
  myVideo.srcObject = stream;
  myVideo.muted = true;
  myVideo.autoplay = true;
  var div = document.createElement("div");
  div.className = "video-participant";
  div.appendChild(myVideo);
  divConsultRoom.appendChild(div);

  //Various signaling and adding remote peers
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

//Recieve messages
socket.on("messaged", (msg, id) => {
  console.log(msg);
  addMsg(msg, id);
});

//Some Useful functions
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

  var div = document.createElement("div");
  div.className = "video-participant";

  div.appendChild(video);
  divConsultRoom.appendChild(div);
}

function removeVideo(callerID) {
  var video = document.getElementById(callerID);
  divConsultRoom.removeChild(video);
}

function addMsg(msg, id) {
  var m = createCard(msg, id);

  messages.appendChild(m);
}

function createCard(msg, id) {
  const card = `<div class = "card-body">
    <small class="card-subtitle mb-2 text-muted">User ${id.slice(0, 8)}</small>
     <p class = "card-text">${msg}</p>
      </div> `;

  var c = document.createElement("div");
  c.innerHTML = card;
  c.classList.add("card");
  c.classList.add("mb-1");

  return c;
}
