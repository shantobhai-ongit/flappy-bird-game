// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let scoreFlash = 0;
let animationFrame = 0;

// Bird object
const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.3,
    jump: -7,
    color: '#FFD700'
};

// Pipes
let pipes = [];
const pipeWidth = 60;
const pipeGap = 250;
const pipeSpeed = 2;
const pipeFrequency = 600;

const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');

// Cloud animation setup
the clouds = [
    { x: 50, y: 90, speed: 0.3, scale: 1 },
    { x: 180, y: 140, speed: 0.45, scale: 1.2 },
    { x: 320, y: 110, speed: 0.38, scale: 0.9 },
    { x: 420, y: 160, speed: 0.5, scale: 1.1 }
];

function animateScore() {
    scoreEl.classList.remove('score-pop');
    void scoreEl.offsetWidth;
    scoreEl.classList.add('score-pop');

    bestScoreEl.classList.remove('score-pop');
    void bestScoreEl.offsetWidth;
    bestScoreEl.classList.add('score-pop');
}

function initClouds() {
    return [
        { x: 30, y: 80, speed: 0.25, scale: 1.2 },
        { x: 180, y: 120, speed: 0.4, scale: 1.4 },
        { x: 330, y: 90, speed: 0.35, scale: 0.95 },
        { x: 430, y: 150, speed: 0.5, scale: 1.1 }
    ];
}

// Initialize best score display
bestScoreEl.textContent = bestScore;
document.getElementById('bestScoreFinal').textContent = bestScore;

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);
canvas.addEventListener('click', jumpBird);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jumpBird();
        e.preventDefault();
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', jumpBird);

function startGame() {
    gameRunning = true;
    gameOver = false;
    score = 0;
    bird.velocity = 0;
    bird.y = 300;
    pipes = [];
    scoreFlash = 0;
    animationFrame = 0;
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'inline-block';
    document.getElementById('gameOverScreen').style.display = 'none';
    scoreEl.textContent = score;
    animateScore();
    
    gameLoop();
}

function jumpBird() {
    if (gameRunning && !gameOver) {
        bird.velocity = bird.jump;
    }
}

function restartGame() {
    startGame();
}

function drawClouds() {
    const cloudLayer = clouds;
    for (const cloud of cloudLayer) {
        cloud.x -= cloud.speed;
        if (cloud.x < -90) {
            cloud.x = canvas.width + 50;
            cloud.y = 50 + Math.random() * 120;
        }

        const size = 18 * cloud.scale;
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, size, 0, Math.PI * 2);
        ctx.arc(cloud.x + size * 1.2, cloud.y + 8, size * 0.9, 0, Math.PI * 2);
        ctx.arc(cloud.x - size * 1.2, cloud.y + 7, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSun() {
    const sunX = canvas.width - 60;
    const sunY = 60;
    ctx.save();
    ctx.translate(sunX, sunY);
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
    for (let i = 0; i < canvas.width; i += 18) {
        ctx.fillRect(i + (animationFrame % 18), groundY + 18, 10, 6);
    }

    ctx.fillStyle = '#4c8a4a';
    ctx.fillRect(0, groundY + 32, canvas.width, 8);
}

function drawPipe(pipe) {
    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;

    const topHeight = pipe.gapStart;
    const bottomY = pipe.gapEnd;
    const bottomHeight = canvas.height - pipe.gapEnd;

    // Outer glow
a
    ctx.fillStyle = 'rgba(39, 174, 96, 0.18)';
    ctx.fillRect(pipeLeft - 8, 0, pipeWidth + 16, topHeight);
    ctx.fillRect(pipeLeft - 8, bottomY, pipeWidth + 16, bottomHeight);

    // Top pipe
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(pipeLeft, 0, pipeWidth, topHeight);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(pipeLeft - 2, topHeight - 14, pipeWidth + 4, 14);

    // Bottom pipe
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(pipeLeft, bottomY, pipeWidth, bottomHeight);
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(pipeLeft - 2, bottomY, pipeWidth + 4, 14);

    // Pipe stripes
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 10; i < topHeight; i += 18) {
        ctx.fillRect(pipeLeft + 8, i, 6, 10);
    }
    for (let i = bottomY + 10; i < canvas.height; i += 18) {
        ctx.fillRect(pipeLeft + 8, i, 6, 10);
    }
}

function gameLoop() {
    animationFrame++;
    scoreFlash = Math.max(0, scoreFlash - 0.04);

    // Draw sky background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(0.5, '#bae6fd');
    gradient.addColorStop(1, '#fef3c7');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawSun();
    drawClouds();

    if (gameRunning && !gameOver) {
        // Update bird
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        // Generate pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeFrequency) {
            const gapStart = Math.random() * (canvas.height - pipeGap - 120) + 50;
            pipes.push({
                x: canvas.width,
                gapStart: gapStart,
                gapEnd: gapStart + pipeGap,
                scored: false
            });
        }

        // Update pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;

            if (pipes[i].x + pipeWidth < bird.x && !pipes[i].scored) {
                pipes[i].scored = true;
                score++;
                scoreEl.textContent = score;
                animateScore();
            }

            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }

        // Check collision with boundaries
        if (bird.y + bird.height > canvas.height - 40 || bird.y < 0) {
            endGame();
        }

        // Check collision with pipes
        for (let pipe of pipes) {
            const birdLeft = bird.x;
            const birdRight = bird.x + bird.width;
            const birdTop = bird.y;
            const birdBottom = bird.y + bird.height;
            const pipeLeft = pipe.x;
            const pipeRight = pipe.x + pipeWidth;

            if (birdRight > pipeLeft && birdLeft < pipeRight) {
                if (birdTop < pipe.gapStart || birdBottom > pipe.gapEnd) {
                    endGame();
                }
            }
        }
    }

    // Draw pipes
    for (const pipe of pipes) {
        drawPipe(pipe);
    }

    // Draw bird
    drawBird();

    // Score text glow
    scoreEl.style.transform = `scale(${1 + scoreFlash * 0.25})`;
    scoreEl.style.textShadow = `0 0 ${18 + scoreFlash * 32}px rgba(255,255,255,0.9)`;

    drawGround();

    if (gameRunning && !gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function drawBird() {
    const wingFlap = Math.sin(animationFrame * 0.25) * 14;
    const tilt = Math.max(-0.6, Math.min(0.8, bird.velocity / 14));

    ctx.save();
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    ctx.rotate(tilt);

    // shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    ctx.ellipse(0, bird.height / 2 + 9, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // wing
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(-4, 5, 12, 8, (wingFlap / 35), 0, Math.PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(24, 3);
    ctx.lineTo(14, 7);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(6, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(7, -4, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function endGame() {
    gameOver = true;
    gameRunning = false;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        bestScoreEl.textContent = bestScore;
        document.getElementById('bestScoreFinal').textContent = bestScore;
    }

    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
    document.getElementById('restartBtn').style.display = 'inline-block';
}

// Initial draw
clouds = initClouds();
const initialGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
initialGradient.addColorStop(0, '#7dd3fc');
initialGradient.addColorStop(0.5, '#bae6fd');
initialGradient.addColorStop(1, '#fef3c7');
ctx.fillStyle = initialGradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);
drawSun();
drawClouds();
drawGround();

drawBird();
