let socket = io(); //connect ro socket.io
var sid = "";
var joinedPlayers = {};
var readyPlayers = {};
var myName = "";

//document.getElementById("me").addEventListener("click", () => { socket.emit("test", "The big bad wolf.") });  //test

//when connected succesfully
socket.on("connect", () => {
    sid = socket.id;
    console.log(sid);
});
//when the server sends the updated list of users
socket.on("connectionIDs", (msg) => {
    console.log(msg);
    //out = document.getElementById('connectionsList'); //the div in which to put the ids
    //out.innerHTML = ""; //clear the div
    //put each id in the div as a new div
    //msg.forEach(element => {
    //    out.innerHTML += `<div class="connectedUser">${element}</div>`;
    //});
});
socket.on("gameRunningError", (msg) => {
    alert(`Server says: ${msg}`);
})
socket.on("joinPlayersNames", (msg) => {
    console.log(msg);
    joinedPlayers = msg;
    updatePlayerLists();
})

socket.on("joinSuccessful", (msg) => {
    //TODO
    //hide the join screen
    console.log(msg);
    myName = joinedPlayers[sid];
    console.log(`my name is: ${myName}`);
})

socket.on("readyPlayers", (msg) => {
    readyPlayers = msg;
    updatePlayerLists();
});

document.getElementById('startReady').onclick = function () {
    socket.emit("playerReady", sid);
}

function joinGame() {
    var playerName = document.forms["join"]["name"].value;
    socket.emit("playerJoin", playerName);
}

function updatePlayerLists() {
    //join Screen
    const jpl = document.getElementById("joinPlayersList");
    jpl.innerHTML = "";
    for (let key in joinedPlayers) {
        jpl.innerHTML += `<span class="joinPlayerName">${joinedPlayers[key]}</span><br />`;
    }
    //start Screen 
    const rr = document.getElementById('startReadyPlayers');
    const nr = document.getElementById('startNotReadyPlayers');
    notReadyPlayers = {};
    for(key in joinedPlayers){
        notReadyPlayers[key] = joinedPlayers[key];
    }
    rr.innerHTML = "";
    for(key in readyPlayers){
        rr.innerHTML += `<div class="startReadyPlayer"><div></div><span>${readyPlayers[key]}</span></div>`
        delete notReadyPlayers[key];
    }
    nr.innerHTML = "";
    for(key in notReadyPlayers){
        nr.innerHTML += `<div class="startNotReadyPlayer"><div></div><span>${notReadyPlayers[key]}</span></div>`
    }
}