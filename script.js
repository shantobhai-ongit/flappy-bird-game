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
    gravity: 0.3,
    jump: -7,
    color: '#FFD700'
};

// Pipes
let pipes = [];
const pipeWidth = 60;
const pipeGap = 250; // Large gap for very easy gameplay
const pipeSpeed = 2; // Slow speed
const pipeFrequency = 280; // Much more space between pipes (250-300 range)

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
    // Draw sky background
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
                gapEnd: gapStart + pipeGap,
                scored: false
            });
        }
        
        // Update pipes
        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].x -= pipeSpeed;
            
            // Score when bird passes pipe
            if (pipes[i].x + pipeWidth < bird.x && !pipes[i].scored) {
                pipes[i].scored = true;
                score++;
                document.getElementById('score').textContent = score;
            }
            
            // Remove off-screen pipes
            if (pipes[i].x + pipeWidth < 0) {
                pipes.splice(i, 1);
            }
        }
        
        // Check collision with boundaries
        if (bird.y + bird.height > canvas.height || bird.y < 0) {
            endGame();
        }
        
        // Check collision with pipes
        for (let pipe of pipes) {
            // Improved collision detection with padding
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
    ctx.fillStyle = '#2ecc71';
    for (let pipe of pipes) {
        // Top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.gapStart);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.gapEnd, pipeWidth, canvas.height - pipe.gapEnd);
        
        // Pipe decorations (lips)
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
    
    // Draw bird eye (white)
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 5, bird.y + bird.height / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird eye (black pupil)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(bird.x + bird.width / 2 + 6, bird.y + bird.height / 2 - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw bird wing outline
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
