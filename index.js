const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public')); // Serve Static Assets

//Variables for the app and game start here, above are essential things for server operation.
var connectionCounter = 0; //Monitor current connections
var connectionIDs = [];
var joinedPlayers = {};
var readyPlayers = {};
//game related variables:
var gameRunning = false;
const words = [["Tisch", "Sofa"], ["Computer", "Notebook"], ["Wassereis", "Lolli"], ["Schreibstift", "Kugelschreiber"]];
var game = {
  "players": [], //array with ids of players
  "pnames": {}, //copy of readyplayers when startting game
  "imposter": "", //id of the imposter
  "round": 0, //round counter, when = player count game ends.
  "playersLeft": [], //players that stil haven't said anything.
  "r1": { //each round is stored like this
    "ID1": "ID3", //id from players array, id1 voted id3
    "ID2": "ID1",
    "ID3": "imposter", //id3 was imposter, couldn't vote.
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

        if (readyCount >= 3 && readyCount / joinedCount == 1) {
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
function startGame() {
  gameRunning = true;
  rndmax = 0 //the player with maximun random value will be the imposter.
  for (key in readyPlayers) { // for every player that is ready
    num = Math.random();
    if (num > rndmax) {
      rndmax = num
      game["imposter"] = key; //is imposter if has the largest number
    };
    game["players"].push(key); //everybody is added to the players array
    game["pnames"][key] = readyPlayers[key]; //add player's name to the pnames object in game object
  };
  console.log(game)

  joinedPlayers = {}; //clear joined players for potential next game
  readyPlayers = {}; //clear ready players for potential next game
  game["players"].forEach(e => { //send each player command to start game
    io.to(e).emit("startGame", "start"); //TODO: the client doesn't do anything yet.
  });
  while (false) {
    //game loop

    gameRunning = false;
  }
  console.log('start game says hi!')
}


server.listen(8282, () => {
  console.log('listening on *:8282');
});