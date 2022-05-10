const app = {
  randomNum: 0,
  gameLength: document.querySelectorAll(".door").length,
  gameContainer: document.querySelector(".game_container"),
  returnButton: document.querySelector(".return_button"),
  aliveDiv: document.querySelector(".aliveDiv"),
  turnContainer: document.querySelector(".turnContainer"),
  playerImg: document.querySelector(".playerImg"),
  turnText: document.getElementById("turnText"),
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

  tabName: document.getElementById("tabname"),
  tabIcon: document.getElementById("tabicon"),
  initialize: () => {
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
    app.turnHeader.classList.remove("none");
    app.turnHeader.innerText = "Level One";
    app.returnButton.addEventListener("click", () => {
      window.location = "../";
    });

    setTimeout(() => {
      app.turnHeader.innerText = "Pick the door without the skull!!";
    }, 1500);
    //Level One

    setTimeout(() => {
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

      socket.on("playerTurn", (data) => {
        console.log("ahhhhh", data);

        //receiving data for turns
        setTimeout(() => {
          app.aliveDiv.classList.remove("none");
          app.turnContainer.classList.remove("none");
          app.playerImg.src = app.mokokoImageSrc[parseInt(data.playerID)];
          app.turnText.innerHTML = `${data.name}'s Turn`;
        }, 2000);

        if (data.name == sessionStorage.getItem("name")) {
          setTimeout(() => {
            app.turnContainer.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
            app.turnHeader.classList.remove("none");
            app.turnHeader.innerText = "Your turn!";
            app.gameContainer.classList.remove("pointerNone");

            document
              .getElementById("chalice_container")
              .classList.remove("pointerNone");
            document
              .getElementById("crocodile")
              .classList.remove("pointerNone");
          }, 2000);
          console.log("my turn");
        } else {
          setTimeout(() => {
            app.turnContainer.style.backgroundColor =
              "rgba(244, 244, 244, 0.3)";
            app.turnHeader.classList.remove("none");
            app.turnHeader.innerText = `${data.name}'s turn!`;
            app.gameContainer.classList.add("pointerNone");
            document
              .getElementById("chalice_container")
              .classList.add("pointerNone");
            document.getElementById("crocodile").classList.add("pointerNone");
          }, 2000);
        }
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
          app.resultHeader.innerText = "You lived";
          app.playerImg.src = app.happyMokokoImageSrc[parseInt(data.playerID)];
          door.src = "../images/emptyDoor.png";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          console.log("you died");
          app.resultHeader.innerText = `You died`;
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
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          console.log("you died");
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
      //GAME over for game 1
      socket.on("gameOver", () => {
        //Remove all doors after 1 second of ending game
        app.gameContainer.classList.add("pointerNone");

        setTimeout(() => {
          //Remove doors
          let doors = document.querySelectorAll(".door");
          for (let i = 0; i < doors.length; i++) {
            doors[i].classList.add("none");
          }
          app.turnHeader.innerText = "Level One Ended";
          app.resultHeader.classList.add("none");
          app.aliveDiv.classList.add("none");
          app.turnContainer.classList.add("none");
        }, 2000);

        setTimeout(() => {
          // Remove turn header
          socket.emit("levelTwo");
        }, 3500);
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
      //initializing the doors and adding event listeners
      let doors = document.querySelectorAll(".door");
      for (let i = 0; i < doors.length; i++) {
        doors[i].addEventListener("click", (e) => {
          answer = doors[i].dataset.num;
          console.log(answer);
          data = {
            room: sessionStorage.getItem("room"),
            guess: answer,
          };
          socket.emit("doorGuess", data);
        });
      }

      socket.on("levelTwoStart", () => {
        // game intro
        setTimeout(() => {
          let lobbyWall = document.getElementById("lobby_wall");
          document.body.style.backgroundColor = "#0F280D";
          lobbyWall.src = "../images/lobbyWall2.png";
          app.turnHeader.innerText = "Level Two";
          let chaliceContainer = document.getElementById("chalice_container");
          chaliceContainer.classList.remove("none");
          let chaliceTable = document.getElementById("chaliceTable");
          chaliceTable.classList.remove("none");
        }, 2000);

        setTimeout(() => {
          app.turnHeader.innerText = "Poison Chalice";
        }, 3500);

        setTimeout(() => {
          app.turnHeader.innerText = "Avoid the poison!!!";
        }, 5000);

        setTimeout(() => {
          app.turnHeader.classList.add("none");
          socket.emit("beginLevelTwo");
        }, 6000);
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
          console.log("you lived");
          app.resultHeader.innerText = "You lived";
          chalice.src = "../images/emptyCup.png";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          console.log("you died");
          app.resultHeader.innerText = `You died`;

          chalice.src = "../images/poisonCup.png";
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
          app.resultHeader.innerText = `${data.player} lived`;
          chalice.src = "../images/emptyCup.png";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          app.resultHeader.innerText = `${data.player} died`;
          chalice.src = "../images/poisonCup.png";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        }
        app.textDiv.classList.remove("none");
        // app.resultHeader.classList.remove("none");
      });
      socket.on("gameOver2", () => {
        //Remove all doors after 1 second of ending game
        document.getElementById("crocodile").classList.add("pointerNone");
        document
          .getElementById("chalice_container")
          .classList.add("pointerNone");
        setTimeout(() => {
          //Remove doors
          let chalices = document.querySelectorAll(".door");
          for (let i = 0; i < chalices.length; i++) {
            chalices[i].classList.add("none");
          }
          app.turnHeader.innerText = "Level Two Ended";
          app.resultHeader.classList.add("none");
        }, 2000);

        setTimeout(() => {
          // Remove turn header
          socket.emit("levelThree");
        }, 3500);
      });
      socket.on("levelThreeStart", () => {
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
          app.turnHeader.innerText = "Level Three";
        }, 2000);

        setTimeout(() => {
          app.turnHeader.innerText = "Clean the crocodile's teeth";
        }, 3500);

        setTimeout(() => {
          app.turnHeader.innerText = "(without angering it!)";
        }, 5000);

        setTimeout(() => {
          app.turnHeader.classList.add("none");
          socket.emit("beginLevelThree");
        }, 6000);

        //Making teeth interactable
      });
      socket.on("yourToothResult", (data) => {
        let tooth = document.getElementById(`tooth${data.tooth}`);
        tooth.classList.add("pointerNone");
        app.resultHeader.classList.remove("none");
        if (data.result) {
          app.resultHeader.innerText = "You lived";
          tooth.style.fill = "#D3D2D2";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          app.resultHeader.innerText = `You died`;

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
        tooth.classList.add("pointerNone");
        app.resultHeader.classList.remove("none");
        if (data.result) {
          console.log("PLAYER LIVED");

          app.resultHeader.innerText = `${data.player} lived`;
          tooth.style.fill = "#D3D2D2";
          setTimeout(() => {
            app.resultHeader.classList.add("none");
          }, 2000);
        } else {
          console.log("you died");
          app.resultHeader.innerText = `${data.player} died`;
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

      // May7 addition

      // socket.on("gameOver4", (data) => {
      //   setTimeout(() => {
      //     app.turnHeader.innerText = `${data.name} won!!!`;
      //     app.resultHeader.classList.add("none");
      //     app.returnButton.classList.remove("none");
      //   }, 1000);
      // });

      socket.on("gameOver3", (data) => {
        setTimeout(() => {
          app.turnHeader.innerText = `${data.name} won!!!`;
          app.resultHeader.classList.add("none");
          // app.returnButton.classList.remove("none");
        }, 1000);

        setTimeout(() => {
          //Remove  ui and text
          // text
          app.turnHeader.innerText = `${data.name} won!!!`;
        }, 2000);

        setTimeout(() => {
          app.turnHeader.classList.add("none");
          socket.emit("levelFour");
        }, 3500);
      });

      socket.on("levelFourStart", () => {
        setTimeout(() => {
          app.turnHeader.classList.remove("none");
          document.getElementById("dark_layer").classList.remove("none");
          app.turnHeader.innerText = "Level Four";

          //REMOVE ITEMS FROM LEVEL THREE HERE
          document.getElementById("aliveDiv").classList.add("none");
          document.getElementById("turnContainer").classList.add("none");
          document.getElementById("crocodileClosed").classList.add("none");
          document.body.style.backgroundColor = "#595959";
          document.getElementById("lobby_wall").src =
            "../images/lobbyWall4.png";
          app.turnHeader.innerText = "Level Four";

          //ADD ITEMS FOR LEVEL FOUR HERE
          app.gameContainer.classList.remove("pointerNone");
          document
            .getElementById("mysterycard_container")
            .classList.remove("none");
          document
            .getElementById("mysterycard_container")
            .classList.remove("pointerNone");
        }, 1000);

        setTimeout(() => {
          app.turnHeader.innerText = "Guess the Mystery Number";
        }, 3500);

        setTimeout(() => {
          document.getElementById("dark_layer").classList.add("none");

          app.turnHeader.classList.add("none");
          // document.getElementById("mysterycard_container").classList.add("none");
          document.getElementById("card").src = "../images/takeyourguess.png";
<<<<<<< HEAD
          document.getElementById("submitNumber").classList.remove("none"); 
          document.getElementById("leaderboard").classList.remove("none"); 

          document.getElementById("submitNumber").classList.remove("pointerNone"); 
          document.getElementById("submit_number").addEventListener("click", (e) => {
            answer = document.getElementById("insert_number").value;
            console.log(answer);
            data = {
              room: sessionStorage.getItem("room"),
              name: sessionStorage.getItem("name"),
              guess: answer
            };
            socket.emit("numberGuessed", data);
            console.log("answer sent",data);
          });
=======

          document.getElementById("submitNumber").classList.remove("none");
          document
            .getElementById("submitNumber")
            .classList.remove("pointerNone");
          document
            .getElementById("submit_number")
            .addEventListener("click", (e) => {
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
>>>>>>> d6d2e80d4e23a664b17dbae7a97eb0deee581368
        }, 7000);
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
        clueHeader.classList.remove("none");
        clueHeader.style.color = "green";
        clueHeader.innerText = "Correct";
        setTimeout(() => {
          clueHeader.classList.add("none");
        }, 1000);
      });

      let userGuessedCounter = 0;

      socket.on("userGuessedIt", (data) => {
        // userGuessedCounter = userGuessedCounter+1;
        // if (userGuessedCounter == 4) {
        //   socket.emit("gameOver4");
        //   userGuessedCounter = 0;
        // }

        app.turnHeader.classList.remove("none");
        app.turnHeader.innerText = data.name + " guessed it";
        // let guessedUsers = [];
        // guessedUsers.push(data.name);
        // console.log("guessed Users"+ guessedUsers);
        // console.log("guessed Users Length"+ guessedUsers.length);

        if (data.name == "Pink Mokoko"){
          document.getElementById("player1Img").src = "../images/pinkMokoko.png"; 
        } 
        else if (data.name == "Orange Mokoko"){
          document.getElementById("player2Img").src = "../images/orangeMokoko.png"; 
        }
        else if (data.name == "Green Mokoko"){
          document.getElementById("player3Img").src = "../images/greenMokoko.png"; 
        }
        else if (data.name == "Purple Mokoko"){
          document.getElementById("player4Img").src = "../images/purpleMokoko.png"; 
        }

        if ((document.getElementById("player1Img").src != "../images/emptyMokoko.png")&&
        (document.getElementById("player2Img").src != "../images/emptyMokoko.png")&&
        (document.getElementById("player3Img").src != "../images/emptyMokoko.png")&&
        (document.getElementById("player4Img").src != "../images/emptyMokoko.png")){
        console.log("EVERYTHING IS FILLED HEY");
        socket.emit("gameOver4");
        }
        setTimeout(() => {
          app.turnHeader.classList.add("none");
        }, 2000);
      })


      

      let teeth = document.querySelectorAll(".tooth");

      for (let i = 0; i < teeth.length; i++) {
        teeth[i].addEventListener("click", (e) => {
          teeth[i].style.fill = "#D3D2D2";
          answer = teeth[i].dataset.num;
          console.log(answer);
          data = {
            room: sessionStorage.getItem("room"),
            guess: answer,
          };
          socket.emit("teethGuess", data);
        });
      }

      let chalices = document.querySelectorAll(".chalice");
      for (let i = 0; i < chalices.length; i++) {
        chalices[i].addEventListener("click", (e) => {
          answer = chalices[i].dataset.num;
          console.log(answer);
          // app.levelTwo();
          data = {
            room: sessionStorage.getItem("room"),
            guess: answer,
          };
          socket.emit("chaliceGuess", data);
        });
      }
    }, 3500);
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
