const app = {
  randomNum: 0,
  gameLength: document.querySelectorAll(".door").length,
  initialize: () => {
    let doors = document.querySelectorAll(".door");
    app.randomize();
    for (let i = 0; i < doors.length; i++) {
      doors[i].addEventListener("click", () => {
        console.log(doors[i].dataset.num);
        answer = doors[i].dataset.num;
        if (app.randomNum == answer) {
          alert("boom u died");
        } else {
          alert("u didn't die bro");
        }
        app.randomize();
      });
    }
  },
  randomize: () => {
    app.randomNum = Math.floor(Math.random() * app.gameLength + 1);
    console.log(app.randomNum);
  },
};
