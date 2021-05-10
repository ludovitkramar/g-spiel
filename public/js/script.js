let socket = io.connect("/", { path: "/gSpiel/socket.io" }); //connect ro socket.io
var sid = ""; //the session id of this player
var joinedPlayers = {}; //same object as the server
var readyPlayers = {}; //same object as the server
var myName = ""; //the players name as returned from the server


//when connected succesfully
socket.on("connect", () => {
    sid = socket.id;
    console.log(sid);
});

socket.on("connectionIDs", (msg) => { //when the server sends the updated list of users
    console.log(msg);
});

socket.on("gameRunningError", (msg) => { //when the servers report an error
    alert(`Server says: ${msg}`);
})

socket.on("joinPlayersNames", (msg) => {
    console.log(msg); //object with the ids and names of users that have joined.
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
    readyPlayers = msg; //object with id and name of players that are ready.
    console.log(msg);
    updatePlayerLists();
});

socket.on("startGame", (msg) => {
    console.log("server says:" + msg);
});

socket.on("endGame", (msg) => {
    console.log("server says:" + msg);
})

document.getElementById('startReady').onclick = function () {
    socket.emit("playerReady", sid); //tell the server you are ready
}

function joinGame() {
    var playerName = document.forms["join"]["name"].value;
    socket.emit("playerJoin", playerName);
}

function updatePlayerLists() {
    //join Screen
    const jpl = document.getElementById("joinPlayersList"); //div where players that have joined are shown
    jpl.innerHTML = "";
    for (let key in joinedPlayers) {
        jpl.innerHTML += `<span class="joinPlayerName">${joinedPlayers[key]}</span><br />`;
    }
    //start Screen 
    const rr = document.getElementById('startReadyPlayers'); //div element in which ready players are shown 
    const nr = document.getElementById('startNotReadyPlayers'); //same but for not ready
    notReadyPlayers = {};
    for (key in joinedPlayers) { //create a copy of "joined players" named "not ready players".
        notReadyPlayers[key] = joinedPlayers[key];
    }
    rr.innerHTML = ""; //clear the div
    for (key in readyPlayers) {
        rr.innerHTML += `<div class="startReadyPlayer"><div></div><span>${readyPlayers[key]}</span></div>` //create list of ready players
        delete notReadyPlayers[key]; //remove all players that are ready, so that only the not ready ones are left.
    }
    nr.innerHTML = ""; //clear the div
    for (key in notReadyPlayers) {
        nr.innerHTML += `<div class="startNotReadyPlayer"><div></div><span>${notReadyPlayers[key]}</span></div>`
    }
    var readyCount = Object.keys(readyPlayers).length; // players that are ready
    var joinedCount = Object.keys(joinedPlayers).length; //player that have joined
    document.getElementById('startProportion').innerHTML = (readyCount + "/" + joinedCount); //put that proportion info on the page
}