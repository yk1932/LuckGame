//Initialize the express 'app' object
let express = require("express");
let app = express();
app.use("/", express.static("public"));

//Initialize the actual HTTP server
let http = require("http");
let server = http.createServer(app);

let rooms = {};
let users = {};

//keep track of how many doors have been opened for game # 1
let doorGuessNum = 0;
let currentTurn = 0;
let turn = 0;
//player list
let players = [];

const randomize = (totalNum) => {
  randomNum = Math.floor(Math.random() * totalNum + 1);
  return randomNum;
};

//randomize the initial numbers that we use for each game
let doorNum = randomize(4);
let toothNum = randomize(13);
let chaliceNum = randomize(3);

//Initialize socket.io
let io = require("socket.io");

io = new io.Server(server);

let connectionsLimit = 4;
io.on("connection", function (socket) {
  //checking for connections limit but probably not the correct way to do it
  if (io.engine.clientsCount > connectionsLimit) {
    socket.emit("err", { message: "reach the limit of connections" });
    socket.disconnect();
    console.log("Disconnected...");
    return;
  }
});

io.sockets.on("connect", (socket) => {
  console.log("wheee", socket.id);

  //sending user data
  socket.on("userData", (data) => {
    socket.name = data.name;
    socket.roomName = data.room;

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
    //for keeping track of rooms in use

    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }
    //keeping track of users in each room
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
    //sending player to clients
    let playerList = users[socket.roomName];
    io.to(socket.roomName).emit("loadPlayers", playerList);
  });

  socket.on("gameInitialize", (data) => {
    //initializing the game (when we reach the game page)
    console.log("in game initialize");
    //save user name in array
    socket.name = data.name;
    socket.roomName = data.room;
    console.log(data.name, data.room);
    //let the socket join room of choice
    socket.join(socket.roomName);
    //adding players to our array for keeping track of turns
    players.push(socket.name);

    if (rooms[socket.roomName]) {
      rooms[socket.roomName]++;
    } else {
      rooms[socket.roomName] = 1;
    }

    //used to keep track who's alive
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
    //getting next player and sending signal
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
    if (users[socket.roomName]) {
      users[socket.roomName].push(socket.name);
    } else {
      users[socket.roomName] = [socket.name];
    }
    console.log("rooms: ", rooms);
    console.log("is for game");
  });

  socket.on("doorGuess", (data) => {
    socket.roomName = data.room;
    //boolean for if a char is dead, probably should'veb just used the users object
    let playerStatus = true;

    if (data.guess == doorNum) {
      playerStatus = false;
      //removing the user from the players array
      playerIndex = players.indexOf(socket.name);
      console.log("le player index in guess", playerIndex);
      players.splice(playerIndex, 1);
      console.log(players);

      //reset this num so it won't trigger the door reset
      doorGuessNum = 0;
      //looping through the users object to set the player to dead
      for (let i = 0; i < users[socket.roomName].length; i++) {
        console.log(users[socket.roomName][i]);
        if (users[socket.roomName][i].name == socket.name) {
          users[socket.roomName][i].status = false;
        }
      }
      //signal game is over and to go to next game
      io.to(socket.roomName).emit("gameOver");
      turn = 0;
      currentTurn = 0;
    } else {
      //incrementing the turns asnd sending data to next player
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
    //shjowing all results to the players
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
  });

  //Level two has begun
  //initialize the page for game 2
  socket.on("levelTwo", () => {
    console.log("Level two start eeeeeK", players);
    io.to(socket.roomName).emit("levelTwoStart");
  });
  //actually beginning game 2 and signalling to players to start their turn
  //similar to code above
  socket.on("beginLevelTwo", () => {
    let turnData = {
      name: players[turn],
    };
    io.to(socket.roomName).emit("playerTurn", turnData);
  });
  socket.on("chaliceGuess", (data) => {
    socket.roomName = data.room;
    let playerStatus = true;

    if (data.guess == chaliceNum) {
      playerStatus = false;
      playerIndex = players.indexOf(socket.name);
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
      let nextPlayer = {
        name: players[turn],
      };
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

  //similar to code above, these probably shouldv'e been one event that different based on what game it was
  socket.on("levelThree", () => {
    console.log("Level three start eeeeeK", players);
    console.log("123123", players[turn], turn);

    io.to(socket.roomName).emit("levelThreeStart");
  });
  socket.on("beginLevelThree", () => {
    let turnData = {
      name: players[turn],
    };
    io.to(socket.roomName).emit("playerTurn", turnData);
  });

  socket.on("teethGuess", (data) => {
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
    }

    rooms[socket.roomName]--;
  });
});

//run the createServer
let port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log("Server listening at port: " + port);
});
