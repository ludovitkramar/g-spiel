const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 8282;

app.use(express.static('public')); // Serve Static Assets

//Variables for the app and game start here, above are more environmental stuff
var connectionCounter = 0; //Monitor current connections
var connectionIDs = []; //array of all current connections
var joinedPlayers = {};  //players that have joined with a name, key is  sID, with value player name
var readyPlayers = {}; //players that have joined and are ready to start, same format as above
//game related variables:
var gameRunning = false;
const words = [["Stuhl", "Sofa"], ["Computer", "Notebook"], ["Wassereis", "Lolli"], ["Schreibstift", "Kugelschreiber"], ["Cannabis", "Tabak"]];
let game = { //this object here is never used directly, it this changed in gameInit(), this is just to help us orientate
  "players": ["ID1", "ID2", "ID3", "ID4"], //array with ids of players
  "pnames": {}, //copy of readyplayers when startting game
  "ppoints": {}, //object with sIds as keys and numbers representing the points of the player
  "imposters": [], //array of ids of imposters
  "impostersCount": 1, //how many imposters are in this game?
  "round": 1, //round counter, when = player count game ends.
  "playersOrder": [], //players that stil haven't said anything.
  "usedWordSets": [], //keys of sets used
  "setIndex": 0, //current set
  "imposterIndex": 0, // if the imposter gets the first or the second word of the word pair
  "talkTime": 20, // time for players to talk in seconds
  "voteTime": 10, //time for players to vote in seconds
  "canVote": false, //when a client sends a imposter vote, it will only be registered if this is true
  "canVoteCorrectnes": false, //when a client sends a correctnes vote, it will only be registered if this is true
  "r1": { //imposter voting results of each round are stored like this
    "ID1": ["ID3", "Id2"], //id from players array, id1 voted id3 and id2
    "ID3": "imposter", //id3 was imposter, couldn't vote.
  },
  "c1": { //correctnes voting results are stored like this
    "ID1": {
      "imp1": 5,
      "imp2": 3
    }, //ID1 voted a 5 to imp1 and a 3 to imp2
  },
};

let clientGame = { //this object will be sent to the client to sync game state
  "players": ["ID1", "ID2", "ID3", "ID4"], //array with ids of players
  "pnames": {}, //copy of readyplayers when startting game
  "ppoints": {}, //object with sIds as keys and numbers representing the points of the player
  "impostersCount": 1, //how many imposters are in this game?
  "round": 1, //round counter, when = player count game ends.
  "talkTime": 20, // time for players to talk in seconds
  "voteTime": 10, //time for players to vote in seconds
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
  //player votes an imposter
  socket.on("voteImposter", msg => { //msg is the id of who is being voted
    if (gameRunning && game["canVote"] && game["imposters"].indexOf(sID) == -1 && msg != sID && game["players"].indexOf(msg) != -1) {
      console.log(`${sID} voted ${msg}`);
      if (game[`r${game["round"]}`][sID] == undefined) { //if the votes array in round object have not yet been created
        game[`r${game["round"]}`][sID] = [];
      };
      if (game[`r${game["round"]}`][sID].length >= game["impostersCount"]) { //if the player voted more times than amount of imposters
        game[`r${game["round"]}`][sID].push(msg); // register the vote in the game object
        game[`r${game["round"]}`][sID].shift(); //remove the earliest vote
      } else {
        game[`r${game["round"]}`][sID].push(msg); // register the vote in the game object
      }
    } else {
      console.log("invalid vote by " + sID)
    }
  });
  //player evaluates an imposter
  socket.on("voteCorrectnes", msg => {  //data format is : ["imposter's id", number]
    if (gameRunning && game["canVoteCorrectnes"] && game["imposters"].indexOf(sID) == -1 && game["imposters"].indexOf(msg[0]) != -1) {
      console.log(`${sID} gave a score of ${msg[1]} to the imposter ${msg[0]}`);
      game[`c${game["round"]}`][sID][msg[0]] = msg[1]; // register the vote in the game object
    } else {
      console.log("invalid correctnes vote by " + sID)
    }
  })
  //When a connection goes down:
  socket.on('disconnect', (socket) => {
    connectionCounter -= 1;
    connectionsIDs = connectionIDs.splice(connectionIDs.indexOf(sID), 1); //remove the id from the array of connected users
    if (gameRunning && game["players"].indexOf(sID) != -1) { //if the game is running and this id is a player
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


//THE GAME FUNCTIONS:

function gameInit() { //initialize the game
  game = {
    "players": [], //array with ids of players
    "pnames": {}, //copy of readyplayers when startting game
    "ppoints": {}, //object with sIds as keys and numbers representing the points of the player
    "imposters": [], //array of ids of imposters
    "impostersCount": 1, //how many imposters are in this game?
    "round": 1, //round counter, when = player count game ends.
    "playersOrder": [], //players that stil haven't said anything.
    "usedWordSets": [], //keys of sets used
    "setIndex": 0, //current set
    "imposterIndex": 0, // if the imposter gets the first or the second word of the word pair
    "talkTime": 5, // time for players to talk in seconds
    "voteTime": 16, //time for players to vote in seconds
    "canVote": false, //when a client sends a imposter vote, it will only be registered if this is true
    "canVoteCorrectnes": false, //when a client sends a correctnes vote, it will only be registered if this is true
  };
  gameRunning = true;
  console.log('start game says hi!')
  for (key in readyPlayers) { // for every player that is ready
    game["players"].push(key); //everybody is added to the players array
    game["pnames"][key] = readyPlayers[key]; //add player's name to the pnames object in game object
    game["ppoints"][key] = 0; //give everybody 0 points
  };
  joinedPlayers = {}; //clear joined players for potential next game
  readyPlayers = {}; //clear ready players for potential next game
  io.sockets.emit("joinPlayersNames", joinedPlayers); //send empty joinedPlayers to clients
  io.sockets.emit("readyPlayers", readyPlayers); //send empty readyPlayers to the clients
  game["impostersCount"] = Math.floor((game["players"].length + 4) / 5); //calculate number of imposters
  console.log(game)
  gameSendGameState();
  game["players"].forEach(e => { //send each player command to start game and client game state
    io.to(e).emit("startGame", "start");
  });
};

function gameSendGameState() {
  clientGame = { //this object will be sent to the client to sync game state
    "players": game["players"], //array with ids of players
    "pnames": game["pnames"], //copy of readyplayers when startting game
    "ppoints": game["ppoints"], //object with sIds as keys and numbers representing the points of the player
    "impostersCount": game["impostersCount"], //how many imposters are in this game?
    "round": game["round"], //round counter, when = player count game ends.
    "talkTime": game["talkTime"], // time for players to talk in seconds
    "voteTime": game["voteTime"], //time for players to vote in seconds
  };
  game["players"].forEach(e => { //send each player command to start game and client game state
    io.to(e).emit("gameStateUpdate", clientGame);
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
  game["imposters"] = [];
  var impCandidates = [];
  for (key in game["players"]) { //copy the array
    impCandidates[key] = game["players"][key];
  }
  for (key in impCandidates) { //shuffle the array
    index = Math.floor(Math.random() * impCandidates.length);
    temp = impCandidates[index];
    impCandidates[index] = impCandidates[key];
    impCandidates[key] = temp;
  }
  impCandidates.splice(game["impostersCount"]); //take the amount needed as imposters
  game["imposters"] = impCandidates; //store the result in the game object
  game[`r${game["round"]}`] = {}; //initialize round imposter voting register object
  for (imp of game["imposters"]) {
    game[`r${game["round"]}`][imp] = "imposter" //put imposter as the voting result
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

function gameSendWord(client) { //client is the sID to whom the word is sent
  if (game["imposters"].indexOf(client) != -1) { // if imposter
    game["players"].forEach(e => { // to every player
      if (e != client) { //if not the destinatario of the word
        io.to(e).emit("gamePlayerTalking", game["pnames"][client])//send who is talking
      }
    });
    io.to(client).emit("gameImposterWord", words[game["setIndex"]][game["imposterIndex"]]);
  } else { // if not imposter
    game["players"].forEach(e => { // to every player
      if (e != client) { //if not the destinatario of the word
        io.to(e).emit("gamePlayerTalking", game["pnames"][client]) //send who is talking
      }
    });
    io.to(client).emit("gameNormalWord", words[game["setIndex"]][Math.abs(game["imposterIndex"] - 1)]);
  };
}

function gameVoteImposter() {
  game["canVote"] = true;
  game["players"].forEach(e => { //send each player command to vote
    io.to(e).emit("gameVoteImposter", game["imposters"]);
  });
}

function gameEndVoteImposter() { //when the voting ends
  game["canVote"] = false; //can't vote anymore
  game["players"].forEach(e => { //send each player command to vote
    io.to(e).emit("gameEndVoteImposter", `Voting ends`);
  });
};

function gameVoteCorrectnes() {
  game["canVoteCorrectnes"] = true;
  game[`c${game["round"]}`] = {} //initialize correctnes object
  for (key in game['players']) {
    if (game["imposters"].indexOf(game['players'][key]) == -1) { //if not imposter
      game[`c${game["round"]}`][game['players'][key]] = {};  //initiaize player's voting object
    }
  }
  game["players"].forEach(e => { //send each player command to vote
    io.to(e).emit("gameVoteCorrectnes", [game["imposters"], words[game["setIndex"]][game["imposterIndex"]]]);
  });
}

function gameEndVoteCorrectnes() { //when the voting ends
  game["canVoteCorrectnes"] = false;
  game["players"].forEach(e => { //send each player command to vote
    io.to(e).emit("gameEndVoteCorrectnes", `Correctnes voting ends`);
  });
}

function gameEvalPoints() {
  //create array of nonimposters
  var nonimposters = [...game["players"]];
  for (key in game["imposters"]) {
    nonimposters.splice(nonimposters.indexOf(game["imposters"][key]), 1)
  }

  //if guessed the imposter points/2
  let points = 100;
  for (key in nonimposters) { //for every nonimposter
    try {
      for (vote in game[`r${game["round"]}`][nonimposters[key]]) { //for every id whom this player voted
        // game[`r${game["round"]}`][nonimposters[key]][vote] <- that is who was voted
        if (game["imposters"].indexOf(game[`r${game["round"]}`][nonimposters[key]][vote]) != -1) { //if was indeed imposter
          game["ppoints"][nonimposters[key]] += points/2;
        }
      }
    } catch (error) {
      console.log('something went wrong with player: ' + nonimposters[key])
    }
  };

  //calculate imposters' evaluation score
  var impScores = {};
  for (key in game["imposters"]) { //for every imposter
    var score = 0;
    var sum = 0;
    var votes = 0;
    for (player in game[`c${game["round"]}`]) { //for every player that voted
      for (imp in game[`c${game["round"]}`][player]) { //for every imposter said player voted
        if (game["imposters"][key] == imp) { //if this is the imposter we are looking at
          sum += game[`c${game["round"]}`][player][imp];
          votes += 1;
        }
      }
    }
    score = sum / votes;
    if (isNaN(score)) { //if nobody voted give the best score
      score = 1;
    };
    impScores[game["imposters"][key]] = score;
    game[`impScore${game["round"]}`] = { ...impScores }; //store it to game object
  };

  //calculate imposters' points
  for (ik in game["imposters"]) { //for every imposter
    for (id in game[`r${game["round"]}`]) { //for everyone that voted
      if (game["imposters"].indexOf(id) == -1) { //if wasn't imposter
        for (key in game[`r${game["round"]}`][id]) { //for every vote
          if (game["imposters"].indexOf(game[`r${game["round"]}`][id][key]) == -1 && game[`r${game["round"]}`][id].indexOf(game["imposters"][ik]) == -1) {//if the vote isn't imposter and didn't vote this imposter
            game["ppoints"][game["imposters"][ik]] += Math.round(points / game[`impScore${game["round"]}`][game["imposters"][ik]]); //give the points
          }
        }
      }
    }
  };

};

function gameEndOfRound() {
  game["players"].forEach(e => { // to every player
    io.to(e).emit("sMsg", `end of round: ${game["round"]}`); //send end of round notice
  });
  gameSendGameState();
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
    io.to(e).emit("endGame", game); //TODO: the client doesn't do anything yet.
  });
}

async function startGame() { //THE MAIN GAME FUNCTION //TODO: ABILITY TO PAUSE
  gameInit();
  while (gameRunning) { //GAME LOOP
    gameDecidePlayersOrder(); //DECIDE PLAYERS ORDER
    gameChoosoImposter(); //CHOOSE IMPOSTER
    gameChooseWordSet(); //CHOOSE WORD SET
    for (const e of game["playersOrder"]) { //SEND EACH PLAYER ITS CORRESPONDING WORD
      gameSendWord(e);
      await new Promise(resolve => setTimeout(resolve, game["talkTime"] * 1000)); //wait 30 seconds (for people to talk)?
    };
    gameVoteImposter(); //START VOTING WHO IS THE IMPOSTER
    await new Promise(resolve => setTimeout(resolve, game["voteTime"] * 1000)); //wait ten seconds
    gameEndVoteImposter(); //END IMPOSTER VOTING
    gameVoteCorrectnes(); //VOTE WHO HAS DONE A TERRIBLE JOB  //to discuss
    await new Promise(resolve => setTimeout(resolve, game["voteTime"] * 1000)); //wait ten seconds
    gameEndVoteCorrectnes(); //END CORRECTNES VOTING
    gameEvalPoints(); //COUNT POINTS USING r1 and c1 TODO
    gameEndOfRound(); //END OF ROUND
    await new Promise(resolve => setTimeout(resolve, 5 * 1000)); //wait 5 seconds
  }
};

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});