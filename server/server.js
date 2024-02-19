const io = require('socket.io')({
    cors: {
        origin: 'http://127.0.0.1:5500',
        methods: ['GET', 'POST'],
        credentials: true
    }
});   
const { initGame, gameLoop, getUpdatedVelocity } = require('./game.js')
const { FRAME_RATE } = require('./constants.js');
const { makeId } = require('./utils.js');

const clientRooms = {};
const state = {};

io.on('connection', client => {        // setting up the event listener for the connection event and when the client is connected to server the lsitener emits init event and passing the data.
    // const state = createGameState();
    // startGameInterval(state);
    client.on('keydown', handleKeydown)
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];
        if (!roomName) {
         return;
        }
        try {
            keyCode = parseInt(keyCode);
        } catch (e) {
            console.error(e);
            return;
        }
        const vel = getUpdatedVelocity(keyCode);
        if(vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
        // startGameInterval(state);
        // function startGameInterval(state) {
        //     const intervalId = setInterval(() => {
        //         // console.log('helo in room ', roomName);
        //         console.log('inetrval')
        //         const winner = gameLoop(state);
        //         if(!winner) 
        //         // client.emit('gameState', state );
        //         emitGameState(roomName, state[roomName]);
        //         else {
        //             // client.emit('gameOver');
        //             emitGameOver(roomName, winner);
        //             state[roomName] = null;
        //             clearInterval(intervalId);
        //         }
        //     }, 1000 / FRAME_RATE);
        // }

    
    
    function handleJoinGame(gameCode) {
        console.log('helno');
        const roomSize = io.sockets.adapter.rooms.get(gameCode).size;
        if(roomSize == 0) {
            client.emit('unknownGame');
            return;
        }
        else if(roomSize > 1) {
            client.emit('tooManyPlayers');
            return;
        }
        clientRooms[client.id] = gameCode;
        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);
        
        startGameInterval(gameCode);
    }

    function handleNewGame() {
        console.log('faltu');
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        console.log("roomname=", roomName);
        // console.log("")
        client.emit('gameCode', roomName);
        state[roomName] = initGame();
        console.log("state = ", state);
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }
})

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        // console.log('helo in room ', roomName);
        console.log('inetrval')
        const winner = gameLoop(state[roomName]);
        if(!winner) 
        // client.emit('gameState', state );
        emitGameState(roomName, state[roomName]);
        else {
            // client.emit('gameOver');
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}


function emitGameState(room, gameState) {
    // Send this event to everyone in the room.
    console.log("emitgamestate called in room");
    io.sockets.in(room)
      .emit('gameState', JSON.stringify(gameState));
  }

  function emitGameOver(room, winner) {
    io.to(room)
      .emit('gameOver', JSON.stringify({ winner }));
  }


io.listen(3000);