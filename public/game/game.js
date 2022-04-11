const app = {
  randomNum: 0,
  gameLength: document.querySelectorAll(".door").length,
  gameContainer: document.querySelector(".game_container"),
  initialize: () => {
    app.turnHeader.classList.remove("none");
    app.turnHeader.innerText = "Level One";

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
  
      socket.on("gameOver", () => {
  
        //Remove all doors after 1 second of ending game
        setTimeout(() => {
          //Remove doors
            let doors = document.querySelectorAll(".door");
            for (let i = 0; i < doors.length; i++) {
            doors[i].classList.add("none");
            }
            app.turnHeader.innerText = "Level One Ended";
            app.resultHeader.classList.add("none");
  
            }, 2000);
  
  
        setTimeout(() => {
          // Remove turn header
          socket.emit("levelTwo", data);
            }, 3500);
        
          
  
      });
  
      socket.on("levelTwoStart", () => {
        // game intro
        setTimeout(() => {
          let lobbyWall = document.getElementById('lobby_wall');
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
          }, 6000);
        
        
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
  
      
      let doors = document.querySelectorAll(".door");
      app.randomize();
      for (let i = 0; i < doors.length; i++) {
        doors[i].addEventListener("click", (e) => {
          answer = doors[i].dataset.num;
          console.log(answer);
          // app.levelTwo();
          data = {
            room: sessionStorage.getItem("room"),
            guess: answer,
          };
          socket.emit("doorGuess", data);
        });
      };
  
    }, 3500);

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
