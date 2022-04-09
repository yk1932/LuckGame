const app = {
  initialize: () => {
    const joinButton = document.getElementById("join_button");
    const backButton = document.getElementById("back_button");



    joinButton.addEventListener("click", () => {
      console.log("join clicked");
      window.location = "../lobby";
    });

    backButton.addEventListener("click", () => {
      console.log("join clicked");
      window.location = "/";
    });

    let socket = io();
    //     socket.on("connect", () => {
    //       console.log("connected to server");
    //       let data = {
    //         name: sessionStorage.getItem("name"),
    //         room: sessionStorage.getItem("room"),
    //       };
    //       socket.emit("userData", data);
    //     });
    //     socket.on("userTyping", () => {
    //       console.log("user is typing");
    //     });
    //     socket.on("pastMessages", (data) => {
    //       console.log(data.oldMessages);
    //       if (data.oldMessages.length > 0) {
    //         let chatWindow = document.getElementById("chat-box-msgs");
    //         for (let i = 0; i < data.oldMessages.length; i++) {
    //           console.log(data.oldMessages[i].name, data.oldMessages[i].msg);
    //           let chatMessage = document.createElement("p");
    //           chatMessage.innerHTML =
    //             data.oldMessages[i].name + " : " + data.oldMessages[i].msg;
    //           chatWindow.appendChild(chatMessage);
    //         }
    //       }
    //     });
    //     socket.on("chatMessage", (data) => {
    //       let chatWindow = document.getElementById("chat-box-msgs");
    //       let chatMessage = document.createElement("p");
    //       chatMessage.innerHTML = data.name + " : " + data.msg;
    //       chatWindow.appendChild(chatMessage);
    //     });
    //     console.log("load");
    //     const submitButton = document.getElementById("send-button");
    //     const chatForm = document.getElementById("chat-form");

    //     chatForm.addEventListener("submit", (e) => {
    //       e.preventDefault();
    //       // let name = document.getElementById("name-input").value;
    //       let name = sessionStorage.getItem("name");
    //       let msg = document.getElementById("msg-input").value;
    //       console.log(name, msg);

    //       //emit info to server
    //       chatObject = {
    //         name: name,
    //         msg: msg,
    //       };

    //       socket.emit("chatMessage", chatObject);
    //     });

    //     let messageInput = document.getElementById("msg-input");
    //     messageInput.addEventListener("keypress", () => {
    //       socket.emit("userTyping");
    //     });
  },
};
