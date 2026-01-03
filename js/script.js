// Počítadla správných a špatných odpovědí
let correctCount = 0;
let wrongCount = 0;

// Aktuální lekce
let currentLesson = localStorage.getItem("currentLesson") || "lesson7";

// Aktuální krok (vázaný na lekci!)
let currentStep = Number(localStorage.getItem(`${currentLesson}_step`)) || 0;

// Data lekce
let lessonJson = null;
let lessonData = [];

// Vykreslení tlačítek pro steps lekce
function renderStepButtons() {
  const stepsDiv = document.getElementById("steps");
  stepsDiv.innerHTML = "";

  lessonJson.steps.forEach((step, index) => {
    const btn = document.createElement("button");
    btn.textContent = `Část ${index + 1}`;

    if (index === currentStep) {
      btn.classList.add("active-step");
    }

    btn.onclick = () => {
      currentStep = index;
      localStorage.setItem(`${currentLesson}_step`, currentStep);
      loadLesson();
    };

    stepsDiv.appendChild(btn);
  });
}

// Načítání lekce z externího JSON souboru
function loadLesson() {
  fetch(`data/${currentLesson}.json`)
    .then(res => res.json())
    .then(data => {
      lessonJson = data;

      if (currentStep >= lessonJson.steps.length) {
        currentStep = lessonJson.steps.length - 1;
      }

      lessonData = lessonJson.steps[currentStep];

      renderStepButtons(); // ✅ tady
      start();
    })
    .catch(err => {
      console.error("Chyba při načítání JSON:", err);
    });
}




// Funkce pro změnu lekce
function changeLesson(lesson) {
  currentLesson = lesson;
  localStorage.setItem("currentLesson", lesson);

  currentStep = Number(localStorage.getItem(`${lesson}_step`)) || 0;
  loadLesson();
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

  const selectedPairs = lessonData;

  const pairs = shuffle([...selectedPairs]).slice(0, MAX_ROWS);

  const leftWords = shuffle([...pairs]);
  const rightWords = shuffle([...pairs]);
  //const leftWords = shuffle([...pairs]);
  //const rightWords = shuffle([...pairs]);

  leftWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word jp-word";
    
    d.innerHTML = `
      <div class="romaji">${p.jp}</div>
      <div class="hiragana">${p.hiragana || ""}</div>
    `;

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

  const jpWord = selectedLeft.jp; // ✅ uložit dřív

  d.classList.add("correct");
  document.querySelector(".selected").classList.add("correct");
  document.querySelector(".selected").classList.remove("selected");
  d.onclick = null;
  selectedLeft = null;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(jpWord);
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



