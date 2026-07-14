// =====================================
// SHADOW STRIKE - Original Stealth Game
// Part 1
// =====================================

// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// HUD
const livesEl = document.getElementById("lives");
const coinsEl = document.getElementById("coins");
const scoreEl = document.getElementById("score");

// Game state
const game = {
    lives: 3,
    coins: 0,
    score: 0,
    level: 1
};

// Player
const player = {
    x: 100,
    y: 100,
    radius: 16,
    speed: 3,
    color: "#00ff66",
    dx: 0,
    dy: 0
};

// Keyboard
const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

// Update HUD
function updateHUD() {
    livesEl.textContent = game.lives;
    coinsEl.textContent = game.coins;
    scoreEl.textContent = game.score;
}// =====================================
// PART 2 - Player Movement & Walls
// =====================================

// Level walls
const walls = [
    {x:180,y:80,w:220,h:25},
    {x:450,y:180,w:25,h:220},
    {x:200,y:420,w:280,h:25},
    {x:650,y:120,w:220,h:25},
    {x:820,y:260,w:25,h:220}
];

// Draw walls
function drawWalls() {
    ctx.fillStyle = "#444";

    for (const wall of walls) {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    }
}

// Check if player would hit a wall
function hitsWall(nextX, nextY) {

    for (const wall of walls) {

        if (
            nextX + player.radius > wall.x &&
            nextX - player.radius < wall.x + wall.w &&
            nextY + player.radius > wall.y &&
            nextY - player.radius < wall.y + wall.h
        ) {
            return true;
        }
    }

    return false;
}

// Player movement
function updatePlayer() {

    let dx = 0;
    let dy = 0;

    if (keys["w"] || keys["arrowup"]) dy -= player.speed;
    if (keys["s"] || keys["arrowdown"]) dy += player.speed;
    if (keys["a"] || keys["arrowleft"]) dx -= player.speed;
    if (keys["d"] || keys["arrowright"]) dx += player.speed;

    const nextX = player.x + dx;
    const nextY = player.y + dy;

    if (!hitsWall(nextX, player.y)) {
        player.x = nextX;
    }

    if (!hitsWall(player.x, nextY)) {
        player.y = nextY;
    }

    // Stay inside screen
    player.x = Math.max(player.radius,
        Math.min(canvas.width - player.radius, player.x));

    player.y = Math.max(player.radius,
        Math.min(canvas.height - player.radius, player.y));
}

// Draw player
function drawPlayer() {

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = player.color;
    ctx.fill();
}// =====================================
// PART 3 - Guards, Coins & Exit
// =====================================

// Coins
const coins = [
    {x:120,y:300,collected:false},
    {x:360,y:180,collected:false},
    {x:620,y:450,collected:false},
    {x:900,y:220,collected:false},
    {x:760,y:520,collected:false}
];

// Exit Door
const exitDoor = {
    x: 1000,
    y: 550,
    w: 40,
    h: 40
};

// Guards
const guards = [
{
    x:500,
    y:100,
    r:16,
    speed:2,
    dir:1,
    minX:420,
    maxX:820,
    alive:true
},
{
    x:250,
    y:500,
    r:16,
    speed:2,
    dir:1,
    minX:180,
    maxX:620,
    alive:true
}
];

// Distance helper
function distance(x1,y1,x2,y2){
    return Math.hypot(x2-x1,y2-y1);
}

// Move guards
function updateGuards(){

    for(const g of guards){

        if(!g.alive) continue;

        g.x += g.speed * g.dir;

        if(g.x <= g.minX) g.dir = 1;
        if(g.x >= g.maxX) g.dir = -1;
    }

}

// Draw guards
function drawGuards(){

    for(const g of guards){

        if(!g.alive) continue;

        ctx.beginPath();
        ctx.arc(g.x,g.y,g.r,0,Math.PI*2);
        ctx.fillStyle="crimson";
        ctx.fill();

    }

}

// Draw coins
function drawCoins(){

    ctx.fillStyle="gold";

    for(const c of coins){

        if(c.collected) continue;

        ctx.beginPath();
        ctx.arc(c.x,c.y,8,0,Math.PI*2);
        ctx.fill();

    }

}

// Draw exit
function drawExit(){

    ctx.fillStyle="lime";

    ctx.fillRect(
        exitDoor.x,
        exitDoor.y,
        exitDoor.w,
        exitDoor.h
    );// =====================================
// PART 4 - Game Logic
// =====================================

// Collect coins
function collectCoins() {

    for (const coin of coins) {

        if (coin.collected) continue;

        if (distance(player.x, player.y, coin.x, coin.y) < 22) {

            coin.collected = true;
            game.coins++;
            game.score += 100;

        }

    }

}

// Guard logic
function updateGuardLogic() {

    for (const guard of guards) {

        if (!guard.alive) continue;

        const d = distance(
            player.x,
            player.y,
            guard.x,
            guard.y
        );

        // Stealth takedown
        if (d < 18) {

            guard.alive = false;
            game.score += 300;
            continue;

        }

        // Player detected
        if (d < 80) {

            game.lives--;

            player.x = 100;
            player.y = 100;

            if (game.lives <= 0) {

                alert("Game Over");
                location.reload();

            }

        }

    }

}

// Check if level is complete
function checkWin() {

    const allGuardsDown =
        guards.every(g => !g.alive);

    if (!allGuardsDown)
        return;

    if (
        player.x > exitDoor.x &&
        player.y > exitDoor.y
    ) {

        alert("Level Complete!");

        location.reload();

    }

}

// =====================================
// MAIN GAME LOOP
// =====================================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    updatePlayer();
    updateGuards();

    collectCoins();
    updateGuardLogic();

    drawWalls();
    drawCoins();
    drawExit();
    drawGuards();
    drawPlayer();

    updateHUD();
    checkWin();

    requestAnimationFrame(gameLoop);

}

gameLoop();

}
