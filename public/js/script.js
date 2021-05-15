let socket = io.connect("/", { path: "/socket.io" }); //connect ro socket.io
var sid = ""; //the session id of this player
var joinedPlayers = {}; //same object as the server
var readyPlayers = {}; //same object as the server
var myName = ""; //the players name as returned from the server
let clientGame = { //this object will be sent to the client to sync game state
    "players": [""], //array with ids of players
    "pnames": {}, //copy of readyplayers when startting game
    "ppoints": {}, //object with sIds as keys and numbers representing the points of the player
    "impostersCount": 0, //how many imposters are in this game?
    "round": 0, //round counter, when = player count game ends.
    "talkTime": 0, // time for players to talk in seconds
    "voteTime": 0, //time for players to vote in seconds
  };

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
    //show start stuff
    document.getElementById('startGameTopBox').classList.remove("hidden");
    document.getElementById('startPlayersList').classList.remove("hidden");
    //hide join stuff
    document.getElementById('joinGameFormBox').classList.add("hidden");
    //change the thing's size
    document.getElementById('joinScrTopBox').style.height = '200px';
    //other things
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
    hideAllScreens();
    document.getElementById('gameScr').classList.remove("hidden"); //show the game screen
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

    //show the points
    document.getElementById('gameYourPoints').innerHTML = `Your points: ${clientGame["ppoints"][sid]}`;
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
    voteZone.innerHTML = "";
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
    //hide players list
    document.getElementById('gamePlayersBox').classList.add('hidden');
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = '#6c41a3ff';
    document.getElementById('gameScr').style.backgroundColor = '#d8c6f0ff';
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
            document.getElementById('gameStateTitle').innerHTML = `Evaluate how well the imposters! `;
            document.getElementById('gameStateSubtitle').innerHTML = "How did each of them described: ${msg[1]}";
            for(key in msg[0]) { //for each imposter
                voteZone.innerHTML += `<span>Evaluate ${clientGame["pnames"][msg[0][key]]}'s description:</span>`
                for (i = 0; i < 5; i++) {
                    voteZone.innerHTML += `<button onclick="evaluateImposter(['${msg[0][key]}',${i + 1}])">${i + 1}</button>`;
                };
                voteZone.innerHTML += `<br>`
            }
        } else { //one imposter
            document.getElementById('gameStateTitle').innerHTML = `${clientGame["pnames"][msg[0][0]]} was the imposter`;
            document.getElementById('gameStateSubtitle').innerHTML = `How well was "${msg[1]}" described? Vote below`;
            for (i = 0; i < 5; i++) {
                voteZone.innerHTML += `<button onclick="evaluateImposter(['${msg[0][0]}',${i + 1}])">${i + 1}</button>`;
            };
        }
    } else { //if you are imposter
        document.getElementById('gameStateTitle').innerHTML = `You were the imposter...`;
        document.getElementById('gameStateSubtitle').innerHTML = "The other players are voting how well you described the word.";
    }
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = '#2d5020ff';
    document.getElementById('gameScr').style.backgroundColor = '#dbe1a0ff';
});

socket.on('gameEndVoteCorrectnes', (msg) => { //end vote correctnes
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    voteZone.innerHTML = "";
    document.getElementById('gameStateTitle').innerHTML = ``;
    document.getElementById('gameStateSubtitle').innerHTML = "";
    //show players list
    document.getElementById('gamePlayersBox').classList.remove('hidden');
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = '#1f4e7aff';
    document.getElementById('gameScr').style.backgroundColor = '#daeeffff';
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
    if (joinedCount < 3) { //if less than 3 people or connected, show that without 3 people you cannot play
        joinedCount = 3;
    }
    document.getElementById('startProportion').innerHTML = (readyCount + "/" + joinedCount); //put that proportion info on the page
}

function voteImposter(s) { //tell the server you want to vote the id "s"
    socket.emit("voteImposter", s);
}

function evaluateImposter(s) { //data format is : ["imposter's id", number]
    socket.emit("voteCorrectnes", s);
}

function hideAllScreens() {
    document.getElementById('joinScr').classList.add("hidden"); //hide the join screen
    document.getElementById('gameScr').classList.add("hidden"); //hide the game screen
    document.getElementById('endScr').classList.add("hidden"); //hide the end screen
}