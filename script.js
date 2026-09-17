const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let gameOver = false;
let score = 0;
let bestScore = Number(localStorage.getItem('flappyBirdBestScore')) || 0;
let animationFrame = 0;
let clouds = [];

const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.3,
    jump: -7
};

let pipes = [];
const pipeWidth = 60;
const pipeGap = 250;
const pipeSpeed = 2;
const pipeFrequency = 600;

const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const gameOverScreen = document.getElementById('gameOverScreen');

bestScoreEl.textContent = bestScore;
document.getElementById('bestScoreFinal').textContent = bestScore;

function initClouds() {
    return [
        { x: 30, y: 80, speed: 0.25, scale: 1.2 },
        { x: 180, y: 120, speed: 0.4, scale: 1.4 },
        { x: 330, y: 90, speed: 0.35, scale: 0.95 },
        { x: 430, y: 150, speed: 0.5, scale: 1.1 }
    ];
}

function animateScore() {
    scoreEl.classList.remove('score-pop');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-pop');
}

function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    bird.y = 300;
    bird.velocity = 0;
    pipes = [];
    animationFrame = 0;

    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'inline-block';
    gameOverScreen.style.display = 'none';
    scoreEl.textContent = score;
    animateScore();
    gameLoop();
}

function restartGame() {
    startGame();
}

function jumpBird(event) {
    if (event) event.preventDefault();
    if (gameRunning && !gameOver) bird.velocity = bird.jump;
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);
canvas.addEventListener('click', jumpBird);
canvas.addEventListener('touchstart', jumpBird, { passive: false });
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') jumpBird(event);
});

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(0.5, '#bae6fd');
    gradient.addColorStop(1, '#fef3c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
    for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x < -90) {
            cloud.x = canvas.width + 50;
            cloud.y = 50 + Math.random() * 120;
        }

        const size = 18 * cloud.scale;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, size, 0, Math.PI * 2);
        ctx.arc(cloud.x + size * 1.2, cloud.y + 8, size * 0.9, 0, Math.PI * 2);
        ctx.arc(cloud.x - size * 1.2, cloud.y + 7, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSun() {
    ctx.save();
    ctx.translate(canvas.width - 60, 60);
    ctx.rotate(animationFrame * 0.003);
    for (let i = 0; i < 12; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.fillStyle = 'rgba(255, 214, 10, 0.25)';
        ctx.fillRect(0, -18, 3, 20);
    }
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawGround() {
    const groundY = canvas.height - 40;
    ctx.fillStyle = '#7acb6d';
    ctx.fillRect(0, groundY, canvas.width, 40);
    ctx.fillStyle = '#61b55f';
    for (let x = -18; x < canvas.width + 18; x += 18) {
        ctx.fillRect(x - (animationFrame % 18), groundY + 18, 10, 6);
    }
    ctx.fillStyle = '#4c8a4a';
    ctx.fillRect(0, groundY + 32, canvas.width, 8);
}

function drawPipe(pipe) {
    const topHeight = pipe.gapStart;
    const bottomY = pipe.gapEnd;

    ctx.fillStyle = 'rgba(39, 174, 96, 0.18)';
    ctx.fillRect(pipe.x - 8, 0, pipeWidth + 16, topHeight);
    ctx.fillRect(pipe.x - 8, bottomY, pipeWidth + 16, canvas.height - bottomY);

    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(pipe.x, 0, pipeWidth, topHeight);
    ctx.fillRect(pipe.x, bottomY, pipeWidth, canvas.height - bottomY);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(pipe.x - 2, topHeight - 14, pipeWidth + 4, 14);
    ctx.fillRect(pipe.x - 2, bottomY, pipeWidth + 4, 14);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    for (let y = 10; y < topHeight; y += 18) ctx.fillRect(pipe.x + 8, y, 6, 10);
    for (let y = bottomY + 10; y < canvas.height; y += 18) ctx.fillRect(pipe.x + 8, y, 6, 10);
}

function drawBird() {
    const wingRotation = Math.sin(animationFrame * 0.25) * 0.4;
    const tilt = Math.max(-0.6, Math.min(0.8, bird.velocity / 14));

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(tilt);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-4, 5, 12, 8, wingRotation, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(24, 3);
    ctx.lineTo(14, 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(7, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function gameLoop() {
    animationFrame++;
    drawBackground();
    drawSun();
    drawClouds();

    if (gameRunning && !gameOver) {
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeFrequency) {
            const gapStart = Math.random() * (canvas.height - pipeGap - 120) + 50;
            pipes.push({
                x: canvas.width,
                gapStart,
                gapEnd: gapStart + pipeGap,
                scored: false
            });
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            const pipe = pipes[i];
            pipe.x -= pipeSpeed;

            if (pipe.x + pipeWidth < bird.x && !pipe.scored) {
                pipe.scored = true;
                score++;
                scoreEl.textContent = score;
                animateScore();
            }

            if (pipe.x + pipeWidth < 0) pipes.splice(i, 1);
        }

        if (bird.y + bird.height > canvas.height - 40 || bird.y < 0) endGame();

        for (const pipe of pipes) {
            const horizontalHit = bird.x + bird.width > pipe.x && bird.x < pipe.x + pipeWidth;
            const verticalHit = bird.y < pipe.gapStart || bird.y + bird.height > pipe.gapEnd;
            if (horizontalHit && verticalHit) endGame();
        }
    }

    for (const pipe of pipes) drawPipe(pipe);
    drawBird();
    drawGround();

    if (gameRunning && !gameOver) requestAnimationFrame(gameLoop);
}

function endGame() {
    if (gameOver) return;
    gameOver = true;
    gameRunning = false;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        bestScoreEl.textContent = bestScore;
        document.getElementById('bestScoreFinal').textContent = bestScore;
    }

    document.getElementById('finalScore').textContent = score;
    gameOverScreen.style.display = 'flex';
    document.getElementById('restartBtn').style.display = 'inline-block';
}

clouds = initClouds();
drawBackground();
drawSun();
drawClouds();
drawGround();
drawBird();
