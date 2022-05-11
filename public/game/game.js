const app = {
  randomNum: 0,
  gameLength: document.querySelectorAll(".door").length,
  gameContainer: document.querySelector(".game_container"),
  aliveDiv: document.querySelector(".aliveDiv"),
  turnContainer: document.querySelector(".turnContainer"),
  playerImg: document.querySelector(".playerImg"),
  turnText: document.getElementById("turnText"),
  returnButton: document.querySelector(".return_button"),
  mokokoName: ["Orange Mokoko", "Pink Mokoko", "Green Mokoko", "Purple Mokoko"],
  mokokoImageSrc: [
    "../images/orangeMokoko.png",
    "../images/pinkMokoko.png",
    "../images/greenMokoko.png",
    "../images/purpleMokoko.png",
  ],
  sadMokokoImageSrc: [
    "../images/sadOrangeMokoko.png",
    "../images/sadPinkMokoko.png",
    "../images/sadGreenMokoko.png",
    "../images/sadPurpleMokoko.png",
  ],
  happyMokokoImageSrc: [
    "../images/happyOrangeMokoko.png",
    "../images/happyPinkMokoko.png",
    "../images/happyGreenMokoko.png",
    "../images/happyPurpleMokoko.png",
  ],
  deadMokokoImageSrc: [
    "../images/orangeDied.png",
    "../images/pinkDied.png",
    "../images/greenDied.png",
    "../images/purpleDied.png",
  ],
  tabName: document.getElementById("tabname"),
  tabIcon: document.getElementById("tabicon"),
  initialize: () => {
    // Play Background Music
    document.getElementById("backgroundMusic").play();

    app.returnButton.addEventListener("click", () => {
      window.location = "../";
    });

    // Change the inner tab based on the name of the Mokoko
    app.tabName.innerText = sessionStorage.getItem("name");
    if (app.tabName.innerText == "Orange Mokoko") {
      app.tabIcon.href = "../images/orangeMokoko.png";
    } else if (app.tabName.innerText == "Pink Mokoko") {
      app.tabIcon.href = "../images/pinkMokoko.png";
    } else if (app.tabName.innerText == "Green Mokoko") {
      app.tabIcon.href = "../images/greenMokoko.png";
    } else if (app.tabName.innerText == "Purple Mokoko") {
      app.tabIcon.href = "../images/purpleMokoko.png";
    }

    console.log(sessionStorage.getItem("name"));
    console.log(sessionStorage.getItem("room"));
    let socket = io();
    socket.on("connect", () => {
      console.log("connected to server");
      //sending user data
      let data = {
        name: sessionStorage.getItem("name"),
        room: sessionStorage.getItem("room"),
        playerID: sessionStorage.getItem("playerID"),
      };
      socket.emit("gameInitialize", data);
    });

    socket.on("levelOneStart", () => {
      // Display Level One
      app.turnHeader.classList.remove("none");
      document.getElementById("dark_layer").classList.remove("none");
      app.turnHeader.innerHTML = "Level One <br> (Practice Round)";

      // Add mystery card container
      app.gameContainer.classList.remove("pointerNone");

      document.getElementById("mysterycard_container").classList.remove("none");
      document
        .getElementById("mysterycard_container")
        .classList.remove("pointerNone");

      setTimeout(() => {
        app.turnHeader.innerText = "Guess the Mystery Number";
      }, 3000);

      setTimeout(() => {
        document.getElementById("dark_layer").classList.add("none");
        app.turnHeader.classList.add("none");
        document.getElementById("card").src = "../images/takeyourguess.png";
        document.getElementById("submitNumber").classList.remove("none");

        document.getElementById("leaderboard").classList.remove("none");

        document.getElementById("submitNumber").classList.remove("pointerNone");
        document
          .getElementById("submit_number")
          .addEventListener("click", (e) => {
            document.getElementById("clickSound").play();
            answer = document.getElementById("insert_number").value;

            console.log(answer);
            data = {
              room: sessionStorage.getItem("room"),
              name: sessionStorage.getItem("name"),
              guess: answer,
            };
            socket.emit("numberGuessed", data);
            console.log("answer sent", data);
          });
      }, 6000);
    });

    let clueHeader = document.getElementById("clue_header");
    socket.on("higher", () => {
      clueHeader.classList.remove("none");
      clueHeader.style.color = "orange";
      clueHeader.innerText = "Higher";
      setTimeout(() => {
        clueHeader.classList.add("none");
      }, 1000);
    });

    socket.on("lower", () => {
      clueHeader.classList.remove("none");
      clueHeader.style.color = "gray";
      clueHeader.innerText = "Lower";
      setTimeout(() => {
        clueHeader.classList.add("none");
      }, 1000);
    });

    socket.on("correctnumber", () => {
      document.getElementById("correctSound").play();
      document.getElementById("card").src = "../images/correctCard.png";
      document.getElementById("submitNumber").classList.add("none");
      document.getElementById("submitNumber").classList.add("pointerNone");
    });

    let guesseditheader = document.getElementById("guessedit");

    socket.on("userGuessedIt", (data) => {
      document.getElementById("correctSound").play();
      guesseditheader.classList.remove("none");
      guesseditheader.innerText = data.name + " guessed it";

      if (data.name == "Pink Mokoko") {
        document.getElementById("player2Img").src = "../images/pinkMokoko.png";
      } else if (data.name == "Orange Mokoko") {
        document.getElementById("player1Img").src =
          "../images/orangeMokoko.png";
      } else if (data.name == "Green Mokoko") {
        document.getElementById("player3Img").src = "../images/greenMokoko.png";
      } else if (data.name == "Purple Mokoko") {
        document.getElementById("player4Img").src =
          "../images/purpleMokoko.png";
      }
      setTimeout(() => {
        guesseditheader.classList.add("none");
      }, 2000);
    });

    socket.on("greenislast", () => {
      app.gameContainer.classList.add("pointerNone");
      setTimeout(() => {
        document.getElementById("card").classList.add("none");
        document.getElementById("submitNumber").classList.add("none");
        document.getElementById("submitNumber").classList.add("pointerNone");
      }, 1000);
      setTimeout(() => {
        document.getElementById("card").src = "../images/greenDied.png";
        document.getElementById("lostSound").play();
        document.getElementById("card").classList.remove("none");
      }, 2000);
      setTimeout(() => {
        let data = {
          name: sessionStorage.getItem("name"),
          room: sessionStorage.getItem("room"),
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("levelOneEnd", data);
      }, 5000);
    });

    socket.on("purpleislast", () => {
      app.gameContainer.classList.add("pointerNone");
      setTimeout(() => {
        document.getElementById("card").classList.add("none");
        document.getElementById("submitNumber").classList.add("none");
        document.getElementById("submitNumber").classList.add("pointerNone");
      }, 1000);
      setTimeout(() => {
        document.getElementById("card").src = "../images/purpleDied.png";
        document.getElementById("lostSound").play();
        document.getElementById("card").classList.remove("none");
      }, 2000);
      setTimeout(() => {
        let data = {
          name: sessionStorage.getItem("name"),
          room: sessionStorage.getItem("room"),
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("levelOneEnd", data);
      }, 5000);
    });

    socket.on("orangeislast", () => {
      app.gameContainer.classList.add("pointerNone");
      setTimeout(() => {
        document.getElementById("card").classList.add("none");
        document.getElementById("submitNumber").classList.add("none");
        document.getElementById("submitNumber").classList.add("pointerNone");
      }, 1000);
      setTimeout(() => {
        document.getElementById("card").src = "../images/orangeDied.png";
        document.getElementById("card").classList.remove("none");
        document.getElementById("lostSound").play();
      }, 2000);
      setTimeout(() => {
        let data = {
          name: sessionStorage.getItem("name"),
          room: sessionStorage.getItem("room"),
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("levelOneEnd", data);
      }, 5000);
    });

    socket.on("pinkislast", () => {
      app.gameContainer.classList.add("pointerNone");
      setTimeout(() => {
        document.getElementById("card").classList.add("none");
        document.getElementById("submitNumber").classList.add("none");
        document.getElementById("submitNumber").classList.add("pointerNone");
      }, 1000);
      setTimeout(() => {
        document.getElementById("card").src = "../images/pinkDied.png";
        document.getElementById("card").classList.remove("none");
        document.getElementById("lostSound").play();
      }, 2000);
      setTimeout(() => {
        let data = {
          name: sessionStorage.getItem("name"),
          room: sessionStorage.getItem("room"),
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("levelOneEnd", data);
      }, 5000);
    });

    //initializing the doors and adding event listeners
    let doors = document.querySelectorAll(".door");
    for (let i = 0; i < doors.length; i++) {
      doors[i].addEventListener("click", (e) => {
        answer = doors[i].dataset.num;
        console.log(answer);
        app.gameContainer.classList.add("pointerNone");
        data = {
          room: sessionStorage.getItem("room"),
          playerID: sessionStorage.getItem("playerID"),
          guess: answer,
        };
        socket.emit("doorGuess", data);
      });
    }

    // LEVEL TWO: DOORS

    socket.on("playerTurn", (data) => {
      console.log("look at data!", data);
      //receiving data for turns
      setTimeout(() => {
        app.aliveDiv.classList.remove("none");
        app.turnContainer.classList.remove("none");
        app.playerImg.src = app.mokokoImageSrc[parseInt(data.playerID)];
        app.turnText.innerHTML = `${data.name}'s Turn`;
      }, 3000);

      if (data.name == sessionStorage.getItem("name")) {
        setTimeout(() => {
          app.turnContainer.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
          app.turnHeader.classList.remove("none");
          app.turnHeader.innerText = "Your turn!";
          app.gameContainer.classList.remove("pointerNone");

          document
            .getElementById("chalice_container")
            .classList.remove("pointerNone");
          document.getElementById("crocodile").classList.remove("pointerNone");
        }, 3000);
        console.log("my turn");
      } else {
        setTimeout(() => {
          app.turnContainer.style.backgroundColor = "rgba(244, 244, 244, 0.3)";
          app.turnHeader.classList.remove("none");
          app.turnHeader.innerText = `${data.name}'s turn!`;
          app.gameContainer.classList.add("pointerNone");
          document
            .getElementById("chalice_container")
            .classList.add("pointerNone");
          document.getElementById("crocodile").classList.add("pointerNone");
        }, 3000);
      }
    });

    socket.on("levelTwoStart", (data) => {
      // REMOVE LVL ONE ELEMENTS
      document.getElementById("mysterycard_container").classList.add("none");
      document
        .getElementById("mysterycard_container")
        .classList.add("pointerNone");
      document.getElementById("leaderboard").classList.add("none");
      document.getElementById("leaderboard").classList.add("pointerNone");
      app.turnHeader.classList.remove("none");
      app.turnHeader.innerText = "Level Two";
      document.getElementById("door_container").classList.remove("none");
      document.body.style.backgroundColor = "#7c4068";
      document.getElementById("lobby_wall").src = "../images/lobbyWall.png";

      setTimeout(() => {
        app.turnHeader.innerText = "Pick the door without the bomb";
        socket.emit("beginLevelTwo");
      }, 1500);
    });

    socket.on("yourResult", (data) => {
      console.log(data);
      //showcasing the result for the user on his/her
      let door = document.getElementById(`door${data.door}`);
      door.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      console.log("FLJSIOJDOIFJSIOD", door);
      if (data.result) {
        console.log("you lived");
        document.getElementById("correctSound").play();
        app.resultHeader.innerText = "You lived";
        app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
        door.src = "../images/emptyDoor.png";
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      } else {
        console.log("you died");
        app.resultHeader.innerText = `You died`;
        document.getElementById("bombSound").play();
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        document.getElementById(tempText).classList.add("none");

        app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
        door.src = "../images/deadDoor.png";
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
      // app.resultHeader.classList.remove("none");
    });

    //for evreyone else, show the result
    socket.on("playerResult", (data) => {
      console.log(data);
      let door = document.getElementById(`door${data.door}`);
      door.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      if (data.result) {
        console.log("PLAYER LIVED");
        app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
        app.resultHeader.innerText = `${data.player} lived`;
        door.src = "../images/emptyDoor.png";
        document.getElementById("correctSound").play();
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      } else {
        console.log("you died");
        document.getElementById("bombSound").play();
        app.resultHeader.innerText = `${data.player} died`;
        door.src = "../images/deadDoor.png";
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        document.getElementById(tempText).classList.add("none");

        app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
    });

    //GAME over for game 2
    socket.on("gameOver", (data) => {
      //Remove all doors after 1 second of ending game
      app.gameContainer.classList.add("pointerNone");
      let playerID = data.playerID;

      setTimeout(() => {
        //Remove doors
        let doors = document.querySelectorAll(".door");
        for (let i = 0; i < doors.length; i++) {
          doors[i].classList.add("none");
        }
        app.turnHeader.innerText = "Level Two Ended";
        app.resultHeader.classList.add("none");
        app.aliveDiv.classList.add("none");
        app.turnContainer.classList.add("none");
      }, 2000);
      setTimeout(() => {
        document.getElementById("big").classList.add("none");
        app.turnHeader.classList.add("none");
        console.log("this it it!!!!!");
        document.getElementById("lostSound").play();

        document.getElementById("big").src =
          app.deadMokokoImageSrc[parseInt(playerID)];
        document.getElementById("big").classList.remove("none");
      }, 3000);

      setTimeout(() => {
        // Remove turn header
        document.getElementById("big").classList.add("none");
        socket.emit("levelTwo");
      }, 5000);
    });

    //reset door functiin where 3/4 doors are open so the 4th guy doesn't just die
    socket.on("resetDoor", () => {
      console.log("resetting door!");
      app.resetHeader.classList.remove("none");
      app.resetHeader.innerText = "Randomizing doors";
      setTimeout(() => {
        app.resetHeader.classList.add("none");
        for (let i = 0; i < doors.length; i++) {
          doors[i].src = "../images/door.png";
          doors[i].classList.remove("pointerNone");
        }
      }, 2000);
    });

    socket.on("levelThreeStart", () => {
      // game intro
      setTimeout(() => {
        let lobbyWall = document.getElementById("lobby_wall");
        document.body.style.backgroundColor = "#0F280D";
        lobbyWall.src = "../images/lobbyWall2.png";
        app.turnHeader.classList.remove("none");
        app.turnHeader.innerText = "Level Three";
        let chaliceContainer = document.getElementById("chalice_container");
        chaliceContainer.classList.remove("none");
        let chaliceTable = document.getElementById("chaliceTable");
        chaliceTable.classList.remove("none");
      }, 2000);

      setTimeout(() => {
        app.turnHeader.innerText = "Poison Chalice";
      }, 3000);

      setTimeout(() => {
        app.turnHeader.innerText = "Avoid the poison!!!";
        socket.emit("beginLevelTwo");
      }, 4500);

      setTimeout(() => {
        app.turnHeader.classList.add("none");
      }, 5500);
    });
    //same as above for game 2
    socket.on("yourChaliceResult", (data) => {
      console.log("iN MY CHALICE CHALICE", data);
      let chalice = document.getElementById(`chalice${data.chalice}`);
      console.log("data.chalcie", data.chalice);
      chalice.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      console.log("FLJSIOJDOIFJSIOD", chalice);
      if (data.result) {
        app.resultHeader.classList.add("none");
        console.log("you lived");
        chalice.classList.add("chalice_animation");
        anime({
          targets: ".chalice_animation",
          translateY: -50,
          duration: 1000,
          easing: "easeInOutSine",
        });
        setTimeout(() => {
          document.getElementById("drinkChaliceSound").play();
          app.resultHeader.classList.remove("none");
          chalice.src = "../images/emptyCup.png";
          app.resultHeader.innerText = "You lived";
          app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
        }, 1100);

        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);

        // console.log("you lived");
        // app.resultHeader.innerText = "You lived";
        // chalice.src = "../images/emptyCup.png";
        // app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
        // setTimeout(() => {
        //   app.resultHeader.classList.add("none");
        // }, 2000);
      } else {
        app.resultHeader.innerText = `You died`;
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        app.resultHeader.classList.add("none");

        chalice.classList.add("chalice_animation");
        anime({
          targets: ".chalice_animation",
          translateY: -50,
          duration: 1000,
          easing: "easeInOutSine",
        });
        setTimeout(() => {
          chalice.src = "../images/poisonCup.png";
          app.resultHeader.innerText = "You died";
          app.resultHeader.classList.remove("none");
          app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
          document.getElementById(tempText).classList.add("none");
          document.getElementById("drinkPoisonSound").play();
        }, 1100);

        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
    });
    socket.on("playerChaliceResult", (data) => {
      console.log("iN PLAYER CHALICE", data);
      let chalice = document.getElementById(`chalice${data.chalice}`);
      chalice.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      if (data.result) {
        app.resultHeader.classList.add("none");
        chalice.classList.add("chalice_animation");
        anime({
          targets: ".chalice_animation",
          translateY: -50,
          duration: 1000,
          easing: "easeInOutSine",
        });
        setTimeout(() => {
          app.resultHeader.classList.remove("none");
          chalice.src = "../images/emptyCup.png";
          app.resultHeader.innerText = `${data.player} lived`;
          app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
          document.getElementById("drinkChaliceSound").play();
        }, 1100);
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      } else {
        app.resultHeader.classList.add("none");
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        document.getElementById(tempText).classList.add("none");
        chalice.classList.add("chalice_animation");
        anime({
          targets: ".chalice_animation",
          translateY: -50,
          duration: 1000,
          easing: "easeInOutSine",
        });
        setTimeout(() => {
          app.resultHeader.classList.remove("none");
          app.resultHeader.innerText = `${data.player} died`;
          chalice.src = "../images/poisonCup.png";
          app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
          document.getElementById("drinkPoisonSound").play();
        }, 1100);

        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
      // app.resultHeader.classList.remove("none");
    });
    socket.on("gameOver2", (data) => {
      let playerID = data.playerID;
      //Remove all doors after 1 second of ending game
      document.getElementById("crocodile").classList.add("pointerNone");
      document.getElementById("chalice_container").classList.add("pointerNone");
      setTimeout(() => {
        //Remove doors
        let chalices = document.querySelectorAll(".chalice");
        for (let i = 0; i < chalices.length; i++) {
          chalices[i].classList.add("none");
        }
        document.getElementById("chaliceTable").classList.add("none");
        app.aliveDiv.classList.add("none");
        app.turnContainer.classList.add("none");
        app.turnHeader.innerText = "Level Three Ended";
        app.resultHeader.classList.add("none");
      }, 2000);
      setTimeout(() => {
        document.getElementById("big").classList.add("none");
        app.turnHeader.classList.add("none");
        console.log("this it it!!!!!");
        document.getElementById("lostSound").play();
        document.getElementById("big").src =
          app.deadMokokoImageSrc[parseInt(playerID)];
        document.getElementById("big").classList.remove("none");
      }, 3000);

      setTimeout(() => {
        // Remove turn header
        document.getElementById("big").classList.add("none");
        socket.emit("levelFour");
      }, 4000);
    });
    socket.on("levelFourStart", () => {
      // game intro
      setTimeout(() => {
        //REMOVE ITEMS FROM LEVEL TWO HERE
        let chaliceContainer = document.getElementById("chalice_container");
        document.getElementById("chaliceTable").classList.add("none");
        chaliceContainer.classList.add("none");
        //ADD ITEMS FOR LEVEL THREE HERE
        let crocodile = document.getElementById("crocodile");
        crocodile.classList.remove("none");
        let crocodileTable = document.getElementById("crocodileTable");
        crocodileTable.classList.remove("none");
        let lobbyWall = document.getElementById("lobby_wall");
        document.body.style.backgroundColor = "#34214D";
        lobbyWall.src = "../images/lobbyWall3.png";
        app.turnHeader.innerText = "Level Four";
        app.turnHeader.classList.remove("none");
      }, 2000);

      setTimeout(() => {
        app.turnHeader.innerText = "Clean the crocodile's teeth";
      }, 3000);

      setTimeout(() => {
        app.turnHeader.innerText = "(without angering it!)";
        socket.emit("beginLevelFour");
      }, 4500);

      setTimeout(() => {
        app.turnHeader.classList.add("none");
      }, 5500);

      //Making teeth interactable
    });
    socket.on("yourToothResult", (data) => {
      let tooth = document.getElementById(`tooth${data.tooth}`);
      tooth.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      if (data.result) {
        app.resultHeader.innerText = "You lived";
        document.getElementById("correctSound").play();
        app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
        tooth.style.fill = "#D3D2D2";
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      } else {
        app.resultHeader.innerText = `You died`;
        document.getElementById("crocodileSnapSound").play();
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        document.getElementById(tempText).classList.add("none");

        app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
        let crocodileClosed = document.getElementById("crocodileClosed");
        crocodile.classList.add("none");
        crocodileClosed.classList.remove("none");
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
      // app.resultHeader.classList.remove("none");
    });
    socket.on("playerToothResult", (data) => {
      console.log("iN PLAYER tooooth", data);
      let tooth = document.getElementById(`tooth${data.tooth}`);
      app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
      tooth.classList.add("pointerNone");
      app.resultHeader.classList.remove("none");
      if (data.result) {
        console.log("PLAYER LIVED");
        document.getElementById("correctSound").play();
        app.resultHeader.innerText = `${data.player} lived`;
        tooth.style.fill = "#D3D2D2";
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      } else {
        console.log("you died");
        document.getElementById("crocodileSnapSound").play();
        app.resultHeader.innerText = `${data.player} died`;
        let tempText = "player" + String(parseInt(data.playerID) + 1);
        console.log("temp", tempText);
        document.getElementById(tempText).classList.add("none");

        app.playerImg.src = app.sadMokokoImageSrc[parseInt(data.playerID)];
        let crocodileClosed = document.getElementById("crocodileClosed");
        document.getElementById("crocodile").classList.add("none");
        crocodileClosed.classList.remove("none");
        setTimeout(() => {
          app.resultHeader.classList.add("none");
        }, 2000);
      }
      app.textDiv.classList.remove("none");
      // app.resultHeader.classList.remove("none");
    });

    socket.on("gameOver3", (data) => {
      setTimeout(() => {
        //Remove doors
        let playerID = data.playerIDturn;
        let crocodile = document.getElementById("crocodileClosed");
        crocodile.classList.add("none");
        let crocodileTable = document.getElementById("crocodileTable");
        crocodileTable.classList.add("none");
        app.turnHeader.innerText = `${data.name} won!!!`;
        app.resultHeader.classList.add("none");
        app.returnButton.classList.remove("none");
        app.aliveDiv.classList.add("none");
        app.turnContainer.classList.add("none");
        document.getElementById("big").classList.add("none");
        console.log("this it it!!!!!");
        document.getElementById("lostSound").play();

        document.getElementById("big").src =
          app.happyMokokoImageSrc[parseInt(playerID)];
        document.getElementById("big").classList.remove("none");
      }, 1000);
    });

    let teeth = document.querySelectorAll(".tooth");

    for (let i = 0; i < teeth.length; i++) {
      teeth[i].addEventListener("click", (e) => {
        app.gameContainer.classList.add("pointerNone");
        teeth[i].style.fill = "#D3D2D2";
        answer = teeth[i].dataset.num;
        console.log(answer);
        data = {
          room: sessionStorage.getItem("room"),
          guess: answer,
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("teethGuess", data);
      });
    }

    let chalices = document.querySelectorAll(".chalice");
    for (let i = 0; i < chalices.length; i++) {
      chalices[i].addEventListener("click", (e) => {
        app.gameContainer.classList.add("pointerNone");
        answer = chalices[i].dataset.num;
        console.log(answer);
        // app.levelTwo();
        data = {
          room: sessionStorage.getItem("room"),
          guess: answer,
          playerID: sessionStorage.getItem("playerID"),
        };
        socket.emit("chaliceGuess", data);
      });
    }
  },

  textDiv: document.querySelector(".text_div"),
  statusHeader: document.querySelector(".status_header"),
  resultHeader: document.querySelector(".result_header"),
  turnHeader: document.querySelector(".turn_header"),
  resetHeader: document.querySelector(".reset_header"),
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
