// Global Error and Rejection Handlers
window.addEventListener('error', (event) => {
    console.error('Error occurred:', event.message);
    alert('An unexpected error occurred. Please reload the game.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    alert('A technical issue occurred. Please try again.');
});

// Element References
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
    isCountdownActive: false,
    score: 0,
    playerX: 0,
    fallingObjects: [],
    lastSpawnTime: 0,
    lastUpdateTime: 0,
    countdown: 3,
};

const playerSpeed = 10;
const objectFallSpeed = 5;
const spawnInterval = 1200;

// Position player initially
gameState.playerX = gameArea.offsetWidth / 2 - player.offsetWidth / 2;
player.style.left = `${gameState.playerX}px`;

// Utility to update score
function updateScore() {
    scoreDisplay.textContent = `Score: ${gameState.score}`;
}

// Countdown Function
function startCountdown() {
    if (gameState.isCountdownActive) return; // Prevent multiple countdowns
    gameState.isCountdownActive = true;
    gameState.countdown = 3;
    countdownDisplay.textContent = gameState.countdown;
    countdownDisplay.classList.remove('hidden');

    const countdownInterval = setInterval(() => {
        gameState.countdown--;
        countdownDisplay.textContent = gameState.countdown;

        if (gameState.countdown <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden');
            gameState.isCountdownActive = false;
            startGame();
        }
    }, 1000);
}

// Game Start
function startGame() {
    console.log('Game Started!');
    gameState.score = 0; // Reset score
    updateScore();
    gameState.isRunning = true;
    gameState.isGameOver = false;
    gameState.fallingObjects = [];
    gameLoop();
}


// Main Game Loop (within the game loop, we will move the player based on the key states)
function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused || gameState.isGameOver) return;

    const now = Date.now();
    if (!gameState.lastUpdateTime) gameState.lastUpdateTime = now;
    const deltaTime = now - gameState.lastUpdateTime;
    gameState.lastUpdateTime = now;

    // Move player based on key state (continuous movement)
    if (keyState.left && gameState.playerX > 0) {
        gameState.playerX -= playerSpeed;
    } else if (keyState.right && gameState.playerX < gameArea.offsetWidth - player.offsetWidth) {
        gameState.playerX += playerSpeed;
    }

    //Spawn falling objects
    if (now - gameState.lastSpawnTime >= spawnInterval) {
        createFallingObject();
        gameState.lastSpawnTime = now;
    }

    // Update falling objects
    gameState.fallingObjects.forEach((fallingObject) => {
        moveFallingObject(fallingObject, deltaTime);
    });

    // Update player position
    player.style.left = `${gameState.playerX}px`;

    // Handle Pause/Resume if Escape key is pressed
    if (keyState.escape) {
        keyState.escape = false; // Prevent multiple toggle on a single press
        if (gameState.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }

    // Continue the game loop
    gameLoopRequest = requestAnimationFrame(gameLoop);
}

// Create Falling Objects
function createFallingObject() {
    const object = document.createElement('div');
    object.classList.add('falling-object');
    object.style.left = `${Math.random() * (gameArea.offsetWidth - 30)}px`;
    gameArea.appendChild(object);
    gameState.fallingObjects.push({ element: object, position: 0 });
}

// Move Falling Objects
function moveFallingObject(fallingObject, deltaTime) {
    fallingObject.position += objectFallSpeed * (deltaTime / 16); // Normalize to 60 FPS
    fallingObject.element.style.top = `${fallingObject.position}px`;

    if (checkCollision(fallingObject)) {
        gameOver();
    }

    if (fallingObject.position > gameArea.offsetHeight) {
        gameState.score++;
        updateScore();
        fallingObject.element.remove();
        gameState.fallingObjects = gameState.fallingObjects.filter((obj) => obj !== fallingObject);
    }
}

// Collision Detection
function checkCollision(fallingObject) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = fallingObject.element.getBoundingClientRect();

    return !(playerRect.right < objectRect.left ||
        playerRect.left > objectRect.right ||
        playerRect.bottom < objectRect.top ||
        playerRect.top > objectRect.bottom);
}

// Pause and Resume Game
pauseButton.addEventListener('click', () => {
    if (gameState.isGameOver) return;

    if (gameState.isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
});

function pauseGame() {
    gameState.isPaused = true;
    pauseButton.textContent = 'Resume';
    cancelAnimationFrame(gameLoopRequest);
}

function resumeGame() {
    gameState.isPaused = false;
    pauseButton.textContent = 'Pause';
    gameState.lastUpdateTime = Date.now(); // Adjust for pause duration
    gameLoop();
}

// Game Over
function gameOver() {
    console.log('Game Over!');
    gameState.isRunning = false;
    gameState.isGameOver = true;

    gameState.fallingObjects.forEach((obj) => obj.element.remove());
    gameOverMessage.innerHTML = `Game Over!<br>Score: ${gameState.score}<br>`;
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Restart';
    resetButton.onclick = resetGame;
    gameOverMessage.appendChild(resetButton);
    gameOverMessage.classList.remove('hidden');
}

// Reset Game
function resetGame() {
    cancelAnimationFrame(gameLoopRequest);
    gameState = {
        ...gameState,
        isRunning: false,
        isPaused: false,
        isGameOver: false,
        score: 0,
        fallingObjects: [],
    };
    gameOverMessage.classList.add('hidden');
    updateScore();
    startCountdown();
}

// Key Control Variables
const keyState = {
    left: false,
    right: false,
    escape: false,
};

// Define key codes for ease of reference
const KEY_LEFT = 'ArrowLeft';
const KEY_RIGHT = 'ArrowRight';
const KEY_ESCAPE = 'Escape';

// Listen for keydown events
document.addEventListener('keydown', (e) => {
    if (gameState.isPaused || !gameState.isRunning) return;
    // Prevent default browser actions for certain keys
    if (e.key === KEY_LEFT || e.key === KEY_RIGHT || e.key === KEY_ESCAPE) {
        e.preventDefault();
    }

    // Update key state when a key is pressed
    if (e.key === KEY_LEFT) {
        keyState.left = true;
    } else if (e.key === KEY_RIGHT) {
        keyState.right = true;
    } else if (e.key === KEY_ESCAPE) {
        keyState.escape = true;
    }
});

// Listen for keyup events to stop movement
document.addEventListener('keyup', (e) => {
    if (e.key === KEY_LEFT) {
        keyState.left = false;
    } else if (e.key === KEY_RIGHT) {
        keyState.right = false;
    } else if (e.key === KEY_ESCAPE) {
        keyState.escape = false;
    }
});

// Touch Control Variables
let touchStartX = 0;
let touchMoveX = 0;
let isTouching = false; // Flag to check if the user is touching

// Define a threshold for movement (in pixels)
const MOVE_THRESHOLD = 10; // Minimum movement to register a change in position
const DEBOUNCE_TIME = 50;  // Debounce time in milliseconds (to limit movement frequency)
let lastMoveTime = 0;      // Store the last time movement happened

// Touch Start Event
gameArea.addEventListener('touchstart', (e) => {
    // Prevent default scrolling behavior on touch devices
    e.preventDefault();

    // Only handle the first touch point
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        isTouching = true;  // User has started touching the screen
    }
});

// Touch Move Event
gameArea.addEventListener('touchmove', (e) => {
    // Prevent default scrolling behavior on touch devices
    e.preventDefault();

    if (!isTouching || e.touches.length !== 1) return; // Only handle one touch point

    // Update touch position (horizontal) as the user moves their finger
    touchMoveX = e.touches[0].clientX;

    // Calculate the difference between the starting touch position and current touch position
    const touchDifference = touchMoveX - touchStartX;

    // Only move the player if the touch moved a significant distance (threshold) and the debounce time has passed
    const now = Date.now();
    if (Math.abs(touchDifference) > MOVE_THRESHOLD && now - lastMoveTime > DEBOUNCE_TIME) {
        // Move the player based on the difference in touch position
        if (touchDifference > 0 && gameState.playerX < gameArea.offsetWidth - player.offsetWidth) {
            gameState.playerX += playerSpeed; // Move right
        } else if (touchDifference < 0 && gameState.playerX > 0) {
            gameState.playerX -= playerSpeed; // Move left
        }

        // Update the player's position on the screen
        player.style.left = `${gameState.playerX}px`;

        // Update the last move time
        lastMoveTime = now;

        // Optionally, update touchStartX to ensure continuous movement
        touchStartX = touchMoveX;
    }
});

// Touch End Event
gameArea.addEventListener('touchend', () => {
    isTouching = false; // User stopped touching
});

// Optional: Handle touch cancel (if the user removes a finger from the screen)
gameArea.addEventListener('touchcancel', () => {
    isTouching = false; // Reset the touch state
});


// Touch End Event (optional)
// You can handle any cleanup or logic when the touch ends, but it's not always needed for simple movements.
gameArea.addEventListener('touchend', () => {
    // Example cleanup if needed
});


// Start Game Button
startGameButton.addEventListener('click', () => {
    preGamePopup.style.display = 'none';
    startCountdown();
});
