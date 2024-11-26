const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const startGameButton = document.getElementById('start-game-btn');
const preGamePopup = document.getElementById('pre-game-popup');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');
const countdownDisplay = document.getElementById('countdown');
const gameOverMessage = document.getElementById('game-over');

let gameState = {
    isRunning: false,
    isPaused: false,
    isGameOver: false,
    isCountdownActive: false,  // New flag to block actions during countdown
    score: 0,
    playerX: gameArea.offsetWidth / 2 - 20,
    fallingObjects: [],
    lastSpawnTime: 0,
    lastUpdateTime: 0,
    countdown: 3,
};

const playerSpeed = 10; // Increased player speed
const objectFallSpeed = 2; // Slower falling speed
const spawnInterval = 1000; // Time between spawns (ms)

// Adjust player initial position
player.style.left = `${gameState.playerX}px`;

// Event Listeners
startGameButton.addEventListener('click', () => {
    preGamePopup.style.display = 'none';
    startCountdown();
});

// Pause/Resume button logic
pauseButton.addEventListener('click', () => {
    if (gameState.isGameOver) return;

    if (gameState.isPaused) {
        // If game is paused, resume the game
        gameState.isPaused = false;
        pauseButton.textContent = 'Pause';
        startCountdown(); // Show countdown before resuming
    } else {
        // If game is running, pause it
        gameState.isPaused = true;
        pauseButton.textContent = 'Resume';
        countdownDisplay.classList.add('hidden'); // Hide countdown when paused
    }
});

// Start the countdown
function startCountdown() {
    // Ensure we block game actions during countdown
    gameState.isCountdownActive = true;
    gameState.countdown = 3; // Set countdown to 3 seconds
    countdownDisplay.textContent = gameState.countdown; // Show countdown
    countdownDisplay.classList.remove('hidden'); // Make countdown visible

    // Countdown interval logic
    const countdownInterval = setInterval(() => {
        gameState.countdown--;
        countdownDisplay.textContent = gameState.countdown;

        if (gameState.countdown <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden'); // Hide countdown after it ends
            gameState.isCountdownActive = false; // Countdown has finished
            startGame(); // Start the game after countdown ends
        }
    }, 1000);
}

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!gameState.isRunning || gameState.isPaused || gameState.isCountdownActive) return;  // Block player movement during countdown
    if (e.key === 'ArrowLeft' && gameState.playerX > 0) {
        gameState.playerX -= playerSpeed;
    } else if (e.key === 'ArrowRight' && gameState.playerX < gameArea.offsetWidth - 40) {
        gameState.playerX += playerSpeed;
    }
    player.style.left = `${gameState.playerX}px`;
    e.preventDefault();
});

// Touch Controls
let touchStartX = 0;
gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});
gameArea.addEventListener('touchmove', (e) => {
    if (!gameState.isRunning || gameState.isPaused || gameState.isCountdownActive) return;  // Block player movement during countdown
    const touchEndX = e.touches[0].clientX;
    const moveX = touchEndX - touchStartX;

    if (moveX > 10 && gameState.playerX < gameArea.offsetWidth - 40) {
        gameState.playerX += playerSpeed;
    } else if (moveX < -10 && gameState.playerX > 0) {
        gameState.playerX -= playerSpeed;
    }
    player.style.left = `${gameState.playerX}px`;
    touchStartX = touchEndX;
    e.preventDefault();
});

let gameLoopRequest; // Variable to store the animation frame request
let pauseTimeElapsed = 0; // Track how much time has passed during pause

function gameLoop() {
    if (!gameState.isRunning || gameState.isGameOver) return;

    const now = Date.now();
    const deltaTime = now - gameState.lastUpdateTime;
    gameState.lastUpdateTime = now;

    if (gameState.isPaused) {
        pauseTimeElapsed += deltaTime; // Accumulate time during pause
        return;  // Skip logic if game is paused
    }

    // Spawn falling objects at intervals
    if (now - gameState.lastSpawnTime >= spawnInterval) {
        createFallingObject();
        gameState.lastSpawnTime = now;
    }

    // Move falling objects and check collisions
    gameState.fallingObjects.forEach((fallingObject) => {
        moveFallingObject(fallingObject, deltaTime);
    });

    // Request next animation frame
    gameLoopRequest = requestAnimationFrame(gameLoop);
}
// Create falling objects
function createFallingObject() {
    const object = document.createElement('div');
    object.classList.add('falling-object');
    object.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    gameArea.appendChild(object);

    const fallingObject = { element: object, position: 0 };
    gameState.fallingObjects.push(fallingObject);
}


// Move falling objects (with updated logic to handle delta time correctly)
function moveFallingObject(fallingObject, deltaTime) {
    fallingObject.position += objectFallSpeed * (deltaTime / 100); // Fall speed adjusted by deltaTime (in seconds)
    fallingObject.element.style.top = `${fallingObject.position}px`;

    if (checkCollision(fallingObject)) {
        gameOver();  // Trigger game over if collision occurs
    }

    // Increase score if the object passes the bottom of the screen
    if (fallingObject.position > gameArea.offsetHeight) {
        gameState.score++;
        scoreDisplay.textContent = `Score: ${gameState.score}`;
        fallingObject.element.remove();
        gameState.fallingObjects = gameState.fallingObjects.filter((obj) => obj !== fallingObject);
    }
}

// Collision detection
function checkCollision(fallingObject) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = fallingObject.element.getBoundingClientRect();

    return !(playerRect.right < objectRect.left ||
        playerRect.left > objectRect.right ||
        playerRect.bottom < objectRect.top ||
        playerRect.top > objectRect.bottom);
}

// Starting the game
function startGame() {
    gameState.score = 0; // Reset score
    scoreDisplay.textContent = `Score: ${gameState.score}`; // Update score display
    gameState.isRunning = true; // Set the game as running
    gameState.isGameOver = false; // Game is not over
    gameState.fallingObjects = []; // Clear falling objects
    gameState.playerX = gameArea.offsetWidth / 2 - 20; // Reset player position
    player.style.left = `${gameState.playerX}px`;

    gameLoop(); // Start the game loop
}

// Pause game
function pauseGame() {
    gameState.isPaused = true;
    pauseButton.textContent = 'Resume';
    countdownDisplay.classList.add('hidden'); // Hide countdown when paused
}

// Resume game after pause
function resumeGame() {
    gameState.isPaused = false;
    pauseButton.textContent = 'Pause';
    countdownDisplay.classList.add('hidden'); // Hide countdown when resumed

    // Adjust falling objects to continue from where they were
    gameState.fallingObjects.forEach((fallingObject) => {
        fallingObject.position += (pauseTimeElapsed / 1000) * objectFallSpeed; // Adjust position based on time elapsed during pause
    });

    pauseTimeElapsed = 0; // Reset pause time elapsed

    gameState.lastUpdateTime = Date.now();  // Reset last update time to avoid jump
    if (!gameLoopRequest) {  // If there's no active game loop, start it
        gameLoop();  // Resume game loop
    }
}

// Game Over
function gameOver() {
    gameState.isGameOver = true;
    gameState.isRunning = false;
    gameState.fallingObjects.forEach((obj) => obj.element.remove());
    gameOverMessage.innerHTML = `Game Over! <br> Score: ${gameState.score} <br><button id="reset-button">Restart</button>`;
    gameOverMessage.classList.remove('hidden');

    document.getElementById('reset-button').addEventListener('click', resetGame);
}

// Reset the game
function resetGame() {
    gameOverMessage.classList.add('hidden');
    startGame();
}
