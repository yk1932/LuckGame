//Initialize the express 'app' object
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//Initialize the actual HTTP server
let http = require("http");
let server = http.createServer(app);

let rooms = {};
let users = {};
let doorGuessNum = 0;
let currentTurn = 0;
let turn = 0;
let players = [];
let gameStart = false;
let levelTwo = false;

const randomize = (totalNum) => {
  randomNum = Math.floor(Math.random() * totalNum + 1);
  return randomNum;
};

let doorNum = randomize(4);
let toothNum = randomize(13);
let chaliceNum = randomize(3);
// let doorNum = 1;
// let chaliceNum = 1;
// let toothNum = 1;

console.log(randomize(4));

//Initialize socket.io
let io = require("socket.io");
io = new io.Server(server);

let connectionsLimit = 4;
io.on("connection", function (socket) {
  if (io.engine.clientsCount > connectionsLimit) {
    socket.emit("err", { message: "reach the limit of connections" });
    socket.disconnect();
    console.log("Disconnected...");
    return;
  }
});

io.sockets.on("connect", (socket) => {
  console.log("wheee", socket.id);

  socket.on("userData", (data) => {
    //save user name in array
    socket.name = data.name;
    socket.roomName = data.room;
    console.log(data.name, data.room);
    //let the socket join room of choice
    if (!io.sockets.adapter.rooms.get(socket.roomName)) {
      socket.join(socket.roomName);
    } else {
      if (io.sockets.adapter.rooms.get(socket.roomName).size >= 4) {
        socket.emit("err", { message: "reach the limit of connections" });
      } else {
        socket.join(socket.roomName);
      }
    }

    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }
    console.log("ROOMBEG", rooms[socket.roomName]);
    if (users[socket.roomName]) {
      let playerInfo = {
        name: socket.name,
        status: true,
      };
      users[socket.roomName].push(playerInfo);
    } else {
      let playerInfo = {
        name: socket.name,
        status: true,
      };
      users[socket.roomName] = [playerInfo];
    }
    console.log("rooms: ", rooms);
    console.log("users: ", users);
    let playerList = users[socket.roomName];
    console.log("player array", players);
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

  socket.on("gameInitialize", (data) => {
    console.log("in game initialize");
    //save user name in array
    socket.name = data.name;
    socket.roomName = data.room;
    console.log(data.name, data.room);
    //let the socket join room of choice
    socket.join(socket.roomName);
    players.push(socket.name);

    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }
    if (users[socket.roomName]) {
      let playerInfo = {
        name: socket.name,
        status: true,
      };
      users[socket.roomName].push(playerInfo);
    } else {
      let playerInfo = {
        name: socket.name,
        status: true,
      };
      users[socket.roomName] = [playerInfo];
    }
    console.log("le socket name and sutff", socket.name, players[currentTurn]);
    let turnData = {
      name: players[currentTurn],
    };
    io.to(socket.roomName).emit("playerTurn", turnData);
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
  socket.on("doorGuess", (data) => {
    console.log("door num", doorNum);
    console.log(data);
    console.log(data.guess);
    socket.roomName = data.room;
    let playerStatus = true;

    if (data.guess == doorNum) {
      playerStatus = false;
      playerIndex = players.indexOf(socket.name);
      console.log("le player index in guess", playerIndex);
      players.splice(playerIndex, 1);
      console.log(players);
      doorGuessNum = 0;
      for (let i = 0; i < users[socket.roomName].length; i++) {
        console.log(users[socket.roomName][i]);
        if (users[socket.roomName][i].name == socket.name) {
          users[socket.roomName][i].status = false;
        }
      }
      io.to(socket.roomName).emit("gameOver");
      turn = 0;
      currentTurn = 0;
    } else {
      currentTurn++;
      turn = currentTurn % players.length;
      console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
      console.log("!!! turn", turn);
      let nextPlayer = {
        name: players[turn],
      };
      console.log(nextPlayer);
      console.log(socket.roomName);
      io.to(socket.roomName).emit("playerTurn", nextPlayer);
    }
    console.log(users[socket.roomName]);
    let player = {
      player: socket.name,
      result: playerStatus,
      door: data.guess,
    };
    socket.emit("yourResult", player);
    socket.to(socket.roomName).emit("playerResult", player);
    doorGuessNum++;
    if (doorGuessNum == 3) {
      console.log("gunna reset");
      doorNum = randomize(4);
      console.log("new doornum", doorNum);
      doorGuessNum = 0;
      io.to(socket.roomName).emit("resetDoor");
    }

    // currentTurn++;
    // turn = currentTurn % players.length;
    // console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
    // console.log("!!! turn", turn);
    // let nextPlayer = {
    //   name: players[turn],
    // };
    // console.log(nextPlayer);
    // console.log(socket.roomName);
    // io.to(socket.roomName).emit("playerTurn", nextPlayer);
  });

  //Level two has begun
  socket.on("levelTwo", () => {
    console.log("Level two start eeeeeK", players);
    console.log("123123", players[turn], turn);
    // let turnData = {
    //   name: players[turn],
    // };
    io.to(socket.roomName).emit("levelTwoStart");
  });
  socket.on("beginLevelTwo", () => {
    let turnData = {
      name: players[turn],
    };
    io.to(socket.roomName).emit("playerTurn", turnData);
  });
  socket.on("chaliceGuess", (data) => {
    console.log("door num", chaliceNum);
    console.log(data);
    console.log(data.guess);
    socket.roomName = data.room;
    let playerStatus = true;

    if (data.guess == chaliceNum) {
      playerStatus = false;
      playerIndex = players.indexOf(socket.name);
      console.log("le player index in guess", playerIndex);
      players.splice(playerIndex, 1);
      console.log(players);
      for (let i = 0; i < users[socket.roomName].length; i++) {
        console.log(users[socket.roomName][i]);
        if (users[socket.roomName][i].name == socket.name) {
          users[socket.roomName][i].status = false;
        }
      }
      io.to(socket.roomName).emit("gameOver2");
      turn = 0;
      currentTurn = 0;
    } else {
      currentTurn++;
      turn = currentTurn % players.length;
      console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
      console.log("!!! turn", turn);
      let nextPlayer = {
        name: players[turn],
      };
      console.log(nextPlayer);
      console.log(socket.roomName);
      io.to(socket.roomName).emit("playerTurn", nextPlayer);
    }
    let player = {
      player: socket.name,
      result: playerStatus,
      chalice: data.guess,
    };
    socket.emit("yourChaliceResult", player);
    socket.to(socket.roomName).emit("playerChaliceResult", player);
  });
  socket.on("levelThree", () => {
    console.log("Level three start eeeeeK", players);
    console.log("123123", players[turn], turn);
    // let turnData = {
    //   name: players[turn],
    // };
    io.to(socket.roomName).emit("levelThreeStart");
  });
  socket.on("beginLevelThree", () => {
    let turnData = {
      name: players[turn],
    };
    io.to(socket.roomName).emit("playerTurn", turnData);
  });

  socket.on("teethGuess", (data) => {
    console.log("tooth num", toothNum);
    console.log(data);
    console.log(data.guess);
    socket.roomName = data.room;
    let playerStatus = true;

    if (data.guess == toothNum) {
      playerStatus = false;
      playerIndex = players.indexOf(socket.name);
      console.log("le player index in guess", playerIndex);
      players.splice(playerIndex, 1);
      console.log(players);
      for (let i = 0; i < users[socket.roomName].length; i++) {
        console.log(users[socket.roomName][i]);
        if (users[socket.roomName][i].name == socket.name) {
          users[socket.roomName][i].status = false;
        }
      }
      let data = {
        name: players[0],
      };
      io.to(socket.roomName).emit("gameOver3", data);
      turn = 0;
      currentTurn = 0;
    } else {
      currentTurn++;
      turn = currentTurn % players.length;
      console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
      console.log("!!! turn", turn);
      let nextPlayer = {
        name: players[turn],
      };
      console.log(nextPlayer);
      console.log(socket.roomName);
      io.to(socket.roomName).emit("playerTurn", nextPlayer);
    }
    let player = {
      player: socket.name,
      result: playerStatus,
      tooth: data.guess,
    };
    socket.emit("yourToothResult", player);
    socket.to(socket.roomName).emit("playerToothResult", player);
  });

  socket.on("disconnect", () => {
    console.log("connection ended", socket.id);
    if (users[socket.roomName]) {
      for (user in users[socket.roomName]) {
        console.log("TEST", user);
        if (users[socket.roomName][user].name == socket.name) {
          console.log("is a match gunna delete", user);
          users[socket.roomName].splice(user, 1);
          console.log("is cut", users[socket.roomName]);
        }
      }
      let index = users[socket.roomName].indexOf(socket.name);
      if (index > -1) {
        users[socket.roomName].splice(index, 1);
        console.log("spliced");
      }
      let playerIndex = players.indexOf(socket.name);
      if (playerIndex > -1) {
        players.splice(playerIndex, 1);
        console.log("anoth erplisce", players);
      }
      // let playerListIndex = playerList.indexOf(socket.name);
      // if (playerListIndex)
      console.log("index!@#!@", index, playerIndex);
    }

    rooms[socket.roomName]--;
  });
});

//run the createServer
let port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("Server listening at port: " + port);
});
