//Initialize the express 'app' object
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//Initialize the actual HTTP server
let http = require("http");
let server = http.createServer(app);

let rooms = {};
let users = {};

const randomize = (totalNum) => {
  randomNum = Math.floor(Math.random() * totalNum + 1);
  return randomNum;
};

let doorNum = randomize(4);
console.log(randomize(4));

//Initialize socket.io
let io = require("socket.io");
io = new io.Server(server);

io.sockets.on("connect", (socket) => {
  console.log("wheee", socket.id);

  socket.on("userData", (data) => {
    //save user name in array
    socket.name = data.name;
    socket.roomName = data.room;
    console.log(data.name, data.room);
    //let the socket join room of choice
    socket.join(socket.roomName);

    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }
    console.log("ROOMBEG", rooms[socket.roomName]);
    if (users[socket.roomName]) {
      users[socket.roomName].push(socket.name);
    } else {
      users[socket.roomName] = [socket.name];
    }
    console.log("rooms: ", rooms);
    console.log("users: ", users);
    let playerList = users[socket.roomName];
    console.log(playerList, socket.roomName);
    console.log("count", rooms[socket.roomName]);
    io.to(socket.roomName).emit("loadPlayers", playerList);
  });
  socket.on("startPressed", (data) => {
    socket.roomName = data.room;
    console.log("press clicked");
    io.to(socket.roomName).emit("gameStart");
    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }
    console.log("ROOMBEG", rooms[socket.roomName]);
    if (users[socket.roomName]) {
      users[socket.roomName].push(socket.name);
    } else {
      users[socket.roomName] = [socket.name];
    }
    console.log("rooms: ", rooms);
    console.log("is for game");
  });

  // socket.on("gameInitialize", (data) => {
  //   socket.name = data.name;
  //   socket.roomName = data.room;
  //   socket.join(socket.roomName);
  // });
  socket.on("doorGuess", (data) => {
    console.log("door num", doorNum);
    console.log(data);
    console.log(data.guess);
    let playerStatus = true;
    if (data.guess == doorNum) {
      playerStatus = false;
    }
    console.log("guy dead frfr");

    let player = {
      player: socket.name,
      result: playerStatus,
      door: data.guess,
    };
    socket.emit("yourResult", player);
    socket.to(socket.roomName).emit("playerResult", player);
  });

  socket.on("disconnect", () => {
    console.log("connection ended", socket.id);
    if (users[socket.roomName]) {
      let index = users[socket.roomName].indexOf(socket.name);
      if (index > -1) {
        users[socket.roomName].splice(index, 1);
        console.log("spliced");
      }
      console.log("index!@#!@", index);
    }

    rooms[socket.roomName]--;
  });
});

//run the createServer
let port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("Server listening at port: " + port);
});
