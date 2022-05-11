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
console.log("door num!!", doorNum);
let toothNum = randomize(13);
let chaliceNum = randomize(3);
let mysteryNum = randomize(100);

let purpleGuess = false;
let pinkGuess = false;
let greenGuess = false;
let orangeGuess = false;

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
  socket.on("checkPlayerCount", (data) => {
    console.log("THE ID", socket.id);
    console.log(data);
    socket.roomName = data.room;
    let playerNumData;
    if (!io.sockets.adapter.rooms.get(socket.roomName)) {
      console.log("UNFEDINFE DBRSOKSIIII");
      playerNumData = {
        playerNum: 0,
      };
    } else {
      console.log("not undefiend");
      playerNum = io.sockets.adapter.rooms.get(socket.roomName).size;
      playerNumData = {
        playerNum: playerNum,
      };
    }
    console.log("THE NEW DAA", playerNumData);
    socket.emit("yourPlayerNum", playerNumData);
  });

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
        playerID: data.playerID,
        status: true,
      };
      users[socket.roomName].push(playerInfo);
    } else {
      let playerInfo = {
        name: socket.name,
        playerID: data.playerID,
        status: true,
      };
      users[socket.roomName] = [playerInfo];
    }
    //sending player to clients
    let playerList = users[socket.roomName];
    io.to(socket.roomName).emit("loadPlayers", playerList);
  });

  // Level One
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
        playerID: data.playerID,
        status: true,
      };
      users[socket.roomName].push(playerInfo);
    } else {
      let playerInfo = {
        name: socket.name,
        playerID: data.playerID,
        status: true,
      };
      users[socket.roomName] = [playerInfo];
    }

    // io.to(socket.roomName).emit("playerTurn", turnData);
    io.to(socket.roomName).emit("levelOneStart");
  });

  socket.on("levelOneEnd", () => {
    //getting next player and sending signal

    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (players[currentTurn] == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data", playerIDturn);
      }
    }
    let turnData = {
      name: players[currentTurn],
      playerID: playerIDturn,
    };
    io.to(socket.roomName).emit("levelTwoStart", turnData);
  });

  socket.on("startPressed", (data) => {
    if (io.engine.clientsCount == connectionsLimit) {
      socket.roomName = data.room;
      console.log("press clicked");
      // io.to(socket.roomName).emit("gameOver3");
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
    } else {
      socket.emit("notenough");
    }
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
      let playerIDdata = {
        playerID: data.playerID,
      };
      //signal game is over and to go to next game
      io.to(socket.roomName).emit("gameOver", playerIDdata);

      turn = 0;
      currentTurn = 0;
    } else {
      //incrementing the turns asnd sending data to next player
      currentTurn++;
      turn = currentTurn % players.length;
      console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
      console.log("!!! turn", turn);
      // let nextPlayer = {
      //   name: players[turn],
      // };
      console.log(socket.roomName);
      let playerIDturn;
      for (let i = 0; i < users[socket.roomName].length; i++) {
        if (players[turn] == users[socket.roomName][i].name) {
          playerIDturn = users[socket.roomName][i].playerID;
          console.log("turn data2", playerIDturn);
        }
      }
      let turnData = {
        name: players[turn],
        playerID: playerIDturn,
      };
      io.to(socket.roomName).emit("playerTurn", turnData);
    }
    //shjowing all results to the players
    console.log(users[socket.roomName]);
    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (socket.name == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data3", playerIDturn);
      }
    }
    let player = {
      player: socket.name,
      result: playerStatus,
      door: data.guess,
      playerID: playerIDturn,
    };
    console.log("player!!!", player);
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
    // io.to(socket.roomName).emit("gameOver");

    io.to(socket.roomName).emit("levelThreeStart");
  });
  //actually beginning game 2 and signalling to players to start their turn
  //similar to code above
  socket.on("beginLevelTwo", () => {
    // let turnData = {
    //   name: players[turn],
    // };
    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (players[turn] == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data4", playerIDturn);
      }
    }
    let turnData = {
      name: players[currentTurn],
      playerID: playerIDturn,
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
      let playerIDdata = {
        playerID: data.playerID,
      };
      io.to(socket.roomName).emit("gameOver2", playerIDdata);
      turn = 0;
      currentTurn = 0;
    } else {
      currentTurn++;
      turn = currentTurn % players.length;
      // let nextPlayer = {
      //   name: players[turn],
      // };
      let playerIDturn;
      for (let i = 0; i < users[socket.roomName].length; i++) {
        if (players[turn] == users[socket.roomName][i].name) {
          playerIDturn = users[socket.roomName][i].playerID;
          console.log("turn data5", playerIDturn);
        }
      }
      let turnData = {
        name: players[currentTurn],
        playerID: playerIDturn,
      };
      io.to(socket.roomName).emit("playerTurn", turnData);
    }
    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (socket.name == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data6", playerIDturn);
      }
    }
    let player = {
      player: socket.name,
      result: playerStatus,
      chalice: data.guess,
      playerID: playerIDturn,
    };
    socket.emit("yourChaliceResult", player);
    socket.to(socket.roomName).emit("playerChaliceResult", player);
  });

  //similar to code above, these probably shouldv'e been one event that different based on what game it was
  socket.on("levelFour", () => {
    console.log("Level three start eeeeeK", players);
    console.log("123123", players[turn], turn);

    io.to(socket.roomName).emit("levelFourStart");
  });
  socket.on("beginLevelFour", () => {
    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (players[turn] == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data7", playerIDturn);
      }
    }
    let turnData = {
      name: players[currentTurn],
      playerID: playerIDturn,
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
      let playerIDturn;
      for (let i = 0; i < users[socket.roomName].length; i++) {
        if (players[0] == users[socket.roomName][i].name) {
          playerIDturn = users[socket.roomName][i].playerID;
          console.log("turn data9", playerIDturn);
        }
      }
      let data = {
        name: players[0],
        playerIDturn: playerIDturn,
      };
      io.to(socket.roomName).emit("gameOver3", data);
      turn = 0;
      currentTurn = 0;
    } else {
      currentTurn++;
      turn = currentTurn % players.length;
      console.log(currentTurn, players.length, "ioufhdsiufhdsiufhdisuhf");
      console.log("!!! turn", turn);
      // let nextPlayer = {
      //   name: players[turn],
      // };
      let playerIDturn;
      for (let i = 0; i < users[socket.roomName].length; i++) {
        if (players[turn] == users[socket.roomName][i].name) {
          playerIDturn = users[socket.roomName][i].playerID;
          console.log("turn data7", playerIDturn);
        }
      }
      let turnData = {
        name: players[turn],
        playerID: playerIDturn,
      };
      io.to(socket.roomName).emit("playerTurn", turnData);
    }
    let playerIDturn;
    for (let i = 0; i < users[socket.roomName].length; i++) {
      if (socket.name == users[socket.roomName][i].name) {
        playerIDturn = users[socket.roomName][i].playerID;
        console.log("turn data8", playerIDturn);
      }
    }
    let player = {
      player: socket.name,
      result: playerStatus,
      tooth: data.guess,
      playerID: playerIDturn,
    };
    socket.emit("yourToothResult", player);
    socket.to(socket.roomName).emit("playerToothResult", player);
  });

  socket.on("numberGuessed", (data) => {
    socket.roomName = data.room;
    console.log(mysteryNum);
    console.log(data);
    console.log("WHY ISNT THIS RECEIVING WHAT");
    if (data.guess < mysteryNum) {
      console.log("Guess higher!!");
      socket.emit("higher");
    } else if (data.guess > mysteryNum) {
      socket.emit("lower");
      console.log("Guess Lower!!");
    } else if (data.guess == mysteryNum) {
      let guessedPlayer = {
        name: socket.name,
      };

      console.log("NAME OF GUESSED PLAYER", socket.name);
      if (socket.name == "Orange Mokoko") {
        orangeGuess = true;
      }
      if (socket.name == "Pink Mokoko") {
        pinkGuess = true;
      }
      if (socket.name == "Purple Mokoko") {
        purpleGuess = true;
      }
      if (socket.name == "Green Mokoko") {
        greenGuess = true;
      }

      console.log("orange guess" + orangeGuess);
      console.log("pink guess" + pinkGuess);
      console.log("purple guess" + purpleGuess);
      console.log("green guess" + greenGuess);

      console.log("CORRECT WOOO");

      //green is last
      if (
        orangeGuess == true &&
        pinkGuess == true &&
        purpleGuess == true &&
        greenGuess == false
      ) {
        console.log("GREEN IS LAST");
        io.to(socket.roomName).emit("greenislast");
        socket.emit("greenislast");
        purpleGuess = false;
        pinkGuess = false;
        greenGuess = false;
        orangeGuess = false;
      }

      //purple is last
      else if (
        orangeGuess == true &&
        pinkGuess == true &&
        greenGuess == true &&
        purpleGuess == false
      ) {
        console.log("PURPLE IS LAST");
        io.to(socket.roomName).emit("purpleislast");
        socket.emit("purpleislast");
        purpleGuess = false;
        pinkGuess = false;
        greenGuess = false;
        orangeGuess = false;
      }

      //orange is last
      else if (
        purpleGuess == true &&
        pinkGuess == true &&
        greenGuess == true &&
        orangeGuess == false
      ) {
        console.log("ORANGE IS LAST");
        io.to(socket.roomName).emit("orangeislast");
        socket.emit("orangeislast");
        purpleGuess = false;
        pinkGuess = false;
        greenGuess = false;
        orangeGuess = false;
      }

      //pink is last
      else if (
        orangeGuess == true &&
        purpleGuess == true &&
        greenGuess == true &&
        pinkGuess == false
      ) {
        console.log("PINK IS LAST");
        io.to(socket.roomName).emit("pinkislast");
        socket.emit("pinkislast");
        purpleGuess = false;
        pinkGuess = false;
        greenGuess = false;
        orangeGuess = false;
      } else {
        socket.emit("correctnumber");
      }

      io.to(socket.roomName).emit("userGuessedIt", guessedPlayer);
    }
  });

  socket.on("gameOver4", () => {
    console.log("LEVEL FOUR ENDED");
    // io.to(socket.roomName).emit("levelFourStart");
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
