// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;

// Bird object
const bird = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    velocity: 0,
    gravity: 0.5,
    jump: -10,
    color: '#FFD700'
};

// Pipes
let pipes = [];
const pipeWidth = 60;
const pipeGap = 120;
const pipeSpeed = 4;
const pipeFrequency = 90; // pixels between pipes

// Initialize best score display
document.getElementById('bestScore').textContent = bestScore;
document.getElementById('bestScoreFinal').textContent = bestScore;

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);
canvas.addEventListener('click', jumpBird);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jumpBird();
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
    
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('restartBtn').style.display = 'inline-block';
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('score').textContent = score;
    
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

function gameLoop() {
    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameRunning && !gameOver) {
        // Update bird
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;
        
        // Generate pipes
        if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - pipeFrequency) {
            const gapStart = Math.random() * (canvas.height - pipeGap - 100) + 50;
            pipes.push({
                x: canvas.width,
                gapStart: gapStart,
                gapEnd: gapStart + pipeGap
            });
        }
        
        // Update pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;
            
            // Remove off-screen pipes
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
                score++;
                document.getElementById('score').textContent = score;
            }
        }
        
        // Check collision with pipes or boundaries
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            endGame();
        }
        
        for (let pipe of pipes) {
            if (
                bird.x < pipe.x + pipeWidth &&
                bird.x + bird.width > pipe.x &&
                (bird.y < pipe.gapStart || bird.y + bird.height > pipe.gapEnd)
            ) {
                endGame();
            }
        }
    }
    
    // Draw pipes
    ctx.fillStyle = '#2ecc71';
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapStart);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapEnd, pipeWidth, canvas.height - pipe.gapEnd);
        
        // Pipe decorations
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(pipe.x - 2, pipe.gapStart - 8, pipeWidth + 4, 8);
        ctx.fillRect(pipe.x - 2, pipe.gapEnd, pipeWidth + 4, 8);
        ctx.fillStyle = '#2ecc71';
    }
    
    // Draw bird
    ctx.fillStyle = bird.color;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 6, bird.y + bird.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird wing
    ctx.strokeStyle = bird.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();
    
    if (gameRunning && !gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameOver = true;
    gameRunning = false;
    
    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        document.getElementById('bestScore').textContent = bestScore;
        document.getElementById('bestScoreFinal').textContent = bestScore;
    }
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
    document.getElementById('restartBtn').style.display = 'inline-block';
}

// Initial draw
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, '#87CEEB');
gradient.addColorStop(1, '#E0F6FF');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw initial bird
ctx.fillStyle = bird.color;
ctx.beginPath();
ctx.arc(bird.x + bird.width / 2, bird.y + bird.height / 2, bird.width / 2, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 4, 0, Math.PI * 2);
ctx.fill();

ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(bird.x + bird.width / 2 + 6, bird.y + bird.height / 2 - 5, 2, 0, Math.PI * 2);
ctx.fill();
