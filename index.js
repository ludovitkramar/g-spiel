const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public')); // Serve Static Assets

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/spaceship/', (req, res) => {
  res.sendFile(__dirname + '/spaceship.html');
});

//Variables for the app and game start here, above are essential things for server operation.
var connectionCounter = 0; //Monitor current connections
var connectionIDs = [];

io.on('connection', (socket) => {
  const sID = socket.id //so that it remembers when disconnecting who is disconnecting
  connectionIDs.push(sID); //array of connected user's ids
  io.sockets.emit("connectionIDs", connectionIDs); //send the array to all users
  console.log('User ' + sID + " connected.");
  connectionCounter += 1;
  console.log(connectionCounter + ' connections are active.');
  //Test
  socket.on("test", (msg) => {
    console.log(sID + ' says: ' + msg);
  });
  //When a connection goes down:
  socket.on('disconnect', (socket) => {
    connectionCounter -= 1;
    connectionsIDs = connectionIDs.splice(connectionIDs.indexOf(sID), 1); //remove the id from the array of connected users
    io.sockets.emit("connectionIDs", connectionIDs); //send the updated array to all users
    console.log('User ' + sID + " disconnected.");
    console.log(connectionCounter + ' connections are active.');
  });
});



server.listen(3000, () => {
  console.log('listening on *:3000');
});