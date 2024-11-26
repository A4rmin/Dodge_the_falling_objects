const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const resetButton = document.getElementById('reset-button');
const gameOverMessage = document.getElementById('game-over');
const startGameButton = document.getElementById('start-game-btn');
const preGamePopup = document.getElementById('pre-game-popup');
const pauseButton = document.getElementById('pause-button'); // Pause button

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 5;  // Lower speed for smoother control
let isGameOver = false;
let fallingObjects = [];
let isPaused = false; // Pause state
let fallingObjectInterval; // Store falling object creation interval

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
    pauseButton.textContent = 'Resume';  // Change button text to "Resume"
    clearInterval(fallingObjectInterval);  // Stop creating new falling objects
    fallingObjects.forEach((object) => clearInterval(object.interval)); // Stop moving objects
}

// Resume the game
function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause';  // Change button text to "Pause"
    fallingObjectInterval = setInterval(createFallingObject, 1000);  // Resume creating new objects
    fallingObjects.forEach((object) => moveFallingObject(object));  // Resume object movements
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

// Touch controls for mobile (smoother control with resistance)
let touchStartX = 0;
let touchEndX = 0;

gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX; // Record touch start position
});

gameArea.addEventListener('touchmove', (e) => {
    if (isGameOver || isPaused) return;

    touchEndX = e.touches[0].clientX; // Record touch move position

    let moveX = touchEndX - touchStartX;
    if (Math.abs(moveX) > 10) {  // Add a threshold to make the movement smoother
        if (moveX > 0 && playerX < gameWidth - 40) { // Move right
            playerX += playerSpeed;
        } else if (moveX < 0 && playerX > 0) { // Move left
            playerX -= playerSpeed;
        }
        player.style.left = playerX + 'px'; // Update player position
        touchStartX = touchEndX; // Reset touch start position for smoother movement
    }

    // Prevent scrolling during touchmove
    e.preventDefault();
});

// Create falling object
function createFallingObject() {
    if (isPaused || isGameOver) return; // Prevent creating objects when paused or game over

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
            clearInterval(fallingObject.interval);  // Stop falling if paused or game over
            return;
        }

        objectY += 5;
        fallingObject.position = objectY; // Update the position
        fallingObject.element.style.top = objectY + 'px';

        // Check for collision
        if (checkCollision(fallingObject)) {
            isGameOver = true;
            gameOverMessage.classList.remove('hidden');
            fallingObjects.forEach((obj) => clearInterval(obj.interval)); // Stop all falling objects
            return;
        }

        // Remove falling object if it goes out of bounds
        if (objectY > gameHeight) {
            fallingObject.element.remove();
            clearInterval(fallingObject.interval);
        }
    }, 50);
}

// Function to start the game
function startGame() {
    fallingObjectInterval = setInterval(createFallingObject, 1000); // Create new object every second
}

// Reset game function
function resetGame() {
    isGameOver = false;
    gameOverMessage.classList.add('hidden');
    fallingObjects.forEach(obj => obj.element.remove()); // Remove all falling objects
    fallingObjects = [];
    playerX = gameWidth / 2 - 20; // Reset player position
    player.style.left = playerX + 'px';
    startGame();
}

// Add event listener to the reset button
resetButton.addEventListener('click', () => {
    resetGame();
});
