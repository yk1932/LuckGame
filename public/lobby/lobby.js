const app = {
  initialize: () => {
    // const randomRoom = app.generateCode();
    //just manually set a room
    const randomRoom = "ABEEEG";
    console.log(randomRoom);
    randomName = app.generateName();
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

    let socket = io();
    socket.on("connect", () => {
      console.log("connected to server");
      let data = {
        name: randomName,
        room: randomRoom,
      };
      socket.emit("userData", data);
    });

    //loading players in lobby
    socket.on("loadPlayers", (data) => {
      while (playersContainer.firstChild) {
        playersContainer.removeChild(playersContainer.lastChild);
      }
      console.log(data);
      console.log(data[0].name);
      for (let i = 0; i < data.length; i++) {
        let newDiv = document.createElement("div");
        console.log("in this loop", randomName, data[i].name);
        if (randomName == data[i].name) {
          newDiv.innerHTML = `★ ${data[i].name}`;
        } else {
          newDiv.innerHTML = `   ${data[i].name}`;
        }
        newDiv.classList.add("player_container");
        playersContainer.appendChild(newDiv);

        console.log(data[i]);
      }
    });
    socket.on("err", () => {
      alert("The room is full");
      window.location = "../";
    });
    //moving to game page
    socket.on("gameStart", () => {
      console.log("game starting");
      sessionStorage.setItem("name", randomName);
      sessionStorage.setItem("room", randomRoom);

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
};
