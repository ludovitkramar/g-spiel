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
//colors
let talkingColor = '#1f4e7aff';
let talkingColor2 = '#f9fdff'
let voteImpColor = '#6c41a3ff';
let voteImpColor2 = '#fbf7fe';
let voteCorrectColor = '#2d5020ff';
let voteCorrectColor2 = '#f7f8ed';
let roundStatsColor = '#000000';
let roundStatsColor2 = '#eeeeee';

//when connected succesfully
socket.on("connect", () => {
    sid = socket.id;
    console.log(sid);
    //TODO: check if there is something in localstorage, and if game is running try to reconnect


    //show joinScr
    hideAllScreens();
    document.getElementById('joinScr').classList.remove("hidden"); //show the game screen
    //hide start stuff
    document.getElementById('startGameTopBox').classList.add("hidden");
    document.getElementById('startPlayersList').classList.add("hidden");
    //show join stuff
    document.getElementById('joinGameFormBox').classList.remove("hidden");
    //change the thing's size
    document.getElementById('joinScrTopBox').style.height = '100vh';
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
    setTimeout(() => {
        document.getElementById('startPlayersList').classList.remove("hidden");
    }, 500);
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
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = talkingColor;
    document.getElementById('gameScr').style.backgroundColor = talkingColor2;
    localStorage.setItem("gameID", sid) //add this sID to local storage, to handle disconnects and reconnects
});

socket.on("gameStateUpdate", (msg) => {
    clientGame = msg; //game state object
    console.log(clientGame);

    //show the players on the game screen
    playerListDiv = document.getElementById('gamePlayersBox');
    var txt = `<div class="gamePlayerBoxTitle">Players: </div><div>`;
    playerListArray = [];
    for (key in clientGame["pnames"]) {
        playerListArray.push(clientGame["pnames"][key]);
    }
    playerListArray.sort();
    for (key in playerListArray) {
        txt += `<div class="gamePlayersBoxPlayer">${playerListArray[key]}</div>`;
    }
    txt += `</div>`;
    playerListDiv.innerHTML = txt;
    //show the points
    document.getElementById('gameYourPoints').innerHTML = `Your points: ${clientGame["ppoints"][sid]}`;
    //show the round
    document.getElementById('gameRoundCounter').innerHTML = `Round: ${clientGame["round"]} / ${clientGame["players"].length}`;
})

socket.on("gamePlayerTalking", (msg) => { //receives name of who is talking
    document.getElementById('gameStateTitle').innerHTML = `It's ${msg}'s turn!`;
    document.getElementById('gameStateSubtitle').innerHTML = "Listen carefully, what is being described?";
    //select the active player in the player list
    gameHighlightActivePlayer(msg); //send name to highlight;
})

socket.on("gameImposterWord", (msg) => { //receives imposter's word
    document.getElementById('gameStateTitle').innerHTML = `Describe: ${msg}`;
    document.getElementById('gameStateSubtitle').innerHTML = "You are the imposter, be careful don't make it sound too different!";
    //highlight your name
    gameHighlightActivePlayer(myName);
})

socket.on("gameNormalWord", (msg) => { //receives your normal word.
    document.getElementById('gameStateTitle').innerHTML = `Describe: ${msg}`;
    document.getElementById('gameStateSubtitle').innerHTML = "You are not the imposter.";
    //highlight your name
    gameHighlightActivePlayer(myName);
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
        for (key in playerListArray) { //for every player name
            for (s in clientGame["pnames"]) { // for every id of pnames
                if (clientGame["pnames"][s] == playerListArray[key]) { //if found id (s) that matches current player's name
                    if (playerListArray[key] != myName) { //if s is not you (you can't vote yourself)
                        voteZone.innerHTML += `<button onclick="voteImposter('${s}')">${playerListArray[key]} is the Imposter</button>`;
                    }
                }
            }
        }
        document.getElementById('gameStateTitle').innerHTML = `Who was the imposter?`;
        var text = ""
        if (clientGame["impostersCount"] > 1) {
            text = `There are ${clientGame["impostersCount"]} imposters`
        } else {
            text = `There is ${clientGame["impostersCount"]} imposter`
        }
        document.getElementById('gameStateSubtitle').innerHTML = text;
    } else {
        document.getElementById('gameStateTitle').innerHTML = `You were the imposter`;
        document.getElementById('gameStateSubtitle').innerHTML = "Imposters can't vote.";
    }
    //change game state title
    //hide players list
    document.getElementById('gamePlayersBox').classList.add('hidden');
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = voteImpColor;
    document.getElementById('gameScr').style.backgroundColor = voteImpColor2;
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
            document.getElementById('gameStateTitle').innerHTML = `Evaluate the imposters! `;
            document.getElementById('gameStateSubtitle').innerHTML = `How well did they described: ${msg[1]}`;
            for (key in msg[0]) { //for each imposter
                voteZone.innerHTML += `<span>Evaluate ${clientGame["pnames"][msg[0][key]]}'s description:</span>`
                for (i = 0; i < 5; i++) {
                    voteZone.innerHTML += `<button onclick="evaluateImposter(['${msg[0][key]}',${i + 1}])">${i + 1}</button>`;
                };
                voteZone.innerHTML += `<br>`
            }
        } else { //one imposter
            document.getElementById('gameStateTitle').innerHTML = `${clientGame["pnames"][msg[0][0]]} was the imposter`;
            document.getElementById('gameStateSubtitle').innerHTML = `How well was "${msg[1]}" described?`;
            for (i = 0; i < 5; i++) {
                voteZone.innerHTML += `<button onclick="evaluateImposter(['${msg[0][0]}',${i + 1}])">${i + 1}</button>`;
            };
        }
    } else { //if you are imposter
        document.getElementById('gameStateTitle').innerHTML = `You were the imposter`;
        document.getElementById('gameStateSubtitle').innerHTML = "The other players are voting how well you described the word.";
    }
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = voteCorrectColor;
    document.getElementById('gameScr').style.backgroundColor = voteCorrectColor2;
});

socket.on('gameEndVoteCorrectnes', (msg) => { //end vote correctnes
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    voteZone.innerHTML = "";
    document.getElementById('gameStateTitle').innerHTML = ``;
    document.getElementById('gameStateSubtitle').innerHTML = "";
});

socket.on("gameRoundStats", (msg) => {
    console.log(msg);
    const div = document.getElementById('gameRoundStatsBox');
    document.getElementById('gameStateTitle').innerHTML = `Round ${clientGame["round"]} ended`; ///change title
    document.getElementById('gameStateSubtitle').innerHTML = "Round statistics"; //and subtitle
    div.classList.remove('hidden'); //show the div
    //generate the table
    txt = "<div>";
    for (key in clientGame['players']) {
        var thisID = clientGame['players'][key];
        if (msg["imposters"].indexOf(thisID) != -1) { //if imposter
            txt += `
                <div class="gameRoundStatsPlayer">
                    <div class="grspTop">
                        <div class="grspNameImp"><span>${clientGame['pnames'][thisID]}</span></div>
                        <div class="grspPoints"><span>${clientGame['ppoints'][thisID]} points</span></div>
                    </div>
                    <div class="grspTitle">Imposter Score: <span class="grspPoint">${msg["impScore"][thisID]}</span></div>
                            
                    <div class="grspTitle">Players fooled: ${msg["wronGuesses"][thisID]}</div>
                    <div class="grspTitle">${msg["noGuesses"][thisID]} invalid votes</div>
                </div>
            `;
        } else { //if normal player
            txt += `
                <div class="gameRoundStatsPlayer">
                    <div class="grspTop">
                        <div class="grspName"><span>${clientGame['pnames'][thisID]}</span></div>
                        <div class="grspPoints"><span>${clientGame['ppoints'][thisID]} points</span></div>
                    </div>
                    <div class="grspTitle">Last round voted:</div>
                    <ul class="grspPlayersList">`;
            var impvotes = msg["r"][thisID]
            for (id in impvotes) {
                txt += `<li>${clientGame["pnames"][impvotes[id]]}</li>`
            }
            txt += `</ul><div class="grspTitle">Last round judged:</div><ul class="grspScoreboard">`;
            var cvotes = msg["c"][thisID]
            for (id in cvotes) {
                txt += `<li class="grspValue">${clientGame["pnames"][id]}<span class="grspPoint">${cvotes[id]}</span></li>`
            }
            txt += `</ul></div>`;
        }
    }
    txt += "</div>";
    div.innerHTML = txt;

    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = roundStatsColor;
    document.getElementById('gameScr').style.backgroundColor = roundStatsColor2;
})

socket.on("gameRoundStatsEnd", (msg) => {
    document.getElementById('gameRoundStatsBox').classList.add('hidden');

    //show players list
    document.getElementById('gamePlayersBox').classList.remove('hidden');
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = talkingColor;
    document.getElementById('gameScr').style.backgroundColor = talkingColor2;
})

socket.on('gameNewPhase', (phaseCode) => {
    //phaseCode should be a single letter: 'j' join, 's' start, 't' talk, 'v' vote, 'e' evaluate, 'r' round stats, 'f' finished game (endScr)
    const noticediv = document.getElementById('phaseChangeNotice')
    function showPhaseNotice(textsArray){
        noticediv.classList.remove('hidden');
        document.getElementById('phaseTitle').innerHTML = textsArray[0];
        document.getElementById('phaseText').innerHTML = textsArray[1];
        setTimeout(() => {
            noticediv.classList.add('hidden');
        }, 2600);
    };
    switch (phaseCode) {
        case 'j':
            showPhaseNotice(["Join the game!", "choose a name and click Join!"])
            break;
        case 's':
            showPhaseNotice(["Are you ready?", "everybody needs to confirm they are ready before the game starts."])
            break;
        case 't':
            showPhaseNotice(["Time to talk!", "make sure we are all on the same page"])
            break;
        case 'v':
            showPhaseNotice(["Voting time", "who was the black sheep?"])
            break;
        case 'e':
            showPhaseNotice(["Evaluate", "did the imposter just ignored their word?"])
            break;
        case 'r':
            showPhaseNotice(["Let's recap", "the truth shall be known!"])
            break;
        case 'f':
            showPhaseNotice(["Game ended", "congratulations to the winners!"])
            break;
        default:
            alert('incorrect phase code');
            break;
    }
});

socket.on("gameRemainingSecs", (s) => {
    document.getElementById('gameRemainingTimeDisplay').innerHTML = `${s} seconds remaining.`
})

socket.on("endGame", (msg) => {
    //TODO: show endscreen and shit
    hideAllScreens();
    document.getElementById('endScr').classList.remove('hidden')
    localStorage.removeItem("gameID"); //game ended, reconnect doesn't matter anymore
    //show game result
    document.getElementById('endScr').innerHTML = `
                <span> Game ended.</span >
                    <br>
                        <span>Reload the page to start again.</span>
                        <br>
                            <span>Game:</span>
                            <hr>
                                ${JSON.stringify(msg, null, 2)}`;
    console.log("game result:");
    console.log(msg);
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
    //things that are not screens
    document.getElementById('gameRoundStatsBox').classList.add('hidden');
    document.getElementById('gamePlayersBox').classList.add('hidden');
}

function gameHighlightActivePlayer(msg) {
    var elements = document.getElementsByClassName('gamePlayersBoxPlayer');
    document.getElementById('gamePlayersBox').classList.remove('hidden');
    for (key in elements) {
        if (elements[key].innerHTML == msg) { //if it is the object with the current player's name
            elements[key].classList.add("gamePlayerActive");
        } else { //if any other player
            try {
                elements[key].classList.remove("gamePlayerActive");
            } catch (error) {
                console.log(`couldn't remove active class`)
            }

        };
    }
}