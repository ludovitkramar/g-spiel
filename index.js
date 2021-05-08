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
var gameRunning = false;

io.on('connection', (socket) => {
  const sID = socket.id //so that it remembers when disconnecting who is disconnecting
  connectionIDs.push(sID); //array of connected user's ids
  io.sockets.emit("connectionIDs", connectionIDs); //send the array to all users
  io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
  io.sockets.emit("readyPlayers", readyPlayers); //send the player that are ready to the clients
  console.log('User ' + sID + " connected.");
  connectionCounter += 1;
  console.log(connectionCounter + ' connections are active.');
  //Test
  socket.on("test", (msg) => {
    console.log(sID + ' says: ' + msg);
  });
  //player joins game
  socket.on("playerJoin", (pname) => {
    if (!gameRunning) {
      //add player name the joinedPlayers object
      joinedPlayers[sID] = pname;
      console.log(`${sID} joined the game as: ${joinedPlayers[sID]}`);
      io.sockets.emit("joinPlayersNames", joinedPlayers); //send joinedPlayers to clients
      io.to(sID).emit("joinSuccessful", "server: join succesful");
    } else {
      io.to(sID).emit("gameRunningError", "Game running, can't join.")
    }
  });
  //player says he is ready
  socket.on("playerReady", () => {
    if (joinedPlayers[sID]) {
      if (!gameRunning) {
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
    if (gameRunning) {
      console.log('player disconnected while in game')
      io.sockets.emit("gameRunningError", "Player disconnected mid game")
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
  gameRunning = true
  while (false) {
    //game loop

    gameRunning = false;
  }
  console.log('start game says hi!')
}


server.listen(3000, () => {
  console.log('listening on *:3000');
});