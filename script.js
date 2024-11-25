const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const resetButton = document.getElementById('reset-button');
const gameOverMessage = document.getElementById('game-over');

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 10;
let isGameOver = false;
let fallingObjects = [];

// Prevent default browser action for arrow keys (to prevent cursor movement)
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;

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
    touchStartX = e.touches[0].clientX; // Record touch start position
});

gameArea.addEventListener('touchmove', (e) => {
    if (isGameOver) return;

    touchEndX = e.touches[0].clientX; // Record touch move position

    // Smoothly move the player based on touch position
    let moveX = touchEndX - touchStartX;
    if (moveX > 0 && playerX < gameWidth) { // Move right
        playerX += playerSpeed;
    } else if (moveX < 0 && playerX > 0) { // Move left
        playerX -= playerSpeed;
    }

    // Update player position smoothly
    player.style.left = playerX + 'px' / 2;

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
    return object;
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
    const fallInterval = setInterval(() => {
        if (isGameOver) {
            clearInterval(fallInterval);
            return;
        }

        objectY += 5;
        object.style.top = objectY + 'px';

        // Check for collision
        if (checkCollision(object)) {
            isGameOver = true;
            gameOverMessage.classList.remove('hidden');
            clearInterval(fallInterval);
            return;
        }

        // Remove falling object if it goes out of bounds
        if (objectY > gameHeight) {
            object.remove();
            clearInterval(fallInterval);
        }
    }, 50);
}

// Function to start the game
function startGame() {
    setInterval(() => {
        if (isGameOver) return;

        const object = createFallingObject();
        moveFallingObject(object);
    }, 1000); // Create new object every second
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

startGame();
