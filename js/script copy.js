let correctCount = 0;
let wrongCount = 0;

const lessons = {
  lesson7_1: [
    {jp: "kirimasu", cz: "cut, slice"},
    {jp: "okurimasu", cz: "send"},
    {jp: "agemasu", cz: "give"},
    {jp: "moraimasu", cz: "receive"}
  ],

 lesson7_2: [
    {jp: "kashimasu", cz: "lend"},
    {jp: "karimasu", cz: "borrow"},
    {jp: "oshiemasu", cz: "teach"},
    {jp: "naraimasu", cz: "learn"},
    {jp: "kakemasu", cz: "make..a phone call.."}
  ],

  lesson7_3: [
    { jp: "te", cz: "hand, arm" },
    { jp: "hashi", cz: "chopsticks" },
    { jp: "supuun", cz: "spoon" },
    { jp: "naifu", cz: "knife" },
    { jp: "foku", cz: "fork" },
    { jp: "hasami", cz: "scissors" }
  ],

  lesson7_4: [
    { jp: "hana", cz: "flower" },
    { jp: "shatsu", cz: "shirt" },
    { jp: "nimotsu", cz: "luggage" },
    { jp: "okane", cz: "money" },
    { jp: "moo", cz: "already" },
    { jp: "mada", cz: "not yet" },
    { jp: "kore kara", cz: "from now on, soon" }
  ]
};

let currentLesson = "lesson7_1"

function changeLesson(lesson) {
  currentLesson = lesson;
  start();
}


let selectedLeft = null;

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function start() {
  correctCount = 0;
  wrongCount = 0;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("wrongCount").textContent = wrongCount;

  selectedLeft = null;
  document.getElementById("left").innerHTML = "";
  document.getElementById("right").innerHTML = "";

  const MAX_ROWS = 6;

  const selectedPairs = lessons[currentLesson]

  const pairs = shuffle([...selectedPairs]).slice(0, MAX_ROWS);

  const leftWords = shuffle([...pairs]);
  const rightWords = shuffle([...pairs]);
  //const leftWords = shuffle([...pairs]);
  //const rightWords = shuffle([...pairs]);

  leftWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word";
    d.textContent = p.jp;
    d.onclick = () => {
      document.querySelectorAll(".selected").forEach(e => e.classList.remove("selected"));
      d.classList.add("selected");
      selectedLeft = p;

      const utterance = new SpeechSynthesisUtterance(p.jp);
      utterance.lang = "ja-JP"; // japonský jazyk
      speechSynthesis.speak(utterance);
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
        

        correctCount++;
        document.getElementById("correctCount").textContent = correctCount;
        
        d.classList.add("correct");
        document.querySelector(".selected").classList.add("correct");
        document.querySelector(".selected").classList.remove("selected");
        d.onclick = null;
        selectedLeft = null;

        speechSynthesis.cancel(); // zastaví předchozí výslovnost
        const utterance = new SpeechSynthesisUtterance(selectedLeft.jp);
        utterance.lang = "ja-JP";
        speechSynthesis.speak(utterance);
      } 

      else {
        wrongCount++;
        document.getElementById("wrongCount").textContent = wrongCount;

        d.classList.add("wrong");
        setTimeout(() => d.classList.remove("wrong"), 1000);
        setTimeout(() => document.querySelector(".selected")?.classList.remove("selected"), 1000);
        selectedLeft = null;
      }
    };
    document.getElementById("right").appendChild(d);
  });
}

loadLesson();