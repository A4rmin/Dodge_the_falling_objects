const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const resetButton = document.getElementById('reset-button');
const gameOverMessage = document.getElementById('game-over');
const startGameButton = document.getElementById('start-game-btn');
const preGamePopup = document.getElementById('pre-game-popup');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');
const countdownDisplay = document.getElementById('countdown');

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 5;
let isGameOver = false;
let fallingObjects = [];
let isPaused = false;
let fallingObjectInterval;
let score = 0;
let countdownInterval;
let countdownTime = 3;

// Hide the instructions popup when game starts
startGameButton.addEventListener('click', () => {
    preGamePopup.style.display = 'none';
    startGame();
});

// Toggle pause state
pauseButton.addEventListener('click', () => {
    if (isGameOver) return;

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
});

// Pause the game
function pauseGame() {
    isPaused = true;
    pauseButton.textContent = 'Resume';
    scoreDisplay.classList.add('highlight'); // Highlight score when paused
    clearInterval(fallingObjectInterval);
    fallingObjects.forEach((object) => clearInterval(object.interval));
    startCountdown();
}

// Start countdown before resuming the game
function startCountdown() {
    countdownTime = 3;
    countdownDisplay.textContent = countdownTime;
    countdownDisplay.classList.remove('hidden');

    countdownInterval = setInterval(() => {
        countdownTime--;
        countdownDisplay.textContent = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden');
            resumeGame();
        }
    }, 1000);
}

// Resume the game
function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause';
    scoreDisplay.classList.remove('highlight'); // Remove highlight
    fallingObjectInterval = setInterval(createFallingObject, 1000);
    fallingObjects.forEach((object) => moveFallingObject(object));
}

// Prevent default browser action for arrow keys (to prevent cursor movement)
document.addEventListener('keydown', (e) => {
    if (isGameOver || isPaused) return;

    if (e.key === 'ArrowLeft' && playerX > 0) {
        playerX -= playerSpeed;
    } else if (e.key === 'ArrowRight' && playerX < gameWidth - 40) {
        playerX += playerSpeed;
    }
    player.style.left = playerX + 'px';
    e.preventDefault();
});

// Touch controls for mobile
let touchStartX = 0;
let touchEndX = 0;

gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
    if (isGameOver || isPaused) return;

    touchEndX = e.touches[0].clientX;
    let moveX = touchEndX - touchStartX;

    if (Math.abs(moveX) > 10) {
        if (moveX > 0 && playerX < gameWidth - 40) {
            playerX += playerSpeed;
        } else if (moveX < 0 && playerX > 0) {
            playerX -= playerSpeed;
        }
        player.style.left = playerX + 'px';
        touchStartX = touchEndX;
    }

    e.preventDefault();
});

// Create falling object
function createFallingObject() {
    if (isPaused || isGameOver) return;

    const object = document.createElement('div');
    object.classList.add('falling-object');
    object.style.left = Math.random() * (gameWidth - 30) + 'px';
    gameArea.appendChild(object);
    fallingObjects.push({ element: object, position: 0, interval: null });
    moveFallingObject(fallingObjects[fallingObjects.length - 1]);
}

// Check for collision between player and falling objects
function checkCollision(object) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = object.element.getBoundingClientRect();

    return !(playerRect.right < objectRect.left ||
        playerRect.left > objectRect.right ||
        playerRect.bottom < objectRect.top ||
        playerRect.top > objectRect.bottom);
}

// Move falling objects
function moveFallingObject(fallingObject) {
    let objectY = fallingObject.position;
    fallingObject.interval = setInterval(() => {
        if (isPaused || isGameOver) {
            clearInterval(fallingObject.interval);
            return;
        }

        objectY += 5;
        fallingObject.position = objectY;
        fallingObject.element.style.top = objectY + 'px';

        if (checkCollision(fallingObject)) {
            gameOver();
            return;
        }

        if (objectY > gameHeight) {
            fallingObject.element.remove();
            clearInterval(fallingObject.interval);
        }
    }, 50);
}

// Function to start the game
function startGame() {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    fallingObjectInterval = setInterval(createFallingObject, 1000);
    updateScore();
}

// Update score function
function updateScore() {
    if (isGameOver || isPaused) return;
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    setTimeout(updateScore, 1000);
}

// Game over function
function gameOver() {
    isGameOver = true;
    gameOverMessage.classList.remove('hidden');
    gameOverMessage.innerHTML = `Game Over! <br> Score: ${score} <br><button id="reset-button">Restart</button>`;

    document.getElementById('reset-button').addEventListener('click', resetGame);

    fallingObjects.forEach((obj) => clearInterval(obj.interval));
}

// Reset game function
function resetGame() {
    isGameOver = false;
    gameOverMessage.classList.add('hidden');
    fallingObjects.forEach((obj) => obj.element.remove());
    fallingObjects = [];
    playerX = gameWidth / 2 - 20;
    player.style.left = playerX + 'px';
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    startGame();
}

// Highlight score when game is paused
function highlightScore() {
    scoreDisplay.classList.add('highlight');
}
