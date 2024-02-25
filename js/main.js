const gameOptions = document.querySelector("#options");
const difficulty = document.getElementsByName("difficulty");
const players = document.getElementsByName("player");
const startBtn = document.querySelector("#startBtn");
const newGame = document.querySelector(".new-game");
const statusTxt = document.querySelector("#status");
const cells = document.querySelectorAll(".cell");

// Сохраненное состояние игры
let savedGame = JSON.parse(localStorage.getItem("game")) || {};

let player = "x";
let gameEnded = true;
let gameDifficulty = "0";
let gameFormat = "twoPlayers";
let humanPlayer = "x";
let computerPlayer = "o";

// Отрисовка крестика или нолика
const placeFigure = (cell, figure) => {
  let innerHTML = document.createElement("div");
  innerHTML.classList.add(figure);
  innerHTML.textContent = figure;
  cell.appendChild(innerHTML);
};

// Инициализируем сохраненную ранее игру
const initGame = () => {
  // Если нет сохранений, то ничего не делаем
  if (Object.keys(savedGame).length === 0) {
    return;
  }

  // Отрисовываем сохраненное поле
  for (let i = 0; i < cells.length; i++) {
    savedCell = savedGame.field[i];

    if (savedCell !== "") {
      placeFigure(cells[i], savedCell);
    }
  }

  // Инициализируем остальные настройки игры
  player = savedGame.player;
  gameDifficulty = savedGame.gameDifficulty;
  gameFormat = savedGame.gameFormat;
  gameEnded = savedGame.gameEnded;
  gameOptions.style.display = "none";
};

initGame();

// Отображение сообщения о том, чей сейчас ход
statusTxt.textContent = `${player} твой ход`;

// Скрываем окно с настройками при нажатие на кнопку начала игры
startBtn.addEventListener("click", () => {
  gameOptions.style.display = "none";
  gameDifficulty = document.querySelector(
    'input[name="difficulty"]:checked',
  ).value;
  gameFormat = document.querySelector('input[name="player"]:checked').value;
  gameEnded = false;

  newGame.style.display = "none";
});

// Выигрышные комбинации
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

// Функция для проверки выигрыша одного из игроков для функции miniMax
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
  // Доступные клетки для хода
  let emptyCells = field.filter((item) => item === "");

  // Если при текущем расположении ходов выиграл человек, то отнимаем 10 очков
  if (isPlayerWon(field, humanPlayer)) {
    return { score: -10 };
    // Если при текущем расположении ходов выиграл компьютер, то прибавляем 10 очков
  } else if (isPlayerWon(field, computerPlayer)) {
    return { score: 10 };
    // Если при текущем расположении ходов случилась ничья, то очки не изменяются
  } else if (emptyCells.length === 0) {
    return { score: 0 };
  }

  // Определяем массив возможных ходов
  let moves = [];

  for (let i = 0; i < field.length; i++) {
    // Если клетка уже занята, то пропускаем её
    if (field[i] !== "") {
      continue;
    }

    let currentMove = {};

    currentMove.index = i;
    // Делаем ход в текущую клетку
    field[i] = player;

    let nextPlayer = player === "x" ? "o" : "x";
    // Запускаем рекурсию
    let result = miniMax(field, nextPlayer);
    // Записываем в поле score наилучший возможный результат после хода в текущую клетку
    currentMove.score = result.score;

    // Возвращаем поле в исходное состояние
    field[i] = "";
    moves.push(currentMove);
  }

  let bestMove;
  // Ищем наилучший из возможных ходов в массиве moves
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

// Функция для выбора лучшей клетки для следующего хода компьютера
const theBestMove = () => {
  let field = Array.from(cells).map((cell) => cell.textContent);

  let result = miniMax(field, player);
  return cells[result.index];
};

// Функция для выбора случайной клетки для следующего хода компьютера
const randomMove = () => {
  let emptyCells = Array.from(cells).filter((cell) => cell.innerHTML === "");
  let randomCellIndex = Math.floor(Math.random() * emptyCells.length);

  return emptyCells[randomCellIndex];
};

// Функция для выбора стратегии по которой компьютер будет ходить. Зависит от выбора сложности
const computerChoise = () => {
  if (gameDifficulty === "1") {
    return theBestMove();
  } else {
    return randomMove();
  }
};

// Функция для сохранения прогресса игры
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

// Функция для отображения хода текущего игрока и проверки на конец игры
const makeAMove = (cell) => {
  placeFigure(cell, player);

  checkWin();

  if (gameEnded) {
    return;
  }

  // После хода текущего игрока, передаём ход следующему
  player = player === "x" ? "o" : "x";
  statusTxt.textContent = `${player} твой ход`;
  // Сохраняем игру после каждого хода
  saveGame();
};

// По клику на клетку запускаем функцию хода человека.
cells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (gameEnded || cell.innerHTML !== "") {
      return;
    }

    makeAMove(cell);

    // Если пользователь играет с компьютером, то сразу же делаем ход за него
    if (!gameEnded && gameFormat === "computer") {
      makeAMove(computerChoise());
    }
  });
});

// Функция для завершения игры и отображения соответствующей информации
const gameOver = (isDraw = false) => {
  gameEnded = true;
  statusTxt.textContent = isDraw ? "Ничья!" : `Победа ${player}! `;
  newGame.style.display = "inline";
  // Удаляем сохранения после завершения игры
  localStorage.removeItem("game");
};

// Функция для проверки на конец игры после отображения хода каждого игрока
const checkWin = () => {
  // Проверяем, достигнута ли на поле одна из победных комбинаций для текущего игрока, сделавшего ход
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
  // Проверка на ничью
  if (!gameEnded && emptyCells.length === 0) {
    gameOver(true);
  }
};

// Обнуление состояния игры для начала новой
newGame.addEventListener("click", () => {
  gameEnded = false;
  player = "x";

  cells.forEach((cell) => {
    cell.innerHTML = "";
  });

  statusTxt.textContent = `${player} твой ход`;
  gameOptions.style.display = "block";
});
