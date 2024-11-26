const gameArea = document.getElementById('game-area');
const player = document.getElementById('player');
const startGameButton = document.getElementById('start-game-btn');
const preGamePopup = document.getElementById('pre-game-popup');
const pauseButton = document.getElementById('pause-button');
const scoreDisplay = document.getElementById('score');
const countdownDisplay = document.getElementById('countdown');
const gameOverMessage = document.getElementById('game-over');

let gameWidth = gameArea.offsetWidth;
let gameHeight = gameArea.offsetHeight;
let playerX = gameWidth / 2 - 20;
const playerSpeed = 5;
let isGameOver = false;
let fallingObjects = [];
let isPaused = false;
let score = 0;
let countdownTime = 3;

let gameIntervals = {
    fallingObjectInterval: null,
    countdownInterval: null,
    objectMoveIntervals: [],
};

startGameButton.addEventListener('click', () => {
    preGamePopup.style.display = 'none';
    startGame();
});

pauseButton.addEventListener('click', () => {
    if (isGameOver) return;

    if (isPaused) {
        resumeGame();
    } else {
        pauseGame();
    }
});

function stopAllIntervals() {
    clearInterval(gameIntervals.fallingObjectInterval);
    clearInterval(gameIntervals.countdownInterval);
    gameIntervals.objectMoveIntervals.forEach(clearInterval);
}

function pauseGame() {
    isPaused = true;
    pauseButton.textContent = 'Resume';
    scoreDisplay.classList.add('highlight');
    stopAllIntervals();
    startCountdown();
}

function startCountdown() {
    countdownTime = 3;
    countdownDisplay.textContent = countdownTime;
    countdownDisplay.classList.remove('hidden');

    gameIntervals.countdownInterval = setInterval(() => {
        countdownTime--;
        countdownDisplay.textContent = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(gameIntervals.countdownInterval);
            countdownDisplay.classList.add('hidden');
            resumeGame();
        }
    }, 1000);
}

function resumeGame() {
    isPaused = false;
    pauseButton.textContent = 'Pause';
    scoreDisplay.classList.remove('highlight');
    gameIntervals.fallingObjectInterval = setInterval(createFallingObject, 1000);
    fallingObjects.forEach((object) => moveFallingObject(object));
}

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

let touchStartX = 0;

gameArea.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener('touchmove', (e) => {
    if (isGameOver || isPaused) return;

    const touchEndX = e.touches[0].clientX;
    const moveX = touchEndX - touchStartX;

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

function createFallingObject() {
    if (isPaused || isGameOver) return;

    const object = document.createElement('div');
    object.classList.add('falling-object');
    object.style.left = Math.random() * (gameWidth - 30) + 'px';
    gameArea.appendChild(object);

    const fallingObject = { element: object, position: 0, interval: null };
    fallingObjects.push(fallingObject);
    moveFallingObject(fallingObject);
}

function checkCollision(object) {
    const playerRect = player.getBoundingClientRect();
    const objectRect = object.element.getBoundingClientRect();

    return !(playerRect.right < objectRect.left ||
        playerRect.left > objectRect.right ||
        playerRect.bottom < objectRect.top ||
        playerRect.top > objectRect.bottom);
}

function moveFallingObject(fallingObject) {
    fallingObject.interval = setInterval(() => {
        if (isPaused || isGameOver) {
            clearInterval(fallingObject.interval);
            return;
        }

        fallingObject.position += 5;
        fallingObject.element.style.top = `${fallingObject.position}px`;

        if (checkCollision(fallingObject)) {
            gameOver();
            return;
        }

        if (fallingObject.position > gameHeight) {
            fallingObject.element.remove();
            clearInterval(fallingObject.interval);
            fallingObjects = fallingObjects.filter((obj) => obj !== fallingObject);
        }
    }, 50);

    gameIntervals.objectMoveIntervals.push(fallingObject.interval);
}

function startGame() {
    score = 0;
    scoreDisplay.textContent = `Score: ${score}`;
    isGameOver = false;
    fallingObjects = [];
    playerX = gameWidth / 2 - 20;
    player.style.left = `${playerX}px`;
    gameIntervals.fallingObjectInterval = setInterval(createFallingObject, 1000);
    updateScore();
}

function updateScore() {
    if (isGameOver || isPaused) return;

    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    setTimeout(updateScore, 1000);
}

function gameOver() {
    isGameOver = true;
    stopAllIntervals();
    fallingObjects.forEach((obj) => obj.element.remove());
    gameOverMessage.innerHTML = `Game Over! <br> Score: ${score} <br><button id="reset-button">Restart</button>`;
    gameOverMessage.classList.remove('hidden');

    document.getElementById('reset-button').addEventListener('click', resetGame);
}

function resetGame() {
    gameOverMessage.classList.add('hidden');
    startGame();
}
