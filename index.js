const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public')); // Serve Static Assets

//Variables for the app and game start here, above are more environmental stuff
var connectionCounter = 0; //Monitor current connections
var connectionIDs = []; //array of all current connections
var joinedPlayers = {};  //players that have joined with a name, key is  sID, with value player name
var readyPlayers = {}; //players that have joined and are ready to start, same format as above
//game related variables:
var gameRunning = false;
const words = [["Stuhl", "Sofa"], ["Computer", "Notebook"], ["Wassereis", "Lolli"], ["Schreibstift", "Kugelschreiber"], ["Cannabis", "Tabak"]];
let game = {
  "players": [], //array with ids of players
  "pnames": {}, //copy of readyplayers when startting game
  "imposter": "", //id of the imposter
  "round": 1, //round counter, when = player count game ends.
  "playersOrder": [], //players that stil haven't said anything.
  "usedWordSets": [], //keys of sets used
  "setIndex": 0, //current set
  "imposterIndex": 0, // if the imposter gets the first or the second word of the word pair
  "canVote": false, //when a client sends a vote, it will only be registered if this is true
  "r1": { //each round is stored like this
    "ID1": "ID3", //id from players array, id1 voted id3
    "ID2": "ID1",
    "ID3": "imposter", //id3 was imposter, couldn't vote.
  },
  "r2": { //sample round 2
    "ID1": "imposter",
    "ID2": "ID3",
    "ID3": "ID1",
  },
};

io.on('connection', (socket) => {
  const sID = socket.id //so that it remembers when disconnecting who is disconnecting
  connectionIDs.push(sID); //array of connected user's ids
  io.sockets.emit("connectionIDs", connectionIDs); //send the array of all connected ids to all clients
  io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
  io.sockets.emit("readyPlayers", readyPlayers); //send the player that are ready to the clients
  console.log('User ' + sID + " connected.");
  connectionCounter += 1; //count that there's a new connection
  console.log(connectionCounter + ' connections are active.');
  //Test
  socket.on("test", (msg) => {
    console.log(sID + ' says: ' + msg);
  });
  //player joins game
  socket.on("playerJoin", (pname) => {
    if (!gameRunning) {
      //add player name the joinedPlayers object
      joinedPlayers[sID] = pname; //add the name of the player to the joinedPlayers object with sID as the key
      console.log(`${sID} joined the game as: ${joinedPlayers[sID]}`);
      io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
      io.to(sID).emit("joinSuccessful", "server: join succesful"); //this triggers the client to show start screen.
    } else {
      io.to(sID).emit("gameRunningError", "Game running, can't join.") //gameRunningError will trigger an alert on the client
    }
  });
  //player says he is ready
  socket.on("playerReady", () => {
    if (joinedPlayers[sID]) { //cannot be ready if haven't joined, should always be true
      if (!gameRunning) { //can only be ready if the game is not running.
        readyPlayers[sID] = joinedPlayers[sID];
        io.sockets.emit("readyPlayers", readyPlayers); //send the player that are ready to the clients
        //calculate proportion:
        var readyCount = Object.keys(readyPlayers).length;
        var joinedCount = Object.keys(joinedPlayers).length;
        console.log(readyCount + "/" + joinedCount);
        if (readyCount >= 3 && readyCount / joinedCount == 1) { //if more then three people are connected and all of them are ready, start the game
          startGame();
        }
      } else {
        io.to(sID).emit("gameRunningError", "Game running, can't ready.")
      }
    } else {
      io.to(sID).emit("gameRunningError", "How can you be ready without first joining?")
    }
    //console.log(readyPlayers);
  });
  //When a connection goes down:
  socket.on('disconnect', (socket) => {
    connectionCounter -= 1;
    connectionsIDs = connectionIDs.splice(connectionIDs.indexOf(sID), 1); //remove the id from the array of connected users
    if (gameRunning) { //TODO: add ability to know if the client is in the game, and also return its name
      console.log('player disconnected while in game')
      io.sockets.emit("gameRunningError", `Player "${sID}" disconnected mid game`)
    } else {
      delete joinedPlayers[sID]; //remove from joinedPlayers object
      delete readyPlayers[sID];
    }
    io.sockets.emit("connectionIDs", connectionIDs); //send the updated array to all users
    io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
    io.sockets.emit("readyPlayers", readyPlayers); //send the player that are ready to the clients
    console.log('User ' + sID + " disconnected.");
    console.log(joinedPlayers);
    console.log(connectionCounter + ' connections are active.');
  });
});


//THE GAME ITSELF:

function gameInit() { //initialize the game
  game = {
    "players": [], //array with ids of players
    "pnames": {}, //copy of readyplayers when startting game
    "imposter": "", //id of the imposter
    "round": 1, //round counter, when = player count game ends.
    "playersOrder": [], //players that stil haven't said anything.
    "usedWordSets": [], //keys of sets used
    "setIndex": 0, //current set
    "imposterIndex": 0, // if the imposter gets the first or the second word of the word pair
    "canVote": false,
  };
  gameRunning = true;
  console.log('start game says hi!')
  for (key in readyPlayers) { // for every player that is ready
    game["players"].push(key); //everybody is added to the players array
    game["pnames"][key] = readyPlayers[key]; //add player's name to the pnames object in game object
  };
  joinedPlayers = {}; //clear joined players for potential next game
  readyPlayers = {}; //clear ready players for potential next game
  io.sockets.emit("joinPlayersNames", joinedPlayers); //send empty joinedPlayers to clients
  io.sockets.emit("readyPlayers", readyPlayers); //send empty readyPlayers to the clients
  console.log(game)
  game["players"].forEach(e => { //send each player command to start game
    io.to(e).emit("startGame", "game start"); //TODO: the client doesn't do anything yet.
  });
};

function gameDecidePlayersOrder() {
  game["playersOrder"] = [...game["players"]]; //make playersOrder a copy of players
  for (i = game["playersOrder"].length; i > 0; i--) { //shuffle order of sIDs in game.playersOrder, this will determine who goes first
    let index = Math.floor(Math.random() * game["playersOrder"].length); //random id with which to swap
    let temp = game["playersOrder"][index];
    game["playersOrder"][index] = game["playersOrder"][i - 1];
    game["playersOrder"][i - 1] = temp;
  };
};

function gameChoosoImposter() {
  rndmax = 0 //the player with maximun random value will be the imposter.
  for (key in game["players"]) { // for every player
    num = Math.random();
    if (num > rndmax) {
      rndmax = num
      game["imposter"] = game["players"][key]; //is imposter if has the largest number
    };
  }
};

function gameChooseWordSet() {
  if (words.length == game["usedWordSets"].length) { //if all word sets have already been used, this is an edge case
    game["usedWordSets"] = [];
  }
  var impIndex = 0;
  impIndex = Math.round(Math.random()); //the imposter gets word 0 or 1 of the array?
  var haventFoundSet = true; //this is to avoid repetition
  var questionIndex = 0;
  while (haventFoundSet) {
    questionIndex = Math.floor(Math.random() * words.length); //which set of words is used?
    if (game["usedWordSets"].indexOf(questionIndex) == -1) {
      haventFoundSet = false;
    }
  }
  game["usedWordSets"].push(questionIndex);
  game["setIndex"] = questionIndex;
  game["imposterIndex"] = impIndex;
}

function gameVote() {
  game["canVote"] = true;
  game["players"].forEach(e => { //send each player command to vote
    io.to(e).emit("sMsg", `Voting time!`);
  });
}

function gameSendWord(client) { //client is the sID to whom the word is sent
  if (client == game["imposter"]) { // if imposter
    game["players"].forEach(e => { // to every player
      io.to(e).emit("sMsg", `${game["pnames"][client]} is talking:`); //send who is talking
    });
    io.to(client).emit("sMsg", "you are imposter, this is your word: " + words[game["setIndex"]][game["imposterIndex"]]);
  } else { // if not imposter
    game["players"].forEach(e => { // to every player
      io.to(e).emit("sMsg", `${game["pnames"][client]} is talking:`); //send who is talking
    });
    io.to(client).emit("sMsg", "you are normal, this is your word: " + words[game["setIndex"]][Math.abs(game["imposterIndex"] - 1)]);
  };
}

function gameEndOfRound() {
  console.log("end of round:" + game["round"] + " , game state below:");
  console.log(game);
  if (game["round"] == game["players"].length) { //if the round is the same number as number of players
    gameEnds();
  } else {
    game["round"] += 1; //move on to next round
  }
}

function gameEnds() {
  gameRunning = false; //game finished
  console.log('game ended')
  game["players"].forEach(e => { //send each player command to end game
    io.to(e).emit("endGame", "game end"); //TODO: the client doesn't do anything yet.
  });
}

function startGame() {
  gameInit();
  while (gameRunning) { //GAME LOOP
    //DECIDE PLAYERS ORDER
    gameDecidePlayersOrder();
    //CHOOSE IMPOSTER
    gameChoosoImposter();
    //CHOOSE WORD SET
    gameChooseWordSet();

    //SEND EACH PLAYER ITS CORRESPONDING WORD
    game["playersOrder"].forEach(e => { //e is the sID
      gameSendWord(e);
      //TODO: wait 60 seconds (for people to talk)
    });

    //START THE VOTING
    gameVote();
    //TODO: wait 10 seconds (voting time)

    //END OF ROUND
    gameEndOfRound();
  }
};

server.listen(8282, () => {
  console.log('listening on *:8282');
});