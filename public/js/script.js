let socket = io.connect("/", { path: "/socket.io" }); //connect ro socket.io
var sid = ""; //the session id of this player
var joinedPlayers = {}; //same object as the server
var readyPlayers = {}; //same object as the server
var myName = ""; //the players name as returned from the server
let clientGame = {};

//when connected succesfully
socket.on("connect", () => {
    sid = socket.id;
    console.log(sid);
    //TODO: check if there is something in localstorage, and if game is running try to reconnect
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

socket.on("joinSuccessful", (msg) => { //server says joined succesfully
    //TODO
    //hide the join screen
    console.log(msg);
    myName = joinedPlayers[sid];
    console.log(`my name is: ${myName}`);
})

socket.on("readyPlayers", (msg) => { //server send array of players that are ready
    readyPlayers = msg; //object with id and name of players that are ready.
    console.log(msg);
    updatePlayerLists();
});

socket.on("startGame", (msg) => {  //server orders: start game!
    //TODO: hide ready screen and shit
    localStorage.setItem("gameID", sid) //add this sID to local storage, to handle disconnects and reconnects
});

socket.on("gameStateUpdate", (msg) => {
    clientGame = msg; //game state object
    console.log(clientGame);

    //show the players on the game screen
    playerListDiv = document.getElementById('gamePlayersBox');
    playerListDiv.innerHTML = "Players: <br>";
    playerListArray = [];
    for (key in clientGame["pnames"]) {
        playerListArray.push(clientGame["pnames"][key]);
    }
    playerListArray.sort();
    for (key in playerListArray) {
        playerListDiv.innerHTML += `<div>${playerListArray[key]}</div>`;
    }
})

socket.on("gamePlayerTalking", (msg) => { //receives name of who is talking
    document.getElementById('gameStateTitle').innerHTML = `It's ${msg}'s turn!`;
    document.getElementById('gameStateSubtitle').innerHTML = "Listen carefully, what is being described?";
})

socket.on("gameImposterWord", (msg) => { //receives imposter's word
    document.getElementById('gameStateTitle').innerHTML = `Describe: ${msg}`;
    document.getElementById('gameStateSubtitle').innerHTML = "You are the imposter, be careful don't make it sound too different!";
})

socket.on("gameNormalWord", (msg) => { //receives your normal word.
    document.getElementById('gameStateTitle').innerHTML = `Describe: ${msg}`;
    document.getElementById('gameStateSubtitle').innerHTML = "You are not the imposter.";
})

socket.on("gameVoteImposter", (msg) => { //when server says vote the imposters, msg is array of imposters
    //generate buttons with players names
    var voteZone = document.getElementById('gameVoteImposterBox');

    if (msg.indexOf(sid) == -1) { //if you are not the imposter
        playerListArray = [];
        for (key in clientGame["pnames"]) {
            playerListArray.push(clientGame["pnames"][key]);
        }
        playerListArray.sort();
        for (key in playerListArray) {
            for (s in clientGame["pnames"]) {
                if (clientGame["pnames"][s] == playerListArray[key]) {
                    voteZone.innerHTML += `<button onclick="voteImposter('${s}')">${playerListArray[key]} is the Imposter</button>`;
                }
            }
        }
        document.getElementById('gameStateTitle').innerHTML = `Vote who is the imposter!`;
        document.getElementById('gameStateSubtitle').innerHTML = "Imposters can't vote and please don't vote yourself";
    } else {
        document.getElementById('gameStateTitle').innerHTML = `You were the imposter`;
        document.getElementById('gameStateSubtitle').innerHTML = "Imposters can't vote";
    }
    //change game state title
});

socket.on("gameEndVoteImposter", (msg) => {
    var voteZone = document.getElementById('gameVoteImposterBox');
    voteZone.innerHTML = "";
    //change game state title
    document.getElementById('gameStateTitle').innerHTML = ``;
    document.getElementById('gameStateSubtitle').innerHTML = "";
});

socket.on('gameVoteCorrectnes', (msg) => { //receives data in this format [ ["imp1", "imp2"] , "word" ]
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    voteZone.innerHTML = "<span>Evaluate the imposter's sentence: </span>";

    if (msg[0].indexOf(sid) == -1) { //if you are not the imposter
        if (msg[0].length > 1) {  //multiple imposters
            document.getElementById('gameStateTitle').innerHTML = `Multiple imposters`;
            document.getElementById('gameStateSubtitle').innerHTML = "This sadly doesn't work yet";
            console.log("cant vote more than one imposter, unsupported yet :(")
        } else { //one imposter
            document.getElementById('gameStateTitle').innerHTML = `${clientGame["pnames"][msg[0][0]]} was the imposter, ${msg[1]} was the fake word`;
            document.getElementById('gameStateSubtitle').innerHTML = `How well was "${msg[1]}" described? Vote below`;
            for (i = 0; i < 5; i++) {
                voteZone.innerHTML += `<button onclick="evaluateImposter(${i + 1})">${i + 1}</button>`;
            };
        }
    } else { //if you are imposter
        document.getElementById('gameStateTitle').innerHTML = `You were the imposter...`;
        document.getElementById('gameStateSubtitle').innerHTML = "Imposters can't evaluate themselves.";
    }
});

socket.on('gameEndVoteCorrectnes', (msg) => { //end vote correctnes
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    voteZone.innerHTML = "";
    document.getElementById('gameStateTitle').innerHTML = ``;
    document.getElementById('gameStateSubtitle').innerHTML = "";
});

socket.on("endGame", (msg) => {
    //TODO: show endscreen and shit
    console.log("server says:" + msg);
    localStorage.removeItem("gameID"); //game ended, reconnect doesn't matter anymore
})

socket.on("sMsg", (msg) => { //just logging
    console.log("Mensaje provisional:" + msg);
})

document.getElementById('startReady').onclick = function () {
    socket.emit("playerReady", sid); //tell the server you are ready
}

function joinGame() { //tell the server you want to join
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

function voteImposter(s) { //tell the server you want to vote the id "s"
    socket.emit("voteImposter", s);
}

function evaluateImposter(s) { //s is the score as a number
    socket.emit("voteCorrectnes", s);
}