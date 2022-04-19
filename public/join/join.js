const app = {
  initialize: () => {
    const joinButton = document.getElementById("join_button");
    const backButton = document.getElementById("back_button");
    const roomInput = document.getElementById("roomid");

    let socket = io();
    joinButton.addEventListener("click", () => {
      console.log("join clicked");
      console.log(roomInput.value);
      sessionStorage.setItem("room", roomInput.value);
      window.location = "../lobby";
    });

    backButton.addEventListener("click", () => {
      console.log("back clicked");
      window.location = "/";
    });
  },
};
