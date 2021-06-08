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
let clientTempC = {}; //stores evaluation of each round
let strings = {}
let strings_en = { //collections of all the text for ease of management
    "join": "Join!",
    "jinp": "Enter your name!",
    "rdts": "Ready to start",
    "srcr": "Players ready",
    "srcw": "Players waiting",
    "serr": "Server error:",
    "stur": "'s turn!",
    "awts": "Listen carefully, what is the hidden subject?",
    "desc": "Your word:",
    "ymnc": "You are the mole! Try to not get cought",
    "yanm": "You are not the mole.",
    "secr": "seconds remaining.",
    "pinf": "Server info:",
    "pyrs": "Players:",
    "rnot": "Round:",
    "lide": "Listen and Talk",
    "ewem": "Everybody builds sentences with the given word as the theme.",
    "vttm": "Voting time",
    "wstm": "who was the mole?",
    "etmo": "Evaluate the mole",
    "dsms": "did the sentences made sense for the given noun?",
    "rded": "Round ended",
    "lswh": "Let's see what happened this round.",
    "gend": "Game ended",
    "cong": "congratulations to the winners!",
    "crac": "couldn't remove active class",
    "hadw": "had a different word.",
    "thar": "There are",
    "mols": "moles",
    "thes": "There is",
    "mole": "mole",
    "wwtm": "Who was the mole?",
    "ywtm": "You were the mole",
    "tmcv": "The moles can't vote.",
    "crvc": "couldn't remove voted class",
    "evtm": "Evaluate the moles!",
    "thnw": "Their noun was:",
    "eval": "Evaluate",
    "ssen": "'s sentences:",
    "watm": "was the mole",
    "tnwa": "The noun was:",
    "toey": "The other players are evaluating your sentences.",
    "rnum": "Round",
    "rnue": "ended",
    "rsta": "Round statistics",
    "scr5": "Unacceptable",
    "scr4": "Fair",
    "scr3": "Good",
    "scr2": "Very good",
    "scr1": "Excellent",
    "pnts": "points",
    "psdv": "player didn't vote this mole.",
    "eevc": "Everybody voted correctly...",
    "pdvt": "players didn't vote this mole.",
    "evre": "Evaluation result:",
    "votd": "Voted:",
    "ddvt": "Didn't vote.",
    "wrgs": "Wrong guess",
    "imps": "Correct guess",
    "evad": "Evaluated:",
    "ddev": "Didn\'t evaluate.",
    "rcof": "reconnect attempt failed",
    "vtit": "Vote:",
    "evat": "Evaluate:",
    "sltt": "Large text",
    "smtt": "Medium text",
    "sstt": "Small text",
    "pyag": "Play again",
    "pos1": "1st place",
    "pos2": "2nd place",
    "pos3": "3rd place",
};
let strings_de = { //german
    "join": "Beitreten!",
    "jinp": "Geben Sie Ihren Namen ein",
    "rdts": "Ich bin bereit",
    "srcr": "Bereite Spieler",
    "srcw": "Wartende Spieler",
    "serr": "Server-Fehlermeldung:",
    "stur": " spricht!",
    "awts": "Hören Sie genau hin, was ist das versteckte Thema?",
    "desc": "Ihr Wort:",
    "ymnc": "Sie haben das unterschiedliche Wort",
    "yanm": "Sie haben das normale Wort",
    "secr": "Sekunden verbleiben.",
    "pinf": "Server-Info:",
    "pyrs": "Spieler:",
    "rnot": "Runde:",
    "lide": "Sprechen und Zuhören",
    "ewem": "Jeder bildet Sätze mit dem vorgegebenen Wort als Thema.",
    "vttm": "Abstimmung",
    "wstm": "Wer hatte das unterschiedliche Wort? ",
    "etmo": "Bewerten",
    "dsms": "Haben die Sätze einen Sinn ergeben?",
    "rded": "Runde beendet",
    "lswh": "Was ist in dieser Runde passiert?",
    "gend": "Spiel beendet",
    "cong": "Glückwunsch an die Gewinner!",
    "crac": "couldn't remove active class",
    "hadw": "hatte das unterschiedliches Wort.",
    "thar": "",
    "mols": "Spieler haben das andere Wort.",
    "thes": "",
    "mole": "Spieler/in hat das andere Wort.",
    "wwtm": "Wer hatte das andere Wort?",
    "ywtm": "Sie hatten das andere Wort",
    "tmcv": "Sie können nicht abstimmen.",
    "crvc": "couldn't remove voted class",
    "evtm": "Bewerten",
    "thnw": "Das andere Wort war:",
    "eval": "Bewerten Sie",
    "ssen": "s Sätze:",
    "watm": "hatte das unterschiedliches Wort.",
    "tnwa": "Das andere Wort war:",
    "toey": "Die anderen Spieler werten Ihre Sätze aus.",
    "rnum": "Runde",
    "rnue": "ist beendet",
    "rsta": "Rundenstatistik",
    "scr5": "Ungenügend",
    "scr4": "Ausreichend",
    "scr3": "Befriedigend",
    "scr2": "Gut",
    "scr1": "Sehr gut",
    "pnts": "Punkte",
    "psdv": "Spieler/in hat nicht richtig gewählt.",
    "eevc": "Jeder hat richtig gewählt.",
    "pdvt": "Spieler haben nicht richtig gewählt.",
    "evre": "Auswertungsergebnis:",
    "votd": "Abgestimmt:",
    "ddvt": "Hat nicht abgestimmt.",
    "wrgs": "Falsch",
    "imps": "Richtig",
    "evad": "Bewertet:",
    "ddev": "Hat nicht bewertet.",
    "rcof": "Wiederverbindungsversuch fehlgeschlagen",
    "vtit": "Wählen Sie:",
    "evat": "Bewerten Sie:",
    "sltt": "Große Schriftgröße",
    "smtt": "Mittlere Schriftgröße",
    "sstt": "Kleine Schriftgröße",
    "pyag": "Erneut spielen",
    "pos1": "1. Platz",
    "pos2": "2. Platz",
    "pos3": "3. Platz",
};
//set correct language
function setLang(l) {
    switch (l) {
        case "en":
            strings = strings_en;
            localStorage.setItem('lang', l)
            break;
        case "de":
            strings = strings_de;
            localStorage.setItem('lang', l)
            break
        default:
            strings = strings_de;
            localStorage.setItem('lang', "de")
            break;
    }
    populateStrings();
}
setLang(localStorage.getItem('lang'))
//players that have been selected as imposters by this player in the voting phase.
let votedImpArray = [];
//colors
let c2 = "";
let talkingColor = 'var(--gameTalking)';
let talkingColor2 = '';
let voteImpColor = 'var(--gameVoting)';
let voteImpColor2 = '';
let voteCorrectColor = 'var(--gameEvaluating)';
let voteCorrectColor2 = '';
let roundStatsColor = 'var(--gameRoundStats)';
let roundStatsColor2 = '';
let darkTheme = window.matchMedia('(prefers-color-scheme: dark)');
function setTheme(e) {
    if (e.matches) {
        console.info('dark theme')
        c2 = "var(--gameBg)";
        talkingColor2 = c2;
        voteImpColor2 = c2;
        voteCorrectColor2 = c2;
        roundStatsColor2 = c2;
        // talkingColor = '#163857';
        // voteImpColor = '#402761';
        // voteCorrectColor = '#1f3817';
    } else {
        console.info('light theme')
        roundStatsColor2 = 'var(--gameBgAlt)';
        c2 = "var(--gameBg)";
        talkingColor2 = c2;
        voteImpColor2 = c2;
        voteCorrectColor2 = 'var(--gameBgAlt)';
    }
}
setTheme(darkTheme)  //set theme on load
darkTheme.addEventListener("change", (e) => { //set theme when changed dynamically
    setTheme(e)
})
document.getElementById('esAgain').addEventListener("click", function () {
    window.location.reload()
    return false;
})

//when connected succesfully
socket.on("connect", () => {
    sid = socket.id;
    console.log(sid);
    attemptReconnect();
    onConnect()
});

socket.on("connectionIDs", (msg) => { //when the server sends the updated list of users
    console.log(msg);
});

socket.on("gameRunningError", (msg) => { //when the servers report an error
    console.error(`${strings["serr"]} ${msg}`);
    showNotification(msg, 'error');
})

socket.on("joinPlayersNames", (msg) => {
    console.log(msg); //object with the ids and names of users that have joined.
    joinedPlayers = msg;
    updatePlayerLists();
})

socket.on("joinSuccessful", (msg) => { //server says joined succesfully
    joinSuccessful()
})

socket.on("readyPlayers", (msg) => { //server send array of players that are ready
    readyPlayers = msg; //object with id and name of players that are ready.
    console.log(msg);
    updatePlayerLists();
});

socket.on("startGame", (msg) => {  //server orders: start game!
    startGame()
});

socket.on("gameStateUpdate", (msg) => {
    clientGame = msg; //game state object
    console.log(clientGame);
    gameStateUpdate()
})

socket.on("gamePlayerTalking", (msg) => { //receives name of who is talking
    changeStateText([`${msg}${strings["stur"]}`, `${strings["awts"]}`])
    //select the active player in the player list
    gameHighlightActivePlayer(msg); //send name to highlight;
    //change colros
    changeStateColor([talkingColor, talkingColor2])
})

socket.on("gameImposterWord", (msg) => { //receives imposter's word
    changeStateText([`${strings["desc"]} ${msg}`, `${strings["ymnc"]}`])
    //highlight your name
    gameHighlightActivePlayer(myName);
    //change colros
    changeStateColor([talkingColor, talkingColor2])
})

socket.on("gameNormalWord", (msg) => { //receives your normal word.
    changeStateText([`${strings["desc"]} ${msg}`, `${strings["yanm"]}`])
    //change colros
    changeStateColor([talkingColor, talkingColor2])
    //highlight your name
    gameHighlightActivePlayer(myName);
})

socket.on("gameVoteImposter", (msg) => { //when server says vote the imposters, msg is array of imposters
    startVoteImposter(msg)
});

socket.on("gameEndVoteImposter", (msg) => {
    endVoteImposter();
});

socket.on('gameVoteCorrectnes', (msg) => { //receives data in this format [ ["imp1", "imp2"] , "word" ]
    startEvaluation(msg);
});

socket.on('gameEndVoteCorrectnes', (msg) => { //end vote correctnes
    endEvaluation();
});

socket.on("gameRoundStats", (msg) => {
    showRoundStats(msg);
})

socket.on("gameRoundStatsEnd", (msg) => {
    endRoundStats();
})

socket.on('gameNewPhase', (phaseCode) => {
    noticeNewPhase(phaseCode);
});

socket.on("gameRemainingSecs", (s) => {
    document.getElementById('gameRemainingTimeDisplay').innerHTML = `${s} ${strings["secr"]}`
})

socket.on("endGame", (msg) => {
    hideAllScreens();
    showEnd(msg);
})

socket.on("sMsg", (msg) => {
    console.info(strings["pinf"] + ` ${msg}`);
    showNotification(msg, "info");
})

document.getElementById('startReady').onclick = function () {
    sendReady(sid);
};

//bellow is to change the * css thingy, thanks to zer0 https://stackoverflow.com/questions/14791094/how-to-set-the-universal-css-selector-with-javascript
(function (exports) {
    var style = document.querySelector("head")
        .appendChild(document.createElement("style"));

    var styleSheet = document.styleSheets[document.styleSheets.length - 1];
    styleSheet.insertRule("* {}", 0);

    exports.universal = styleSheet.cssRules[0];
}(window));
// console.log("universal" in window); // true

function setTextSize(percentage) {
    console.log(`${percentage}%`)
    window.universal.style.fontSize = `${percentage}%`;
}

function sendReady(c) {
    socket.emit("playerReady", c); //tell the server you are ready
}

function onConnect() {
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
    //focus name box
    document.getElementById('joinFormName').focus();
    //set the text of several elements
}

function populateStrings() {
    document.getElementById('joinFormButton').innerText = strings["join"];
    document.getElementById('startReady').innerText = strings["rdts"];
    document.getElementById('srcReady').innerText = strings["srcr"];
    document.getElementById('srcWaiting').innerText = strings["srcw"];
    document.getElementById('joinFormName').placeholder = strings["jinp"];
    document.getElementById('sltt').innerText = strings["sltt"];
    document.getElementById('smtt').innerText = strings["smtt"];
    document.getElementById('sstt').innerText = strings["sstt"];
    document.getElementById('esTitle').innerText = strings["gend"];
    document.getElementById('esAgain').innerText = strings["pyag"];
}

function joinGame() { //tell the server you want to join
    playerName = document.forms["join"]["name"].value;
    socket.emit("playerJoin", playerName);
    if (playerName == '' || typeof playerName == 'undefined') {
        return false
    } else {
        return true
    }
}

function joinSuccessful() {
    //show start stuff
    setTimeout(() => {
        document.getElementById('startGameTopBox').classList.add('fadeIn')
        document.getElementById('startGameTopBox').classList.remove("hidden");
        //focus the button
        document.getElementById('startReady').focus();
        setTimeout(() => {
            document.getElementById('startGameTopBox').classList.remove('fadeIn')
        }, 500);
    }, 400);
    setTimeout(() => {
        document.getElementById('startPlayersList').classList.remove("hidden");
        document.getElementById('startPlayersList').classList.add("downSwoosh");
        setTimeout(() => {
            document.getElementById('startPlayersList').classList.remove("downSwoosh");
        }, 500);
    }, 400);
    //hide join stuff
    document.getElementById('joinGameFormBox').classList.add("hidden");
    //change the thing's size
    document.getElementById('joinScrTopBox').style.height = '200px';
    setTimeout(() => {
        document.getElementById('joinScrTopBox').style.transition = ''
    }, 500);
    //other things
    myName = joinedPlayers[sid];
    console.info(`My name is: ${myName}`);
    //allow scrolling
    document.getElementById('joinScr').style.overflow = 'auto';
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

function gameStateUpdate() {
    //set myName
    myName = clientGame["pnames"][sid]
    //show the players on the game screen
    playerListDiv = document.getElementById('gamePlayersBox');
    var txt = `<div class="gamePlayerBoxTitle">${strings["pyrs"]} </div><div class="gamePlayerBoxGrid">`;
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
    //show the points //the element has been removed
    //document.getElementById('gameYourPoints').innerHTML = `Your points: ${clientGame["ppoints"][sid]}`;
    //show the round
    document.getElementById('gameRoundCounter').innerHTML = `${strings["rnot"]} ${clientGame["round"]} / ${clientGame["players"].length}`;
}

function hideAllScreens() {
    document.getElementById('joinScr').classList.add("hidden"); //hide the join screen
    document.getElementById('gameScr').classList.add("hidden"); //hide the game screen
    document.getElementById('endScr').classList.add("hidden"); //hide the end screen
}

function hideGameRight() {
    document.getElementById('gameRoundStatsBox').classList.add('hidden');
    document.getElementById('gamePlayersBox').classList.add('hidden');
    document.getElementById('gameVoteImposterBox').classList.add('hidden');
    document.getElementById('gameVoteCorrectnesBox').classList.add('hidden');
}

function changeStateText(arr) {
    var tit = document.getElementById('gameStateTitle')
    var stit = document.getElementById('gameStateSubtitle');
    tit.classList.add('fadeFlash') //start animation
    stit.classList.add('fadeFlash')
    setTimeout(() => {
        tit.innerHTML = arr[0]; //change text midway animation
        stit.innerHTML = arr[1];
    }, 300);
    setTimeout(() => {
        tit.classList.remove('fadeFlash')  //remove animation
        stit.classList.remove('fadeFlash')
    }, 1000);
}

function changeStateColor(arr) {
    //change colros
    document.getElementById('gameInfoBox').style.backgroundColor = arr[0];
    document.getElementById('gameScr').style.backgroundColor = arr[1];
}

function noticeNewPhase(phaseCode) {
    //phaseCode should be a single letter: 'j' join, 's' start, 't' talk, 'v' vote, 'e' evaluate, 'r' round stats, 'f' finished game (endScr)
    const noticediv = document.getElementById('phaseChangeNotice')
    const noticeboxdiv = document.getElementById('phaseNoticeDialogueBox')
    function showPhaseNotice(textsArray) {
        noticediv.classList.remove('hidden');
        //play open animation
        noticediv.classList.add('fadeIn')
        setTimeout(() => {
            noticeboxdiv.classList.add('openZoom')
            noticeboxdiv.classList.remove('hidden')
        }, 120);
        setTimeout(() => {
            noticediv.classList.remove('fadeIn')
            noticeboxdiv.classList.remove('openZoom')
        }, 500);
        //set the text
        document.getElementById('phaseTitle').innerHTML = textsArray[0];
        document.getElementById('phaseText').innerHTML = textsArray[1];
        //play close animation
        setTimeout(() => {
            noticeboxdiv.classList.add('closeZoom')
            setTimeout(() => {
                noticediv.classList.add('fadeOut')
            }, 100);
        }, 2700);
        setTimeout(() => {
            noticediv.classList.add('hidden');
            noticeboxdiv.classList.add('hidden')
            noticediv.classList.remove('fadeOut')
            noticeboxdiv.classList.remove('closeZoom')
        }, 3000);
    };
    //remove the game state text
    changeStateText(["", ""]);
    //hide the right side things
    hideGameRight();
    switch (phaseCode) {
        case 'j':
            showPhaseNotice(["Join the game!", "choose a name and click Join!"])
            break;
        case 's':
            showPhaseNotice(["Are you ready?", "everybody needs to confirm they are ready before the game starts."])
            break;
        case 't':
            showPhaseNotice([strings["lide"], strings["ewem"]])
            break;
        case 'v':
            showPhaseNotice([strings["vttm"], strings["wstm"]])
            break;
        case 'e':
            showPhaseNotice([strings["etmo"], strings["dsms"]])
            break;
        case 'r':
            showPhaseNotice([strings["rded"], strings["lswh"]])
            break;
        case 'f':
            showPhaseNotice([strings["gend"], strings["cong"]])
            break;
        default:
            showPhaseNotice(phaseCode)
            break;
    }
}

let notCounter = 0
function showNotification(msg, t) { //t is type, error or info
    notCounter += 1;
    notBox = document.getElementById('notificationsBox');
    function destroy(code) { //code is id of element to delete
        setTimeout(() => {
            setTimeout(() => {
                document.getElementById(code).remove();
            }, 1000);
            document.getElementById(code).classList.add('slowFadeOut');
        }, 5000);
    }
    switch (t) {
        case 'error':
            notBox.innerHTML += `<div class="notifyError" id="notification${notCounter}">
                                    <i class="fa fa-times-circle" aria-hidden="true"></i>
                                    <span>${msg}</span> 
                                </div>`
            destroy(`notification${notCounter}`);
            break;
        case 'info':
            notBox.innerHTML += `<div class="notifyInfo" id="notification${notCounter}">
                                    <i class="fa fa-info-circle" aria-hidden="true"></i>
                                    <span>${msg}</span> 
                                </div>`
            destroy(`notification${notCounter}`);
            break;
        default:
            console.error('Invalid notification')
            break;
    }
}

function startGame() {
    hideAllScreens();
    document.getElementById('gameScr').classList.remove("hidden"); //show the game screen
    //change colros
    changeStateColor([talkingColor, talkingColor2]);
    localStorage.setItem("gameID", sid) //add this sID to local storage, to handle disconnects and reconnects
}

function gameHighlightActivePlayer(msg) { //msg is player's name
    var elements = document.getElementsByClassName('gamePlayersBoxPlayer');
    document.getElementById('gamePlayersBox').classList.remove('hidden');
    for (key in elements) {
        if (elements[key].innerHTML == msg) { //if it is the object with the current player's name
            elements[key].classList.add("gamePlayerActive");
        } else { //if any other player
            try {
                elements[key].classList.remove("gamePlayerActive");
            } catch (error) {
                //console.warn(strings["crac"])
            }
        };
    }
    hideGameRight();
    document.getElementById('gamePlayersBox').classList.remove('hidden');
}

function startVoteImposter(msg) {
    //clear voted array
    votedImpArray = [];
    //generate buttons with players names
    var voteZone = document.getElementById('gameVoteImposterBox');
    voteZone.innerHTML = "";
    if (msg.indexOf(sid) == -1) { //if you are not the imposter
        playerListArray = [];
        for (key in clientGame["pnames"]) {
            playerListArray.push(clientGame["pnames"][key]);
        }
        playerListArray.sort();
        var ii = 0;
        var viCode = `<div class="gameGreyLineTitle">${strings["vtit"]}</div>`;
        for (key in playerListArray) { //for every player name
            for (s in clientGame["pnames"]) { // for every id of pnames
                if (clientGame["pnames"][s] == playerListArray[key]) { //if found id (s) that matches current player's name
                    if (playerListArray[key] != myName) { //if s is not you (you can't vote yourself)
                        ii += 1;
                        viCode += `<button id="vib${s}" onclick="voteImposter('${s}')" style="--ani-order: ${ii};">${playerListArray[key]} ${strings["hadw"]}</button>`;
                    }
                }
            }
        }
        voteZone.innerHTML += viCode;
        var text = ""
        if (clientGame["impostersCount"] > 1) {
            text = `${strings["thar"]} ${clientGame["impostersCount"]} ${strings["mols"]}`
        } else {
            text = `${strings["thes"]} ${clientGame["impostersCount"]} ${strings["mole"]}`
        }
        changeStateText([`${strings["wwtm"]}`, text])
    } else {
        changeStateText([`${strings["ywtm"]}`, `${strings["tmcv"]}`])
    }
    //change game state title
    //hide players list
    hideGameRight()
    //show votezone
    voteZone.classList.remove('hidden');
    //change colros
    changeStateColor([voteImpColor, voteImpColor2])
}

function voteImposter(s) { //s is id of who you voted
    socket.emit("voteImposter", s); //tell the server you want to vote the id "s"
    //keep track of the ids of those who got voted
    if (votedImpArray.length < clientGame["impostersCount"]) {
        votedImpArray.push(s)
    } else {
        votedImpArray.push(s)
        votedImpArray.shift();
    }
    console.log(votedImpArray)
    for (s in votedImpArray) { //for every voted id
        document.getElementById(`vib${votedImpArray[s]}`).classList.add('voted')
    }
    //create array of players that were not voted
    var notvoted = [...clientGame["players"]];
    for (key in votedImpArray) {
        notvoted.splice(notvoted.indexOf(votedImpArray[key]), 1)
    }
    for (s in notvoted) { //for every player that wasn't voted
        try {
            document.getElementById(`vib${notvoted[s]}`).classList.remove('voted')
        } catch (error) {
            //console.warn(`${strings["crvc"]}`)
        }
    }
}

function endVoteImposter() {
    var voteZone = document.getElementById('gameVoteImposterBox');
    voteZone.innerHTML = "";
}

function startEvaluation(msg) {
    clientTempC = {}; //empty data from last round
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    htmlCode = "";
    if (msg[0].indexOf(sid) == -1) { //if you are not the imposter
        htmlCode += `<div class="gameGreyLineTitle">${strings["evat"]}</div>`;
        if (msg[0].length > 1) {  //multiple imposters
            changeStateText([`${strings["evtm"]}`, `${strings["thnw"]} ${msg[1]}`])
            for (key in msg[0]) { //for each imposter
                htmlCode += `<div class="gvcImposter" style="--ani-order: ${key + 1};">`;
                htmlCode += `<span>${strings["eval"]} ${clientGame["pnames"][msg[0][key]]}${strings["ssen"]}</span>`;
                htmlCode += "<div>";
                for (i = 0; i < 5; i++) {
                    htmlCode += `<button id="evb,${msg[0][key]},${i + 1}" class="evb${i + 1} evb" onclick="evaluateImposter(['${msg[0][key]}',${i + 1}], this)">
                                    ${i + 1}
                                    <span>(${getScoreDescription(i + 1)})</span>
                                </button>`;
                };
                htmlCode += "</div></div>";
            }
        } else { //one imposter
            changeStateText([`${clientGame["pnames"][msg[0][0]]} ${strings["watm"]}`, `${strings["tnwa"]} "${msg[1]}"`])
            htmlCode += `<div class="gvcImposter" style="--ani-order: 1;">`;
            htmlCode += `<span>${strings["eval"]} ${clientGame["pnames"][msg[0][0]]}${strings["ssen"]}</span>`
            htmlCode += "<div>";
            for (i = 0; i < 5; i++) {
                htmlCode += `<button id="evb,${msg[0][0]},${i + 1}" class="evb${i + 1} evb" onclick="evaluateImposter(['${msg[0][0]}',${i + 1}], this)">
                                ${i + 1}
                                <span>(${getScoreDescription(i + 1)})</span>
                            </button>`;
            };
            htmlCode += "</div></div>";
        }
    } else { //if you are imposter
        changeStateText([`${strings["ywtm"]}`, `${strings["toey"]}`])
    }
    //update voteZone html
    voteZone.innerHTML = htmlCode;
    //change colros
    changeStateColor([voteCorrectColor, voteCorrectColor2])
    //show and hide things
    hideGameRight();
    voteZone.classList.remove('hidden')
}

function evaluateImposter(s, ele) { //data format is : ["imposter's id", number], ele is the button clicked
    socket.emit("voteCorrectnes", s);
    //store the vote
    clientTempC[s[0]] = s[1];
    //change color of clicked, works for only one imposter as of right now
    allButtons = document.getElementsByClassName('evb');
    for (key in allButtons) { //remove all selection indicators
        try {
            allButtons[key].classList.remove('evbselected');
        } catch (error) {

        }
    }
    for (ik in clientTempC) { //ik is imp's id //add the indication
        document.getElementById(`evb,${ik},${clientTempC[ik]}`).classList.add('evbselected');
    }
}

function endEvaluation() {
    var voteZone = document.getElementById('gameVoteCorrectnesBox');
    voteZone.innerHTML = "";
}

//function to get score category (gold bronze etc.)
function getColorClassName(s) { //s is score 1-5
    if (s > 4.3) {
        return 'grsp5th'
    } else if (s > 3.3) {
        return 'grsp4th'
    } else if (s > 2.3) {
        return 'grspBronze'
    } else if (s > 1.2) {
        return 'grspSilver'
    } else {
        return 'grspGold'
    }
}
//function to get score description (excellent unacceptable etc.)
function getScoreDescription(s) { //s is score 1-5
    if (s > 4.3) {
        return strings["scr5"]
    } else if (s > 3.3) {
        return strings["scr4"]
    } else if (s > 2.3) {
        return strings["scr3"]
    } else if (s > 1.2) {
        return strings["scr2"]
    } else {
        return strings["scr1"]
    }
}

function showRoundStats(msg) {
    const div = document.getElementById('gameRoundStatsBox');
    changeStateText([`${strings["rnum"]} ${clientGame["round"]} ${strings["rnue"]}`, `${strings["rsta"]}`])
    hideGameRight(); //hide other things
    div.classList.remove('hidden'); //show the div
    //change colros
    changeStateColor([roundStatsColor, roundStatsColor2])
    //generate the table
    var txt = "<div>";
    for (key in clientGame['players']) {
        var thisID = clientGame['players'][key];
        if (msg["imposters"].indexOf(thisID) != -1) { //if imposter
            var t0 = `` //how many people voted?
            if (msg["noGuesses"][thisID] + msg["wronGuesses"][thisID] == 1) {
                t0 = `${msg["noGuesses"][thisID] + msg["wronGuesses"][thisID]} ${strings["psdv"]}`
            } else if (msg["noGuesses"][thisID] + msg["wronGuesses"][thisID] == 0) {
                t0 = `${strings["eevc"]}`
            } else {
                t0 = `${msg["noGuesses"][thisID] + msg["wronGuesses"][thisID]} ${strings["pdvt"]}`
            }
            txt += `
                    <div class="grspTop">
                        <div class="grspNameImp"><span>${clientGame['pnames'][thisID]}</span></div>
                        <div class="grspPoints"><span>${clientGame['ppoints'][thisID]} ${strings["pnts"]}</span></div>
                    </div>
                    <div class="grspLeft">
                        <span class="grspTitle">${t0}</span>
                        <br>
                        <span class="grspTitle">${strings["evre"]} 
                            <span class="${getColorClassName(msg["impScore"][thisID])}">
                                ${getScoreDescription(msg["impScore"][thisID])} 
                                <span> (${Math.round(msg["impScore"][thisID] * 10) / 10})</span>
                            </span>
                        </span>
                    </div>
            `;
        } else { //if normal player
            txt += `
                    <div class="grspTop">
                        <div class="grspName"><span>${clientGame['pnames'][thisID]}</span></div>
                        <div class="grspPoints"><span>${clientGame['ppoints'][thisID]} ${strings["pnts"]}</span></div>
                    </div>
                    <div class="grspLeft">
                    <span class="grspTitle">${strings["votd"]}</span>
                    <ul class="grspPlayersList">`;
            var impvotes = msg["r"][thisID]
            console.log(impvotes)
            if (typeof impvotes == 'undefined') {
                txt += `<li>${strings["ddvt"]}</li>`
            } else {
                for (id in impvotes) { //for every id the player voted to be imposter
                    if (msg["imposters"].indexOf(impvotes[id]) == -1) { //if didn't vote imposter
                        txt += `<li class="grspIncorrect">${clientGame["pnames"][impvotes[id]]} <span>${strings["wrgs"]}</span></li>`
                    } else { //if was imposter
                        txt += `<li class="grspCorrect">${clientGame["pnames"][impvotes[id]]} <span>${strings["imps"]}</span></li>`
                    }
                }
            }
            txt += `</ul>
                    <br>
                    <span class="grspTitle">${strings["evad"]}</span>
                    <ul class="grspScoreboard">`;
            var cvotes = msg["c"][thisID]
            if (Object.keys(cvotes).length == 0) { //if didn't evaluate
                txt += `<li>${strings["ddev"]}</li>`
            } else { //if did evalute
                for (id in cvotes) {
                    txt += `<li class="${getColorClassName(cvotes[id])}">
                                ${getScoreDescription(cvotes[id])}(${cvotes[id]})
                                <span>${clientGame["pnames"][id]}</span>
                            </li>`
                }
            }
            txt += `</ul></div>`;
        }
    }
    txt += "</div>";
    div.innerHTML = txt;
}

function endRoundStats() {
    hideGameRight();
}

function showEnd(msg) {
    hideAllScreens()
    document.getElementById('endScr').classList.remove('hidden')
    localStorage.removeItem("gameID"); //game ended, reconnect doesn't matter anymore
    const pp = msg["ppoints"];
    //generate ordered array of ids
    var allPoints = [];
    var p2id = {}; //object, keys are all the points present, stores array of ids that have that point
    for (id in pp) {
        if (allPoints.indexOf(pp[id]) == -1) { //if that point still hasn't been found
            allPoints.push(pp[id]);
        }
        try { //add to points 2 id object
            p2id[pp[id]].push(id)
        } catch (error) {
            p2id[pp[id]] = []
            p2id[pp[id]].push(id);
        }
    }
    allPoints.sort(function (a, b) { //descending order of points
        return b - a;
    });
    var code1 = '';
    var code2 = '';
    for (key in allPoints) {
        if (key < 3) { //for the first three players
            for (ppp in p2id[allPoints[key]]) { //for all ids that have the same score
                var pos = key * 1 + 1;
                code1 += `<div id="es${pos}" class="esTop" style="--ani-order: ${pos};">`
                var stringName = `pos${pos}`
                code1 += `<div>${strings[stringName]}</div><div>`
                code1 += `<span>${msg["pnames"][p2id[allPoints[key]][ppp]]}</span>
                          <span>${allPoints[key]} ${strings["pnts"]}</span>`
                code1 += '</div></div>'
            }
        } else {
            for (ppp in p2id[allPoints[key]]) { //for all ids that have the same score
                var pos = key * 1 + 1;
                code2 += `<div style="--ani-order: ${pos};"><div>${pos}</div><div>`
                code2 += `<span>${msg["pnames"][p2id[allPoints[key]][ppp]]}</span>
                          <span>${allPoints[key]} ${strings["pnts"]}</span>`
                code2 += '</div></div>'
            }
        }
    }
    document.getElementById('esPodium').innerHTML = code1;
    document.getElementById('esRanking').innerHTML = code2;

    console.info("game result:");
    console.log(msg);
}

function attemptReconnect() {
    try {
        socket.emit("reconnect", localStorage.getItem("gameID", sid)) //request reconnect for the stored id
    } catch (error) {
        console.error(strings["rcof"])
    }
}

function disconnect() {
    socket.disconnect()
}
