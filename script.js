const pairs = [
  {jp: "kirimisu", cz: "cut, slice"},
  {jp: "okurimasu", cz: "send"},
  {jp: "agemasu", cz: "give"},
  {jp: "moraimasu", cz: "receive"},
  {jp: "kashimasu", cz: "lend"},
  {jp: "karimasu", cz: "borrow"},
  {jp: "oshiemasu", cz: "teach"},
  {jp: "naraimasu", cz: "learn"},
  {jp: "kakemasu", cz: "make..a phone call.."},
];

let selectedLeft = null;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function start() {
  selectedLeft = null;
  document.getElementById("left").innerHTML = "";
  document.getElementById("right").innerHTML = "";

  const leftWords = shuffle([...pairs]);
  const rightWords = shuffle([...pairs]);

  leftWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word";
    d.textContent = p.jp;
    d.onclick = () => {
      document.querySelectorAll(".selected").forEach(e => e.classList.remove("selected"));
      d.classList.add("selected");
      selectedLeft = p;
    };
    document.getElementById("left").appendChild(d);
  });

  rightWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word";
    d.textContent = p.cz;
    d.onclick = () => {
      if (!selectedLeft) return;

      if (selectedLeft.cz === p.cz) {
        d.classList.add("correct");
        document.querySelector(".selected").classList.add("correct");
        document.querySelector(".selected").classList.remove("selected");
        d.onclick = null;
        selectedLeft = null;
      } 
      else {
        d.classList.add("wrong");
        setTimeout(() => d.classList.remove("wrong"), 1000);
        setTimeout(() => document.querySelector(".selected")?.classList.remove("selected"), 1000);
        selectedLeft = null;
      }
    };
    document.getElementById("right").appendChild(d);
  });
}

start();
