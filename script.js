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
    // Stop all falling objects
    fallingObjects.forEach((object) => clearInterval(object.interval));
}

// Resume the game
function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause';  // Change button text to "Pause"
    // Restart falling objects creation
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

// Touch controls for mobile (smoother control)
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
    const object = document.createElement('div');
    object.classList.add('falling-object');
    object.style.left = Math.random() * (gameWidth - 30) + 'px';
    gameArea.appendChild(object);
    fallingObjects.push(object);
    moveFallingObject(object);
}

// Check for collision between player and falling objects
function checkCollision(object) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = object.getBoundingClientRect();

    return !(playerRect.right < objectRect.left ||
        playerRect.left > objectRect.right ||
        playerRect.bottom < objectRect.top ||
        playerRect.top > objectRect.bottom);
}

// Move falling objects
function moveFallingObject(object) {
    let objectY = 0;
    object.interval = setInterval(() => {
        if (isPaused || isGameOver) {
            clearInterval(object.interval);  // Stop falling if paused or game over
            return;
        }

        objectY += 5;
        object.style.top = objectY + 'px';

        // Check for collision
        if (checkCollision(object)) {
            isGameOver = true;
            gameOverMessage.classList.remove('hidden');
            clearInterval(object.interval);
            return;
        }

        // Remove falling object if it goes out of bounds
        if (objectY > gameHeight) {
            object.remove();
            clearInterval(object.interval);
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
    fallingObjects.forEach(obj => obj.remove()); // Remove all falling objects
    fallingObjects = [];
    playerX = gameWidth / 2 - 20; // Reset player position
    player.style.left = playerX + 'px';
    startGame();
}

// Add event listener to the reset button
resetButton.addEventListener('click', () => {
    resetGame();
});
