mokokoName = ["Orange Mokoko", "Pink Mokoko", "Green Mokoko", "Purple Mokoko"];
mokokoImageSrc = [
  "../images/orangeMokoko.png",
  "../images/pinkMokoko.png",
  "../images/greenMokoko.png",
  "../images/purpleMokoko.png",
];
const app = {
  initialize: () => {
    // const randomRoom = app.generateCode();
    //just manually set a room
    if (!sessionStorage.getItem("room")) {
      randomRoom = "ABEEEG";
    } else {
      randomRoom = sessionStorage.getItem("room");
    }
    let randomName;
    let playerID;
    let socket = io();
    socket.on("connect", () => {
      let roomData = {
        room: randomRoom,
      };
      socket.emit("checkPlayerCount", roomData);
      console.log("just sent!!!");
      console.log("connected to server");
      socket.on("yourPlayerNum", (data) => {
        console.log("THE NEW DATA", data);
        console.log("data num", data.playerNum);
        randomName = mokokoName[parseInt(data.playerNum)];
        playerID = data.playerNum;
        let roomData = {
          name: randomName,
          room: randomRoom,
          playerID: data.playerNum,
        };
        socket.emit("userData", roomData);
      });
    });

    console.log(randomRoom);

    console.log(randomName);

    const codeText = document.getElementById("code_text");
    codeText.innerHTML = `Room ID: ${randomRoom}`;
    codeText.style.color = "white";
    const playersContainer = document.getElementById("players_container");

    

    //sending signal when play button is pressed
    const playButton = document.getElementById("play_button");
    playButton.addEventListener("click", () => {
      let data = {
        room: randomRoom,
      };
      console.log("play clicked");
      socket.emit("startPressed", data);
    });
    //go back to start page
    const backButton = document.getElementById("back_button");
    backButton.addEventListener("click", () => {
      console.log("back clicked");
      window.location = "/";
      console.log("window.location");
    });

    //loading players in lobby
    socket.on("loadPlayers", (data) => {
      // while (playersContainer.firstChild) {
      //   playersContainer.removeChild(playersContainer.lastChild);
      // }
      console.log(data);
      console.log(data[0].name);
      for (let i = 0; i < data.length; i++) {
        let tempHeader = "player" + String(i + 1) + "Header";
        let tempImg = "player" + String(i + 1);
        let tempStar = "player" + String(i + 1) + "star";
        console.log("TEMP HEADER", tempHeader);
        // let playerHeader = document.getElementById(tempHeader);
        let playerHeader = document.getElementById(tempHeader);
        let playerImg = document.getElementById(tempImg);
        let playerStar = document.getElementById(tempStar);
        console.log("the player hegader", playerHeader);
        playerHeader.innerHTML = mokokoName[i];
        playerImg.src = mokokoImageSrc[i];
        // let newContainer = document.createElement("div");
        // let newPlayerHeader = document.createElement("h3");
        // console.log("in this loop", randomName, data[i].name);
        if (randomName == data[i].name) {
          playerStar.classList.remove("none");
        }
        // newContainer.classList.add("player_container");
        // newContainer.appendChild(newPlayerHeader);
        // playersContainer.appendChild(newContainer);

        // console.log(data[i]);
      }
    });
    socket.on("err", () => {
      alert("The room is full");
      window.location = "../";
    });

    socket.on("notenough", () => {
      alert("Not enough people, we need four!");
    });

    //moving to game page
    socket.on("gameStart", () => {
      console.log("game starting");
      sessionStorage.setItem("name", randomName);
      sessionStorage.setItem("room", randomRoom);
      sessionStorage.setItem("playerID", playerID);

      window.location = "../game";
    });
  },
  generateCode: () => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  },

  generateName: () => {
    let nameArray = [
      "Bonkasaurus Rex",
      "Meowser",
      "Angy Cat",
      "Slowpoke",
      "Little Timmy",
      "Hobbin Rood",
      "Psyduck",
      "Snorlax",
      "Meowrio",
      "One Spaghet",
      "Bugs Bunny",
      "Charlie Brown",
      "Snoopy",
      "Daffy Duck",
      "Mickey Mouse",
      "Donald Duck",
      "Popeye",
      "Scooby-Doo",
      "Jerry",
      "Tomv",
      "Garfield",
      "Woody",
      "Buzz Lightyear",
      "Simba",
      "Genie",
      "Mulan",
      "Ursula",
      "Rapunzel",
      "Betty Boop",
      "Amoongus",
      "Squirtle",
      "Pikachu",
      "Gengar",
      "I am hungry...",
      "Chimken Tendies",
      "Chimken Nuggies",
      "Need coffee...",
      "Kierin",
      "Breadth First Search",
      "Depth First Search",
      "Error 404",
      "Luigi",
      "Baby Luigi",
      "Baby Mario",
      "Lucid",
      "#1 backseat gamer",
      "Skiddo",
      "Marshadow",
      "Dragapult",
    ];
    console.log(app.getRandomInt(0, nameArray.length));

    let name = nameArray[app.getRandomInt(0, nameArray.length)];
    return name;

    // var name =
    //   capFirst(name1[getRandomInt(0, name1.length + 1)]) +
    //   " " +
    //   capFirst(name2[getRandomInt(0, name2.length + 1)]);
    // return name;
  },
  getRandomInt: (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  },
};
