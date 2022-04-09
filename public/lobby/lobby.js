const app = {
  initialize: () => {
    // const randomRoom = app.generateCode();
    const randomRoom = "123";
    console.log(randomRoom);
    randomName = app.generateName();
    console.log(randomName);

    const codeText = document.getElementById("code_text");
    codeText.innerHTML = `Room ID: ${randomRoom}`;
    codeText.style.color = "white";
    const playersContainer = document.getElementById("players_container");

    const playButton = document.getElementById("play_button");
    playButton.addEventListener("click", () => {
      console.log("play clicked");
      window.location = "../game";
    });

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
    socket.on("loadPlayers", (data) => {
      while (playersContainer.firstChild) {
        playersContainer.removeChild(playersContainer.lastChild);
      }
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        let newDiv = document.createElement("div");
        newDiv.innerHTML = data[i];
        newDiv.classList.add("player_container");
        playersContainer.appendChild(newDiv);

        console.log(data[i]);
      }
    });
    // socket.on("userTyping", () => {
    //   console.log("user is typing");
    // });
    // socket.on("pastMessages", (data) => {
    //   console.log(data.oldMessages);
    //   if (data.oldMessages.length > 0) {
    //     let chatWindow = document.getElementById("chat-box-msgs");
    //     for (let i = 0; i < data.oldMessages.length; i++) {
    //       console.log(data.oldMessages[i].name, data.oldMessages[i].msg);
    //       let chatMessage = document.createElement("p");
    //       chatMessage.innerHTML =
    //         data.oldMessages[i].name + " : " + data.oldMessages[i].msg;
    //       chatWindow.appendChild(chatMessage);
    //     }
    //   }
    // });
    // socket.on("chatMessage", (data) => {
    //   let chatWindow = document.getElementById("chat-box-msgs");
    //   let chatMessage = document.createElement("p");
    //   chatMessage.innerHTML = data.name + " : " + data.msg;
    //   chatWindow.appendChild(chatMessage);
    // });
    // console.log("load");
    // const submitButton = document.getElementById("send-button");
    // const chatForm = document.getElementById("chat-form");

    // chatForm.addEventListener("submit", (e) => {
    //   e.preventDefault();
    //   // let name = document.getElementById("name-input").value;
    //   let name = sessionStorage.getItem("name");
    //   let msg = document.getElementById("msg-input").value;
    //   console.log(name, msg);

    //   //emit info to server
    //   chatObject = {
    //     name: name,
    //     msg: msg,
    //   };

    //   socket.emit("chatMessage", chatObject);
    // });

    // let messageInput = document.getElementById("msg-input");
    // messageInput.addEventListener("keypress", () => {
    //   socket.emit("userTyping");
    // });
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
  capFirst: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  getRandomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
  },
  generateName: () => {
    let nameArray = [
      "Bonkasaurus Rex",
      "Meowser",
      "Angy Cat",
      "Slowpoke",
      "Little Timmy",
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
