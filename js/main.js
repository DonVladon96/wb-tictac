// Выбор всех необходимых элементов из DOM
const gameOptions = document.querySelector("#options");
const difficulty = document.getElementsByName("difficulty");
const players = document.getElementsByName("player");
const startBtn = document.querySelector("#startBtn");
const newGame = document.querySelector(".new-game");
const statusTxt = document.querySelector("#status");
const cells = document.querySelectorAll(".cell");

// Инициализация сохраненной игры или создание новой
let savedGame = JSON.parse(localStorage.getItem("game")) || {};
let player = "x";
let gameEnded = true;
let gameDifficulty = "0";
let gameFormat = "twoPlayers";
let humanPlayer = "x";
let computerPlayer = "o";

// Функция для отрисовки крестика или нолика в ячейке
const placeFigure = (cell, figure) => {
  let innerHTML = document.createElement("div");
  innerHTML.classList.add(figure);
  innerHTML.textContent = figure;
  cell.appendChild(innerHTML);
};

// Инициализация сохраненной игры
const initGame = () => {
  if (Object.keys(savedGame).length === 0) {
    return;
  }

  // Отрисовка сохраненного поля
  for (let i = 0; i < cells.length; i++) {
    savedCell = savedGame.field[i];
    if (savedCell !== "") {
      placeFigure(cells[i], savedCell);
    }
  }

  player = savedGame.player;
  gameDifficulty = savedGame.gameDifficulty;
  gameFormat = savedGame.gameFormat;
  gameEnded = savedGame.gameEnded;
  gameOptions.style.display = "none";
};
initGame();

// Отображение информации о текущем игроке
statusTxt.textContent = `${player} твой ход`;

// Обработчик нажатия на кнопку начала игры
startBtn.addEventListener("click", () => {
  gameOptions.style.display = "none";
  gameDifficulty = document.querySelector('input[name="difficulty"]:checked').value;
  gameFormat = document.querySelector('input[name="player"]:checked').value;
  gameEnded = false;
  newGame.style.display = "none";
});

// Выигрышные комбинации на поле
const win = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Функция для проверки наличия выигрышной комбинации для игрока
const isPlayerWon = (field, player) => {
  for (let i = 0; i < win.length; i++) {
    if (
      field[win[i][0]] === player &&
      field[win[i][1]] === player &&
      field[win[i][2]] === player
    ) {
      return true;
    }
  }
  return false;
};

// Функция для рассчета лучшего хода компьютера
const miniMax = (field, player) => {
  let emptyCells = field.filter((item) => item === "");

  if (isPlayerWon(field, humanPlayer)) {
    return { score: -10 };
  } else if (isPlayerWon(field, computerPlayer)) {
    return { score: 10 };
  } else if (emptyCells.length === 0) {
    return { score: 0 };
  }

  let moves = [];
  for (let i = 0; i < field.length; i++) {
    if (field[i] !== "") {
      continue;
    }
    let currentMove = {};
    currentMove.index = i;
    field[i] = player;
    let nextPlayer = player === "x" ? "o" : "x";
    let result = miniMax(field, nextPlayer);
    currentMove.score = result.score;
    field[i] = "";
    moves.push(currentMove);
  }

  let bestMove;
  if (player === computerPlayer) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
};

const theBestMove = () => {
  let field = Array.from(cells).map((cell) => cell.textContent);
  let result = miniMax(field, player);
  return cells[result.index];
};

const randomMove = () => {
  let emptyCells = Array.from(cells).filter((cell) => cell.innerHTML === "");
  let randomCellIndex = Math.floor(Math.random() * emptyCells.length);
  return emptyCells[randomCellIndex];
};

const computerChoise = () => {
  if (gameDifficulty === "1") {
    return theBestMove();
  } else {
    return randomMove();
  }
};

const saveGame = () => {
  let currentGame = {
    player,
    gameEnded,
    gameDifficulty,
    gameFormat,
    field: Array.from(cells).map((cell) => cell.textContent),
  };
  localStorage.setItem("game", JSON.stringify(currentGame));
};

const makeAMove = (cell) => {
  placeFigure(cell, player);
  checkWin();
  if (gameEnded) {
    return;
  }

  player = player === "x" ? "o" : "x";
  statusTxt.textContent = `${player} твой ход`;
  saveGame();
};

cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (gameEnded || cell.innerHTML !== "") {
      return;
    }
    makeAMove(cell);
    if (!gameEnded && gameFormat === "computer") {
      makeAMove(computerChoise());
    }
  });
});

const gameOver = (isDraw = false) => {
  gameEnded = true;
  statusTxt.textContent = isDraw ? "Ничья!" : `Победа ${player}! `;
  newGame.style.display = "inline";
  localStorage.removeItem("game");
};

const checkWin = () => {
  for (let i = 0; i < win.length; i++) {
    if (
      document.getElementById(win[i][0]).textContent === player &&
      document.getElementById(win[i][1]).textContent === player &&
      document.getElementById(win[i][2]).textContent === player
    ) {
      document.getElementById(win[i][0]).children[0].classList.add("win-color");
      document.getElementById(win[i][1]).children[0].classList.add("win-color");
      document.getElementById(win[i][2]).children[0].classList.add("win-color");
      gameOver();
    }
  }
  let emptyCells = Array.from(cells).filter((cell) => cell.textContent === "");
  if (!gameEnded && emptyCells.length === 0) {
    gameOver(true);
  }
};

newGame.addEventListener("click", () => {
  gameEnded = false;
  player = "x";
  cells.forEach((cell) => {
    cell.innerHTML = "";
  });
  statusTxt.textContent = `${player} твой ход`;
  gameOptions.style.display = "block";
});
