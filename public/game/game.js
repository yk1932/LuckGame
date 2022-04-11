const app = {
  randomNum: 0,
  gameLength: document.querySelectorAll(".door").length,
  gameContainer: document.querySelector(".game_container"),
  initialize: () => {
    app.showText();
    console.log(sessionStorage.getItem("name"));
    console.log(sessionStorage.getItem("room"));
    let socket = io();
    socket.on("connect", () => {
      console.log("connected to server");
      let data = {
        name: sessionStorage.getItem("name"),
        room: sessionStorage.getItem("room"),
      };
      socket.emit("gameInitialize", data);
    });

    socket.on("playerTurn", (data) => {
      if (data.name == sessionStorage.getItem("name")) {
        console.log("my turn");

        app.turnHeader.classList.remove("none");
        app.turnHeader.innerText = "Your turn!";
        app.gameContainer.classList.remove("pointerNone");
      } else {
        app.turnHeader.classList.remove("none");
        app.turnHeader.innerText = `${data.name}'s turn!`;
        app.gameContainer.classList.add("pointerNone");
      }
    });

    socket.on("yourResult", (data) => {
      console.log(data);
      let door = document.getElementById(`door${data.door}`);
      door.classList.add("pointerNone");

      console.log("FLJSIOJDOIFJSIOD", door);
      if (data.result) {
        console.log("you lived");
        app.resultHeader.innerText = "You lived";
        door.src = "../images/emptyDoor.png";
      } else {
        console.log("you died");
        app.resultHeader.innerText = `You died`;
        door.src = "../images/deadDoor.png";
      }
      app.textDiv.classList.remove("none");
      app.resultHeader.classList.remove("none");
    });

    socket.on("playerResult", (data) => {
      console.log(data);
      let door = document.getElementById(`door${data.door}`);
      door.classList.add("pointerNone");

      if (data.result) {
        console.log("PLAYER LIVED");
        app.resultHeader.innerText = `${data.player} lived`;
        door.src = "../images/emptyDoor.png";
      } else {
        console.log("you died");
        app.resultHeader.innerText = `${data.player} died`;
        door.src = "../images/deadDoor.png";
      }
      app.textDiv.classList.remove("none");
      app.resultHeader.classList.remove("none");
    });

    socket.on("resetDoor", () => {
      console.log("resetting door!");
      setTimeout(() => {
        for (let i = 0; i < doors.length; i++) {
          doors[i].src = "../images/door.png";
          doors[i].classList.remove("pointerNone");
        }
      }, 2000);
    });

    socket.on("gameEnded", () => {
      console.log("game has ended someone kaboom'd");
    });

    let doors = document.querySelectorAll(".door");
    app.randomize();
    for (let i = 0; i < doors.length; i++) {
      doors[i].addEventListener("click", (e) => {
        answer = doors[i].dataset.num;
        console.log(answer);
        data = {
          room: sessionStorage.getItem("room"),
          guess: answer,
        };
        socket.emit("doorGuess", data);
        // e.currentTarget.styles.pointerEvent = "none";
        // console.log(doors[i].dataset.num);
        // answer = doors[i].dataset.num;
        // if (app.randomNum == answer) {
        //   alert("boom u died");
        // } else {
        //   alert("u didn't die bro");
        // }
        // app.randomize();
      });
    }
  },
  randomize: () => {
    app.randomNum = Math.floor(Math.random() * app.gameLength + 1);
    console.log(app.randomNum);
  },
  textDiv: document.querySelector(".text_div"),
  statusHeader: document.querySelector(".status_header"),
  resultHeader: document.querySelector(".result_header"),
  turnHeader: document.querySelector(".turn_header"),
  showText: () => {
    setTimeout(() => {
      app.textDiv.classList.remove("none");
    }, 1000);

    setTimeout(() => {
      app.textDiv.classList.add("none");
      app.resultHeader.classList.add("none");
      app.resultHeader.innerText = "";
      app.statusHeader.classList.add("none");
    }, 4000);
  },
};
