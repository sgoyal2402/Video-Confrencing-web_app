var divSelectRoom = document.getElementById("selectRoom")
var divConsultRoom = document.getElementById("consultingRoom")
var inputroomNumber = document.getElementById("roomNumber")
var btnGo = document.getElementById("goRoom")
var localVideo = document.getElementById("localVideo")
var remoteVideo = document.getElementById("remoteVideo")

var roomNumber
var localStream
var remoteStream
var rtcPeerConnection

var iceServers = {
    'iceServers': [
        {'url': 'stun:stun.services.mozilla.com'},
        {'url': 'stun:stun.l.google.com:19302'}
    ]
}

var streamConstraints = {audio:true , video: true};
var isCaller

var socket = io()

btnGo.onclick = () => {
    if(inputroomNumber.value === '')
    alert("Enter a room number!!!")
    else {
        roomNumber = inputroomNumber.value;
        socket.emit("create or join", roomNumber);
        divSelectRoom.style= "display : none";
        divConsultRoom.style = "display:block";

    }

};

socket.on('created', (room) => {
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function(stream) {
        localStream = stream;
        console.log("working");
        localVideo.srcObject = stream;
        isCaller = true;
    })
    .catch((err) => {
        console.log("An error occured while connecting to media" + err);
    })
})

socket.on('joined', (room) => {
    navigator.mediaDevices.getUserMedia(streamConstraints).then((stream) => {
        localStream = stream
        localVideo.srcObject = stream;
        socket.emit('ready', roomNumber);
    })
    .catch((err) => {
        console.log("An error occured while connecting to media");
    })
})



socket.on('ready', () => {
 if(isCaller){
     rtcPeerConnection = new RTCPeerConnection(iceServers)

     rtcPeerConnection.onicecandidate = onIceCandidate;
     rtcPeerConnection.onaddstream = onAddStream;

     rtcPeerConnection.addStream(localStream);

     rtcPeerConnection.createOffer(setLocalAndOffer, (e) => {console.log(e);})
 }
})


socket.on('offer', (event) => {
    if(!isCaller){
        rtcPeerConnection = new RTCPeerConnection(iceServers)

     rtcPeerConnection.onicecandidate = onIceCandidate;
     rtcPeerConnection.onaddstream = onAddStream;

     rtcPeerConnection.addStream(localStream);

     rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))

     rtcPeerConnection.createAnswer(setLocalAndAnswer, (e) => {console.log(e);})

    }

})


socket.on('answer', (event) => {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})


socket.on('candidate', (event) => {
    var candidate = new RTCIceCandidate({
        sdpMLineIndex:event.label,
        candidate: event.candidate
    })

    rtcPeerConnection.addIceCandidate(candidate);

})


function onAddStream(event){

    remoteVideo.srcObject = event.stream
    remoteStream = event.stream

}

function onIceCandidate(event){
    if(event.candidate){
        console.log('Sending a candidate');
        socket.emit('candidate', {
            type: "candidate",
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        })
    }
}


function setLocalAndOffer(sessionDescription) {

    rtcPeerConnection.setLocalDescription(sessionDescription)

    socket.emit('offer', {
        type: "offer",
        sdp: sessionDescription,
        room: roomNumber
    })

}


function setLocalAndAnswer(sessionDescription) {

    rtcPeerConnection.setLocalDescription(sessionDescription)

    socket.emit('answer', {
        type:'answer',
        sdp: sessionDescription,
        room: roomNumber
    })
}

