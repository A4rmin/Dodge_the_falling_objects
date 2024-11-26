const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const resetButton = document.getElementById('reset-button');
const gameOverMessage = document.getElementById('game-over');
const startGameButton = document.getElementById('start-game-btn');
const preGamePopup = document.getElementById('pre-game-popup');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score'); // Add an element to display score
const countdownDisplay = document.getElementById('countdown'); // Add an element for countdown

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 5;
let isGameOver = false;
let fallingObjects = [];
let isPaused = false;
let fallingObjectInterval;
let score = 0; // Initialize the score variable
let countdownInterval; // To handle countdown
let countdownTime = 3; // 3-second countdown before resume

// Hide the instructions popup when game starts
startGameButton.addEventListener('click', () => {
    preGamePopup.style.display = 'none';
    startGame();
});

// Toggle pause state
pauseButton.addEventListener('click', () => {
    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
});

// Pause the game
function pauseGame() {
    isPaused = true;
    pauseButton.textContent = 'Resume'; // Change button text to "Resume"
    clearInterval(fallingObjectInterval); // Stop creating new falling objects
    fallingObjects.forEach((object) => clearInterval(object.interval)); // Stop moving objects
    startCountdown(); // Start countdown before resuming
}

// Start countdown before resuming the game
function startCountdown() {
    countdownDisplay.textContent = countdownTime; // Display the countdown time
    countdownDisplay.classList.remove('hidden'); // Show countdown

    countdownInterval = setInterval(() => {
        countdownTime--;
        countdownDisplay.textContent = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden'); // Hide countdown after it ends
            resumeGame(); // Resume the game after countdown
        }
    }, 1000);
}

// Resume the game
function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause'; // Change button text back to "Pause"
    fallingObjectInterval = setInterval(createFallingObject, 1000); // Resume creating new objects
    fallingObjects.forEach((object) => moveFallingObject(object)); // Resume object movements
}

// Prevent default browser action for arrow keys (to prevent cursor movement)
document.addEventListener('keydown', (e) => {
    if (isGameOver || isPaused) return;

    if (e.key === 'ArrowLeft' && playerX > 0) {
        playerX -= playerSpeed;
    } else if (e.key === 'ArrowRight' && playerX < gameWidth - 40) {
        playerX += playerSpeed;
    }
    player.style.left = playerX + 'px'; // Update player position
    e.preventDefault(); // Prevent default browser behavior like scroll or cursor movement
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
        if (moveX > 0 && playerX < gameWidth - 40) { // Move right
            playerX += playerSpeed;
        } else if (moveX < 0 && playerX > 0) { // Move left
            playerX -= playerSpeed;
        }
        player.style.left = playerX + 'px';
        touchStartX = touchEndX; // Reset touch start position for smoother movement
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
            isGameOver = true;
            gameOverMessage.classList.remove('hidden');
            fallingObjects.forEach((obj) => clearInterval(obj.interval)); // Stop all falling objects
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
    score = 0; // Reset score when starting a new game
    scoreDisplay.textContent = score; // Update score display
    fallingObjectInterval = setInterval(createFallingObject, 1000); // Create new object every second
    updateScore(); // Start updating the score every second
}

// Update score function
function updateScore() {
    if (isGameOver || isPaused) return;
    score++;
    scoreDisplay.textContent = score; // Update score on screen
    setTimeout(updateScore, 1000); // Update score every second
}

// Reset game function
function resetGame() {
    isGameOver = false;
    gameOverMessage.classList.add('hidden');
    fallingObjects.forEach(obj => obj.element.remove());
    fallingObjects = [];
    playerX = gameWidth / 2 - 20;
    player.style.left = playerX + 'px';
    score = 0;
    scoreDisplay.textContent = score;
    startGame();
}

// Add event listener to the reset button
resetButton.addEventListener('click', () => {
    resetGame();
});
