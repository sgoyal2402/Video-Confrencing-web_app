var create = document.getElementById('create');

var join = document.getElementById('join');

var roomId = document.getElementById('roomId').value;

create.onclick = () => {
    roomId = Math.floor(Math.random()*10000 + 1);
    window.location.href = `http://localhost:3000/${roomId}`;
}

join.onclick = () => {
    roomId = document.getElementById('roomId').value;
    window.location.href = `http://localhost:3000/${roomId}` ;
}

