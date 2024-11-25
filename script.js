const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 10;
let isGameOver = false;
let fallingObjects = [];

// Prevent arrow keys from moving the cursor
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;

    if (e.key === 'ArrowLeft' && playerX > 0) {
        playerX -= playerSpeed;
    } else if (e.key === 'ArrowRight' && playerX < gameWidth - 40) {
        playerX += playerSpeed;
    }
    player.style.left = playerX + 'px'; // Update player position
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
            document.getElementById('game-over').classList.remove('hidden');
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

startGame();
