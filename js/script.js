// ===================================================================
// Stav lekce
// ===================================================================

// Počet spárovaných dvojic v aktuálním kole (interně, pro detekci konce kola)
let matchedCount = 0;
let totalPairsInRound = 0;

// Aktuální lekce
let currentLesson = localStorage.getItem("currentLesson") || "lesson7";

// Aktuální krok (vázaný na lekci!)
let currentStep = Number(localStorage.getItem(`${currentLesson}_step`)) || 0;

// Data lekce
let lessonJson = null;
let lessonData = [];

// Popisky lekcí pro tabulku statistik (musí odpovídat <option> v match.html)
const LESSON_LABELS = {
  lesson5: "Lesson 5",
  lesson6: "Lesson 6",
  lesson7: "Lesson 7",
  lesson8: "Lesson 8",
  lesson9: "Lesson 9",
  lesson10: "Lesson 10",
  tellingtime: "Telling time",
  hiragana: "Hiragana",
};

// ===================================================================
// Malé pomocníky pro localStorage (JSON objekty)
// ===================================================================

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {
    console.error("Nepodařilo se uložit do localStorage:", e);
  }
}

// ===================================================================
// Vykreslení tlačítek pro steps lekce (starý systém, ponechán pro kompatibilitu)
// ===================================================================

function renderStepButtons() {
  const stepsDiv = document.getElementById("steps");
  if (!stepsDiv) return; // no container, dropdown is used instead
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

// ===== step selector (dropdown) =====

function renderStepSelect() {
  const select = document.getElementById("stepSelect");
  if (!select || !lessonJson) return;

  select.innerHTML = "";
  lessonJson.steps.forEach((step, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = `Step ${index + 1}`;
    if (index === currentStep) opt.selected = true;
    select.appendChild(opt);
  });
}

function changeStep(value) {
  const idx = Number(value);
  if (isNaN(idx)) return;
  currentStep = idx;
  localStorage.setItem(`${currentLesson}_step`, currentStep);
  loadLesson();
}

// ===================================================================
// Načítání lekce z externího JSON souboru
// ===================================================================

function loadLesson() {
  fetch(`data/${currentLesson}.json`)
    .then(res => res.json())
    .then(data => {
      lessonJson = data;

      if (currentStep >= lessonJson.steps.length) {
        currentStep = lessonJson.steps.length - 1;
      }

      lessonData = lessonJson.steps[currentStep];

      renderStepSelect();
      start();
    })
    .catch(err => {
      console.error("Chyba při načítání JSON:", err);
    });
}

function changeLesson(lesson) {
  currentLesson = lesson;
  localStorage.setItem("currentLesson", lesson);

  currentStep = Number(localStorage.getItem(`${lesson}_step`)) || 0;
  loadLesson();
}

// ===================================================================
// Míchání
// ===================================================================

// Obyčejný Fisher–Yates shuffle (rovnoměrný, na rozdíl od sort(()=>Math.random()-0.5))
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Váhové (adaptivní) míchání: slova, na kterých hráč v minulosti chyboval,
 * mají větší šanci být vybrána do kola. Používá tzv. A-ES algoritmus
 * váhového vzorkování bez opakování (každému prvku se přiřadí náhodný
 * klíč Math.random() ** (1/váha) a seřadí se sestupně).
 */
function weightedShuffleAndPick(pairs, count) {
  const stats = loadJSON("wordStats", {});

  const keyed = pairs.map(p => {
    const statKey = wordStatKey(p);
    const s = stats[statKey] || { correct: 0, wrong: 0 };
    // víc chyb = vyšší váha (větší šance na výběr), víc správných = mírně nižší
    const weight = Math.max(0.15, 1 + s.wrong * 2 - s.correct * 0.3);
    return { p, sortKey: Math.random() ** (1 / weight) };
  });

  keyed.sort((a, b) => b.sortKey - a.sortKey);
  return keyed.slice(0, count).map(k => k.p);
}

function wordStatKey(p) {
  return `${currentLesson}:${currentStep}:${p.cz}`;
}

// ===================================================================
// Statistika jednotlivých slovíček (pro adaptivní opakování) —
// běží na pozadí, i když se skóre v UI nezobrazuje.
// ===================================================================

function recordWordResult(p, wasCorrect) {
  const stats = loadJSON("wordStats", {});
  const key = wordStatKey(p);
  const s = stats[key] || { correct: 0, wrong: 0 };
  if (wasCorrect) s.correct++; else s.wrong++;
  stats[key] = s;
  saveJSON("wordStats", stats);
}

// ===================================================================
// Statistiky napříč lekcemi (zobrazené jen ve sbalitelném panelu)
// ===================================================================

function recordLessonResult(wasCorrect) {
  const stats = loadJSON("lessonStats", {});
  const s = stats[currentLesson] || { correct: 0, wrong: 0 };
  if (wasCorrect) s.correct++; else s.wrong++;
  stats[currentLesson] = s;
  saveJSON("lessonStats", stats);
}

function renderStatsTable() {
  const tbody = document.getElementById("statsTableBody");
  if (!tbody) return;

  const lessonStats = loadJSON("lessonStats", {});
  const bestTimes = loadJSON("bestTimes", {});

  tbody.innerHTML = "";

  Object.keys(LESSON_LABELS).forEach(lesson => {
    const s = lessonStats[lesson];
    const best = bestTimes[lesson];

    const tr = document.createElement("tr");

    const total = s ? s.correct + s.wrong : 0;
    const accuracy = total > 0 ? `${Math.round((s.correct / total) * 100)}%` : "–";

    tr.innerHTML = `
      <td>${LESSON_LABELS[lesson]}</td>
      <td class="num">${s ? s.correct : 0}</td>
      <td class="num">${s ? s.wrong : 0}</td>
      <td class="num">${accuracy}</td>
      <td class="num">${best ? formatTime(best) : "–"}</td>
    `;
    tbody.appendChild(tr);
  });
}

function resetStats() {
  if (!confirm("Opravdu vymazat všechny statistiky a rekordy? Tato akce je nevratná.")) return;
  localStorage.removeItem("wordStats");
  localStorage.removeItem("lessonStats");
  localStorage.removeItem("bestTimes");
  renderStatsTable();
  const note = document.getElementById("bestTimeNote");
  if (note) note.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  renderStatsTable();
  const resetBtn = document.getElementById("statsReset");
  if (resetBtn) resetBtn.addEventListener("click", resetStats);
});

// ===================================================================
// Časovač
// ===================================================================

let roundStartTime = null;
let timerInterval = null;

function formatTime(ms) {
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function startTimer() {
  stopTimer();
  roundStartTime = Date.now();
  const display = document.getElementById("timeDisplay");
  if (display) display.textContent = "0:00.0";

  timerInterval = setInterval(() => {
    if (!display) return;
    display.textContent = formatTime(Date.now() - roundStartTime);
  }, 100);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function showBestTimeNote(elapsedMs, isRecord) {
  const note = document.getElementById("bestTimeNote");
  if (!note) return;

  if (isRecord) {
    note.innerHTML = `🏆 <span class="record">Nový rekord: ${formatTime(elapsedMs)}!</span>`;
  } else {
    const bestTimes = loadJSON("bestTimes", {});
    const best = bestTimes[currentLesson];
    note.textContent = best ? `Nejlepší čas pro tuto lekci: ${formatTime(best)}` : "";
  }
}

// ===================================================================
// Oslava dokončeného kola
// ===================================================================

function showRoundComplete(elapsedMs, isRecord) {
  const el = document.getElementById("roundComplete");
  const timeNote = document.getElementById("roundTimeNote");
  if (!el) return;

  if (timeNote) {
    timeNote.innerHTML = isRecord
      ? `⏱ ${formatTime(elapsedMs)} — <span class="record">nový rekord!</span>`
      : `⏱ ${formatTime(elapsedMs)}`;
  }

  el.hidden = false;
  void el.offsetWidth; // vynutit reflow, ať animace vždy naběhne znovu

  setTimeout(() => {
    el.hidden = true;
  }, 2000);
}

// ===================================================================
// Hlavní logika kola — obousměrné párování (nezáleží, jestli kliknete
// nejdřív na JP, nebo nejdřív na CZ slovo)
// ===================================================================

// Aktuálně vybraná dlaždice, ať už z levého (JP), nebo pravého (CZ) sloupce
let selected = null; // { pair, el, side: "left" | "right" }

function speakJapanese(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  speechSynthesis.speak(utterance);
}

function handleTileClick(p, el, side) {
  // Japonské slovo se přečte nahlas při každém kliknutí na JP dlaždici,
  // ať je to první, nebo druhý krok páru.
  if (side === "left") {
    speakJapanese(p.jp);
  }

  // Nic zatím není vybráno -> tohle se stává výběrem
  if (!selected) {
    el.classList.add("selected");
    selected = { pair: p, el, side };
    return;
  }

  // Kliknuto znovu do stejného sloupce -> jen se přepne výběr
  if (selected.side === side) {
    selected.el.classList.remove("selected");
    el.classList.add("selected");
    selected = { pair: p, el, side };
    return;
  }

  // Kliknuto do opačného sloupce -> vyhodnotit pár
  const other = selected;
  const isCorrect = other.pair === p; // stejný objekt = správný pár

  if (isCorrect) {
    other.el.classList.remove("selected");
    other.el.classList.add("correct");
    other.el.onclick = null;

    el.classList.add("correct");
    el.onclick = null;

    recordWordResult(p, true);
    recordLessonResult(true);

    matchedCount++;
    renderStatsTable();

    if (matchedCount === totalPairsInRound) {
      stopTimer();
      const elapsed = Date.now() - roundStartTime;

      const bestTimes = loadJSON("bestTimes", {});
      const prevBest = bestTimes[currentLesson];
      const isRecord = !prevBest || elapsed < prevBest;
      if (isRecord) {
        bestTimes[currentLesson] = elapsed;
        saveJSON("bestTimes", bestTimes);
      }

      showRoundComplete(elapsed, isRecord);
      showBestTimeNote(elapsed, isRecord);
      renderStatsTable();
    }
  } else {
    recordWordResult(other.pair, false);
    recordLessonResult(false);

    other.el.classList.add("wrong");
    el.classList.add("wrong");

    setTimeout(() => {
      other.el.classList.remove("wrong", "selected");
      el.classList.remove("wrong");
    }, 1000);
  }

  selected = null;
}

function start() {
  matchedCount = 0;
  selected = null;

  const bestTimeNote = document.getElementById("bestTimeNote");
  if (bestTimeNote) {
    const bestTimes = loadJSON("bestTimes", {});
    const best = bestTimes[currentLesson];
    bestTimeNote.textContent = best ? `Nejlepší čas pro tuto lekci: ${formatTime(best)}` : "";
  }

  document.getElementById("left").innerHTML = "";
  document.getElementById("right").innerHTML = "";

  const MAX_ROWS = 6;
  const selectedPairs = lessonData;

  // Adaptivní/váhový výběr: slova s vyšší chybovostí mají větší šanci být vybrána
  const pairs = weightedShuffleAndPick(selectedPairs, Math.min(MAX_ROWS, selectedPairs.length));
  totalPairsInRound = pairs.length;
  startTimer();

  const leftWords = shuffle([...pairs]);
  const rightWords = shuffle([...pairs]);

  leftWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word jp-word";

    d.innerHTML = `
      <div class="romaji">${p.jp}</div>
      <div class="hiragana">${p.hiragana || ""}</div>
    `;

    d.onclick = () => handleTileClick(p, d, "left");
    document.getElementById("left").appendChild(d);
  });

  rightWords.forEach(p => {
    const d = document.createElement("div");
    d.className = "word";
    d.textContent = p.cz;

    d.onclick = () => handleTileClick(p, d, "right");
    document.getElementById("right").appendChild(d);
  });
}

loadLesson();
