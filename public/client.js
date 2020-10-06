
var divConsultRoom = document.getElementById("consultingRoom");

var myVideo = document.createElement("video");

const peer = new Peer(undefined, {
  host: "/",
  port: 3001,
});

var peers = {};

var streamConstraints = { audio: true, video: true };
var isCaller;

var socket = io();

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

peer.on("open", (id) => {
  socket.emit("join", roomNumber, id);
  console.log("joined");
});

socket.on("disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

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
