const urlDictionary = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const urlWordApi = "https://api.datamuse.com/words?sp=?????";
let pause; // used to make sure everything are set before user makes events
let wordsArr = [],
  wordsArrIndex,
  currentWord,
  squareIndex,
  score,
  wordsCount,
  checkPoint;

//UI Elements
const btnStart = document.querySelector(".start-btn");
const btnRestart = document.querySelector(".restart-btn");
const btnCloseScores = document.querySelector(".close-scores");
const squares = [...document.querySelectorAll(".cube")];
const gameSection = document.querySelector(".game-section");
const landingSection = document.querySelector("#landing-section-screen");
const wordRevealSection = document.querySelector(".word-reveal-section");
const scoreSection = document.querySelector(".score-section");
const scoreEl = document.querySelector(".score-value");
const wordsCountEl = document.querySelector(".words-value");
const keyboard = document.querySelector(".keyboard");
const keysMap = new Map();

// Fetch words from API
const fetchWords = async function () {
  const response = await fetch("https://api.datamuse.com/words?sp=?????");
  const data = await response.json();
  wordsArr = data.map((obj) => obj.word);
};

// Start Game
const startGame = async function () {
  pause = true;
  wordsArrIndex = squareIndex = checkPoint = wordsCount = score = 0;
  await fetchWords();
  shuffleArray(wordsArr);
  wordsArr = wordsArr.slice(0, 10);
  currentWord = wordsArr[wordsArrIndex].toUpperCase();
  createKeysMap();
  clearUi();
  clearKeyboard();
  scoreEl.textContent = 0;
  wordsCountEl.textContent = wordsArrIndex;
  pause = false;
};

// Utility Functions
const delay = (sec) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const shuffleArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const letterFrequency = function (word) {
  const frequencyMap = new Map();
  for (let letter of word) {
    if (frequencyMap.has(letter)) {
      frequencyMap.set(letter, frequencyMap.get(letter) + 1);
    } else {
      frequencyMap.set(letter, 1);
    }
  }
  return frequencyMap;
};

const dictionaryCheck = async (word) => {
  const url = `${urlDictionary}${word}`;
  try {
    const response = await fetch(url);
    if (response.status == 404) return false;
    return true;
  } catch (err) {
    return false;
  }
};

const invalidWord = (currentSquares) => {
  currentSquares.forEach((square) => {
    square.classList.add("shake");
  });
  setTimeout(() => {
    currentSquares.forEach((square) => {
      square.classList.remove("shake");
    });
  }, 300);
};

const confettiEffect = () => {
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0, y: 0.6 }, 
    });
  }, 0); 
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 }, 
    });
  }, 700); 
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 1, y: 0.6 }, 
    });
  }, 350);
};

const updateScore = () => {
  score += 6 - squareIndex / 5 + 1;
  wordsCount = wordsArrIndex;
  scoreEl.textContent = score;
  wordsCountEl.textContent = wordsCount;
};

const createKeysMap = () => {
  document
    .querySelectorAll(".key")
    .forEach((key) => keysMap.set(key.textContent, key));
};

const clearKeyboard = () => {
  document
    .querySelectorAll(".key")
    .forEach((key) =>
      key.classList.remove("green-col", "orange-col", "gray-col")
    );
};

const clearUi = () => {
  squares.forEach((square) => {
    square.classList.remove("green-col", "orange-col");
    square.textContent = "";
  });
};

const changeWord = () => {
  wordsArrIndex++;
  if (wordsArrIndex == wordsArr.length) return false;
  currentWord = wordsArr[wordsArrIndex].toUpperCase();
  return true;
};

const resetRound = () => {
  if (!changeWord()) {
    landingUi();
    showScoreOverlay();
    confettiEffect();
  }
  updateScore();
  squareIndex = checkPoint = 0;
  clearUi();
  clearKeyboard();
};

const wordReveal = () => {
  keyboard.classList.add("hidden");
  wordRevealSection.classList.remove("hidden");
  wordRevealSection.querySelector(".word").textContent = currentWord;
};

const compareWord = (currentSquares) => {
  const wordMap = letterFrequency(currentWord);
  let greenCount = 0;
  //Mark Green Ones
  currentSquares.forEach((square, i) => {
    if (square.textContent === currentWord[i]) {
      wordMap.set(square.textContent, wordMap.get(square.textContent) - 1);
      square.classList.add("green-col");
      greenCount++;
    }
  });
  //Mark Orange ones
  currentSquares.forEach((square) => {
    if (
      !square.classList.contains("green-col") &&
      wordMap.get(square.textContent) > 0
    ) {
      wordMap.set(square.textContent, wordMap.get(square.textContent) - 1);
      square.classList.add("orange-col");
    }
  });
  colorKeyboard(currentSquares);
  return greenCount === 5;
};

const showScoreOverlay = () => {
  scoreSection.classList.remove("hidden");
  scoreSection.classList.add("score-overlay");
  btnCloseScores.classList.remove("hidden");
};

const closeScoreOverlay = () => {
  scoreSection.classList.add("hidden");
  scoreSection.classList.remove("score-overlay");
  btnCloseScores.classList.add("hidden");
};

const colorKeyboard = (squares) => {
  squares.forEach((square) => {
    const key = keysMap.get(square.textContent);

    if (square.classList.contains("green-col")) {
      key.classList.add("green-col");
    } else if (square.classList.contains("orange-col")) {
      key.classList.add("orange-col");
    } else if (
      !key.classList.contains("green-col") &&
      !key.classList.contains("orange-col")
    ) {
      key.classList.add("gray-col");
    }
  });
};

const keyHandler = async (key) => {
  //if is true it means another key operation is happening so make the user wait
  if (pause) return;
  const allowedKeys = "QWERTYUIOPASDFGHJKLZXCVBNM";
  const currentSquares = squares.filter((_, i) => {
    return i <= squareIndex - 1 && i >= squareIndex - 5;
  });

  if ((key === "ENTER" || key === "ENT") && squareIndex % 5 === 0) {
    pause = true;
    const word = currentSquares.map((square) => square.textContent).join("");
    if (!(await dictionaryCheck(word))) {
      invalidWord(currentSquares);
      pause = false;
      return;
    }
    if (compareWord(currentSquares)) {
      await delay(1);
      resetRound();
      pause = false;
      return;
    }
    if (squareIndex >= 30) {
      wordReveal();
      pause = true;
      return;
    }
    checkPoint += 5;
  }

  if ((key === "BACKSPACE" || key === "DEL") && squareIndex > checkPoint) {
    squares[--squareIndex].textContent = "";
    pause = false;
    return;
  }

  if (allowedKeys.includes(key) && squareIndex < checkPoint + 5) {
    squares[squareIndex++].textContent = key;
  }

  pause = false;
};

// UI Functions
const landingUi = () => {
  landingSection.classList.remove("hidden");
  gameSection.classList.add("hidden");
  keyboard.classList.add("hidden");
  wordRevealSection.classList.add("hidden");
  scoreSection.classList.add("hidden");
};

const gameSectionUi = () => {
  landingSection.classList.add("hidden");
  gameSection.classList.remove("hidden");
  keyboard.classList.remove("hidden");
  wordRevealSection.classList.add("hidden");
  scoreSection.classList.remove("hidden");
};

// Event Listeners
btnStart.addEventListener("click", () => (gameSectionUi(), startGame()));
btnRestart.addEventListener("click", () => (gameSectionUi(), startGame()));
document.addEventListener("keydown", (e) => keyHandler(e.key.toUpperCase()));
keyboard.addEventListener("click", (e) => keyHandler(e.target.textContent));
btnCloseScores.addEventListener("click", closeScoreOverlay);

// Initialize UI
landingUi();
