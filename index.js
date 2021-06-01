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
const words = [["Stuhl", "Sofa"], ["Computer", "Laptop"], ["Wassereis", "Lolli"], ["Schreibstift", "Kugelschreiber"], ["Cannabis", "Tabak"], ["Hund", "Katze"]];
let game = {
  players: [],
  pnames: {},
  ppoints: {},
  imposters: [],
  impostersCount: 0,
  round: 0,
  playersOrder: [],
  usedWordSets: [],
  setIndex: 0,
  imposterIndex: 0,
  talkTime: 0,
  voteTime: 0,
  canVote: false,
  canVoteCorrectnes: false,
  r1: {},
  c1: {},
  impScore1: {},
  wronGuesses1: {},
  noGuesses1: {},
};

let clientGame = { //this object will be sent to the client to sync game state
  "players": ["ID1", "ID2", "ID3", "ID4"], //array with ids of players
  "pnames": {}, //copy of readyplayers when startting game
  "ppoints": {}, //object with sIds as keys and numbers representing the points of the player
  "impostersCount": 1, //how many imposters are in this game?
  "round": 1, //round counter, when = player count game ends.
  "talkTime": 5, // time for players to talk in seconds
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
      //check if someone has the same name
      var canJoin = true;
      for (key in joinedPlayers) { //if there isn't a player with the same name already
        if (joinedPlayers[key] == pname) {
          canJoin = false;
          io.to(sID).emit("gameRunningError", "Jemand hat bereits den gleichen Namen.")
        }
      }
      if (pname == "") {
        canJoin = false;
        io.to(sID).emit("gameRunningError", "Geben Sie bitte einen Namen ein.")
      }
      if (canJoin) {
        pname = pname.slice(0, 26) //don't allow long names.
        //add player name the joinedPlayers object
        joinedPlayers[sID] = pname; //add the name of the player to the joinedPlayers object with sID as the key
        console.log(`${sID} joined the game as: ${joinedPlayers[sID]}`);
        io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
        io.to(sID).emit("joinSuccessful", "server: join succesful"); //this triggers the client to show start screen.
      };
    } else {
      io.to(sID).emit("gameRunningError", "Spiel läuft, kann nicht beitreten.") //will trigger an alert on the client
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
        io.to(sID).emit("gameRunningError", "Spiel läuft.")
      }
    } else {
      io.to(sID).emit("gameRunningError", "Bitte erst beitreten.")
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
      io.sockets.emit("gameRunningError", `${game["pnames"][sID]} (${sID}) hat die Verbindung mitten im Spiel unterbrochen.`);
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
  socket.on('reconnect', msg => {
    if (gameRunning && connectionIDs.indexOf(msg) == -1) { //only reconnect if game is running and the requested id is not connected
      if (game["players"].indexOf(msg) != -1) {//if the id is one of the players
        //replace the id
        console.log('reconnect approved: ' + sID + ' replaces ' + msg)
        const regx = new RegExp(msg, 'g');
        var modObject = JSON.stringify(game).replace(regx, sID)
        game = JSON.parse(modObject);
        //send the things for it to work fine
        gameSendGameState();
        io.to(sID).emit("startGame", "start");
        io.to(sID).emit("sMsg", "Sie wurden automatisch neu verbunden.");
        for (key in game["players"]) { //for every player
          io.to(game["players"][key]).emit("sMsg", `${game["pnames"][sID]} (${sID}) wurde wieder verbunden.`);
        }
      } else {
        console.log('not player wanted to reconnect: ' + msg)
      }
    } else {
      console.log('bad reconnect request: ' + msg)
    }
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
    "voteTime": 10, //time for players to vote in seconds
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
  game["totalRounds"] = game["players"].length;
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
          game["ppoints"][nonimposters[key]] += points / 2;
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

  //calculate imposter's points
  game[`wronGuesses${game["round"]}`] = {}; //initialize object to count wrong guesses each imposter achieved
  game[`noGuesses${game["round"]}`] = {}; //initialize object to count wrong guesses each imposter achieved
  for (ik in game["imposters"]) { //for every imposter
    var wrongGuesses = 0;
    //calculate all the times a normal player guessed incorrectly
    for (id in game[`r${game["round"]}`]) { //for everyone that voted
      if (game["imposters"].indexOf(id) == -1) { //if wasn't imposter
        var didntVotethisImposter = true; //assume the player didn't vote this imposter
        for (key in game[`r${game["round"]}`][id]) { //for every vote
          if (game["imposters"][ik] == game[`r${game["round"]}`][id][key]) {//if the vote was this imposter
            didntVotethisImposter = false
          }
        }
        if (didntVotethisImposter && game[`r${game["round"]}`][id].length == game["imposters"].length) { //if none of the votes were this imposter and voted as many times as there are imposters (if haven't voted all the times he could have, that is a noGuess, not wrongVote)
          wrongGuesses += 1
        };
      }
    }
    game[`wronGuesses${game["round"]}`][game["imposters"][ik]] = wrongGuesses; //store wrong guesses
    var noVote = 0;
    //add all the empty votes, player that did not vote count as voting incorrectly
    for (key in game["players"]) { //for every player
      if (game["imposters"].indexOf(game["players"][key]) == -1) { //if wasn't imposter
        if (game[`r${game["round"]}`][game["players"][key]] == undefined) { //if haven't voted at all
          noVote += 1;
        } else { //if have voted somebody already
          if (game[`r${game["round"]}`][game["players"][key]].indexOf(game["imposters"][ik]) == -1) { //if haven't voted this imposter
            if (game[`r${game["round"]}`][game["players"][key]].length < game["imposters"].length) { //if voted less players than there are imposters
              noVote += 1;
            }
          }
        }
      }
    }
    game[`noGuesses${game["round"]}`][game["imposters"][ik]] = noVote; //store empty guesses
    game["ppoints"][game["imposters"][ik]] += Math.round(points * (wrongGuesses + noVote) / game[`impScore${game["round"]}`][game["imposters"][ik]]); //give the points
  };
};

function gameSendRoundStats() {  //SEND r* c* impScore* wronGuesses* noGuesses* from game to client
  const roundStats = {
    'r': game[`r${game["round"]}`],
    'c': game[`c${game["round"]}`],
    'impScore': game[`impScore${game["round"]}`],
    'wronGuesses': game[`wronGuesses${game["round"]}`],
    'noGuesses': game[`noGuesses${game["round"]}`],
    'imposters': game["imposters"]
  };
  game["players"].forEach(e => { // to every player
    io.to(e).emit("gameRoundStats", roundStats); //round stats
  });
}

function gameSendRoundStatsEnd() { //send command to remove round stats from screen
  game["players"].forEach(e => { // to every player
    io.to(e).emit("gameRoundStatsEnd", 'end'); //round stats
  });
}

function gameEndOfRound() {
  console.log("end of round:" + game["round"] + " , game state below:");
  console.log(game);
  if (game["round"] == game["totalRounds"]) { //if is the last round
    gameEnds();
  } else {
    game["players"].forEach(e => { // to every player
      // io.to(e).emit("sMsg", `end of round: ${game["round"]}`); //send end of round notice
    });
    game["round"] += 1; //move on to next round
  }
}

function gameSendRemainingSecs(s) {
  game["players"].forEach(e => { //send each player
    io.to(e).emit("gameRemainingSecs", s); //how many secons remain
  });
};

function gameSendNewPhaseNotice(phaseCode) { //phaseCode should be a single letter: 'j' join, 's' start, 't' talk, 'v' vote, 'e' evaluate, 'r' round stats, 'f' finished game (endScr)
  game["players"].forEach(e => { //send each player
    io.to(e).emit("gameNewPhase", phaseCode);
  });
}

function gameEnds() {
  gameRunning = false; //game finished
  console.log('game ended')
  game["players"].forEach(e => { //send each player command to end game
    io.to(e).emit("endGame", game);
  });
}

async function startGame() { //THE MAIN GAME FUNCTION //TODO: ABILITY TO PAUSE
  gameInit();
  while (gameRunning) { //GAME LOOP
    gameDecidePlayersOrder(); //DECIDE PLAYERS ORDER
    gameChoosoImposter(); //CHOOSE IMPOSTER
    gameChooseWordSet(); //CHOOSE WORD SET
    gameSendGameState(); //LET CLIENT UPDATE THE ROUNDS AND THINGS
    gameSendNewPhaseNotice('t') //Tell player next phase is the talking phase
    await new Promise(resolve => setTimeout(resolve, 3000)); //wait three seconds
    for (const e of game["playersOrder"]) { //SEND EACH PLAYER ITS CORRESPONDING WORD
      gameSendWord(e);
      for (i = game["talkTime"]; i > 0; i--) { //wait talktime and notify clients
        gameSendRemainingSecs(i); //send every player how many seconds remain
        await new Promise(resolve => setTimeout(resolve, 1000)); //wait taktime seconds (for people to talk)
      }
    };
    gameSendNewPhaseNotice('v') //Tell player next phase is the voting phase
    await new Promise(resolve => setTimeout(resolve, 3000)); //wait three seconds
    gameVoteImposter(); //START VOTING WHO IS THE IMPOSTER
    for (i = game["voteTime"]; i > 0; i--) { //wait votetime and notify clients
      gameSendRemainingSecs(i); //send every player how many seconds remain
      await new Promise(resolve => setTimeout(resolve, 1000)); //wait taktime seconds (for people to talk)
    }
    gameEndVoteImposter(); //END IMPOSTER VOTING
    gameSendNewPhaseNotice('e') //Tell player next phase is the evaluation phase
    await new Promise(resolve => setTimeout(resolve, 3000)); //wait three seconds
    gameVoteCorrectnes(); //VOTE WHO HAS DONE A TERRIBLE JOB  //to discuss
    for (i = game["voteTime"]; i > 0; i--) { //wait votetime and notify clients
      gameSendRemainingSecs(i); //send every player how many seconds remain
      await new Promise(resolve => setTimeout(resolve, 1000)); //wait taktime seconds (for people to talk)
    }
    gameEndVoteCorrectnes(); //END CORRECTNES VOTING
    gameEvalPoints(); //COUNT POINTS USING r1 and c1
    gameSendGameState(); //LET CLIENT UPDATE THE POINTS AND THINGS
    gameSendNewPhaseNotice('r') //Tell player next phase is the round stats phase
    await new Promise(resolve => setTimeout(resolve, 3000)); //wait three seconds
    gameSendRoundStats(); //SEND r* c* impScore* wronGuesses* noGuesses* from game to client
    for (i = 15; i > 0; i--) { //wait 15s and notify clients
      gameSendRemainingSecs(i); //send every player how many seconds remain
      await new Promise(resolve => setTimeout(resolve, 1000)); //wait taktime seconds (for people to talk)
    }
    gameSendRoundStatsEnd(); //TELL CLIENT TO STOP SHOWING THE STATS
    gameEndOfRound(); //END OF ROUND
  }
};

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
