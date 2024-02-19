const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#a3b6f9';
const FOOD_COLOUR = '#e66916';

const socket = io('http://localhost:3000');
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('workingArea');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    console.log('newgame clicked');
    socket.emit('newGame');
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "flex";
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.height = 500;
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.addEventListener('keydown', keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
    console.log(e.keyCode);
}

// init();

function paintGame(state) {
    console.log("paintgame called")
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width/gridSize;
    ctx.fillStyle = FOOD_COLOUR;
    console.log(food.x," ",food.y);
    console.log("gridsize is ", gridSize);
    ctx.fillRect(food.x*size, food.y*size, size, size);
    // paintPlayer(state.player, size, SNAKE_COLOUR);
    // console.log(state.players[0].snake[0]);
    paintPlayer(state.players[0], size, SNAKE_COLOUR);
    paintPlayer(state.players[1], size, SNAKE_COLOUR);
}

function paintPlayer(player, size, colour) {
    console.log("paintPlayer called")
    const snake = player.snake;
    ctx.fillStyle = colour;
    for(let cell of snake) {
        console.log('filling colour ', cell.x,", ",cell.y);
        ctx.fillRect(cell.x*size, cell.y*size, size, size);
    }
}
// paintGame(gameState);


function handleInit(number) {
    playerNumber = number;
    // console.log(msg);
}

function handleGameState(gameState) {
    if(!gameActive) return;
    console.log("handlegamestate is being called");
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if(!gameActive) return;
    console.log("G A M E O V E R called")
    data = JSON.parse(data);
    if(data.winner == playerNumber) alert("You win");
    else alert("you lose");
    alert('you lose');
    gameActive = false;
}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
  }

  function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
  }

  function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
  }

  function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "flex";
    gameScreen.style.display = "none";
  }