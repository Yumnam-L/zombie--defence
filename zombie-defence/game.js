const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

const introScreen = document.getElementById('introScreen');
const startButton = document.getElementById('startButton');

const background = new Image();
background.src = 'img/background2.jpg';

let keys = {};
let player;
let zombies = [];
let projectiles = [];
let blocks = [];
let gameState = 'play'; // 'play', 'pause', 'gameover'
let fireRate = 350; // Fire rate in milliseconds
let lastShotTime = 0;
let resources = 200;
let increasedFireRate = false;
let fireRateTimeout;
let introState = 'intro';


// Load sprite images
const playerLeft = new Image();
playerLeft.src = 'img/player-left.png';

const playerRight = new Image();
playerRight.src = 'img/player-right.png';

const zombieSprite = new Image();
zombieSprite.src = 'img/zombie.png';

document.getElementById('resumeButton').disabled = true;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'Escape') {
        gameState = gameState === 'play' ? 'pause' : 'play';
    }
    if (e.key === 's') {
        shoot(); 
    }
    if (e.key === 'b') {
        deployBlock();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});
document.getElementById('pauseButton').addEventListener('click', () => {
    gameState = 'pause';
    document.getElementById('resumeButton').disabled = false;
});
document.getElementById('resumeButton').addEventListener('click', () => {
    gameState = 'play';
    document.getElementById('resumeButton').disabled = true;
    gameLoop(); // Ensure the game loop is running
});

document.getElementById('jetpackButton').addEventListener('click', () => {
    player.useJetpack();
});
document.getElementById('IncreaseFireRate').addEventListener('click', () => {
    player.UseIncreaseFireRate();
});
// Start game event
startButton.addEventListener('click', () => {
    introState = " ";
    init();
    // gameState = 'play';
});
document.addEventListener('DOMContentLoaded', (event) => {
    const introScreen = document.getElementById('introScreen');
    const startButton = document.getElementById('startButton');
    const gameCanvas = document.getElementById('gameCanvas');

    startButton.addEventListener('click', () => {
        introScreen.style.display = 'none';
        gameCanvas.style.display = 'block';
        init();
    });
});

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 90;
        this.height = 90;
        this.speed = 5;
        this.jumpPower = 15;
        this.isJumping = false;
        this.velocityY = 0;
        this.onGround = false;
        this.health = 100;
        this.direction = 'right';
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 1517; // Width of a single frame
        this.spriteHeight = 1100; // Height of a single frame
        this.frameCount = 1; // Number of frames in the sprite sheet
        this.jetpackActive = false;
        this.jetpackTimeout = null;
        this.sprite = new Image();
        this.sprite.src = 'img/player-right.png';
    }
    draw() {
        ctx.drawImage(
            this.sprite,
            this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
            this.spriteWidth, this.spriteHeight,
            this.x, this.y, this.width, this.height
        );
        ctx.fillStyle = 'green';
        ctx.font = '30px Orbitron';
        ctx.fillText(`${this.health}`, this.x, this.y - 10);
    }

    update() {
        if (keys['a'] || keys['A']) {
            if (this.direction !== 'left') {
                this.direction = 'left';
                this.sprite.src = 'img/player-left.png';
            } else {
                this.x -= this.speed;
            }
        }
        if (keys['d'] || keys['D']) {
            if (this.direction !== 'right') {
                this.direction = 'right';
                this.sprite.src = 'img/player-right.png';
            } else {
                this.x += this.speed;
            }
        }
        if (keys['w'] && this.onGround) {
            this.isJumping = true;
            this.velocityY = -this.jumpPower;
            this.onGround = false;
        }

        // Apply gravity
        if (!this.jetpackActive) {
            this.velocityY += 0.8; // Gravity
        } else {
            this.velocityY = 0;
            if (this.y > canvasHeight / 1.4) {
                this.y -= this.speed; // Hover upwards
            }
        }
        this.y += this.velocityY;

        if (this.y + this.height >= canvasHeight * 3 / 4) { // Ground collision
            this.y = canvasHeight * 3 / 4 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
       
        // Animate sprite
        this.frameX = (this.frameX + 1) % this.frameCount;
    }
    useJetpack() {
        if (resources >= 30) {
            resources -= 30;
            this.jetpackActive = true;
            if (this.direction === 'right') {
                this.sprite.src = 'img/player-jet-right.png';
            } else {
                this.sprite.src = 'img/player-jet-left.png';
            }
            clearTimeout(this.jetpackTimeout);
            this.jetpackTimeout = setTimeout(() => {
                this.jetpackActive = false;
                if (this.direction === 'right') {
                    this.sprite.src = 'img/player-right.png';
                } else {
                    this.sprite.src = 'img/player-left.png';
                }
            }, 5000);
        }
    }
    UseIncreaseFireRate() {
        if (resources >= 30) {
            resources -= 30;
            increasedFireRate = true;
            fireRate = 100;
            clearTimeout(fireRateTimeout);
            fireRateTimeout = setTimeout(() => {
                increasedFireRate = false;
                fireRate = 350;
            }, 5000);
        }
    }
    
}

class Zombie {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.speed = 0.3;
        this.direction = direction;
        this.health = 20;
        this.sprite = new Image();
        this.sprite.src = 'img/zombie.png';
        this.spriteLoaded = false;
        this.sprite.onload = () => {
            this.spriteLoaded = true;
        };
        this.spriteWidth = 292; // Width of a single frame
        this.spriteHeight = 410; // Height of a single frame
        this.frameCount = 8; // Number of frames in the sprite sheet
        this.frameX = 0;
        this.frameY = 0;
    }

    draw() {
        if (!this.spriteLoaded) return;

        ctx.save();
        
        // Handle mirroring for zombies coming from the left
        if (this.direction === 'right') {
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(
                this.sprite,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                -this.x - this.width, this.y,
                this.width, this.height
            );
        } else {
            ctx.drawImage(
                this.sprite,
                this.frameX * this.spriteWidth, this.frameY * this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                this.x, this.y,
                this.width, this.height
            );
        }

        ctx.restore();

        ctx.fillStyle = 'red';
        ctx.font = '30px Orbitron';
        ctx.fillText(`${this.health}`, this.x, this.y - 10);
    }

    update() {
        this.x += this.direction === 'left' ? -this.speed : this.speed;
        this.frameX = (this.frameX + 1) % this.frameCount; // Animate sprite
    }
}

class Projectile {
    constructor(x, y, direction) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.color = 'red';
        this.speed = 10;
        this.direction = direction;
        this.velocityY = -5;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.direction === 'right' ? this.speed : -this.speed;
        this.velocityY += 0.5; // Gravity effect on projectile
        this.y += this.velocityY;
    }
}

class Block {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = 'brown';
        this.health = 20;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.fillText(`H: ${this.health}`, this.x, this.y - 10);
    }
}

function init() {
    // player = new Player(canvasWidth / 2 - 25, canvasHeight - 100);
    player = new Player(canvasWidth / 2 - 25, canvasHeight * 3 / 4 - 100);
    spawnZombie();
    gameLoop();
}

function spawnZombie() {
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const x = side === 'left' ? 0 : canvasWidth;
    const direction = side === 'left' ? 'right' : 'left';
    // const zombie = new Zombie(x, canvasHeight - 50, direction);
    const zombie = new Zombie(x, canvasHeight * 3 / 4 - 50, direction);
    zombies.push(zombie);
    if (gameState === 'play') {
        setTimeout(spawnZombie, 2000);
    }
}

function gameLoop() {
    if (gameState === 'play') {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function update() {
    player.update();
    zombies.forEach(zombie => zombie.update());
    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (projectile.y > canvasHeight) {
            projectiles.splice(index, 1);
        }
    });

    // Check collisions
    projectiles.forEach((projectile, pIndex) => {
        zombies.forEach((zombie, zIndex) => {
            if (projectile.x < zombie.x + zombie.width &&
                projectile.x + projectile.width > zombie.x &&
                projectile.y < zombie.y + zombie.height &&
                projectile.y + projectile.height > zombie.y) {
                zombies[zIndex].health -= 10;
                if (zombies[zIndex].health <= 0) {
                    zombies.splice(zIndex, 1);
                    player.health += 10; // Increase player health by 10
                }
                projectiles.splice(pIndex, 1);
            }
        });
    });

    // Check if zombies reach player or blocks
    zombies.forEach((zombie, zIndex) => {
        if (zombie.x < player.x + player.width &&
            zombie.x + zombie.width > player.x &&
            zombie.y < player.y + player.height &&
            zombie.y + zombie.height > player.y) {
            // if (!immunity) {
            //     player.health -= 10;
            // }
            player.health -= 10;
            zombies.splice(zIndex, 1);
            if (player.health <= 0) {
                gameState = 'gameover';
            }
        }

        blocks.forEach((block, bIndex) => {
            if (zombie.x < block.x + block.width &&
                zombie.x + zombie.width > block.x &&
                zombie.y < block.y + block.height &&
                zombie.y + zombie.height > block.y) {
                blocks[bIndex].health -= 10;
                if (blocks[bIndex].health <= 0) {
                    blocks.splice(bIndex, 1);
                }
                zombies.splice(zIndex, 1);
            }
        });
    });
}

function draw() {
    if (introState === 'intro') {
        introScreen.style.display = 'flex';
        canvas.style.display = 'none';
        resumeButton.style.display = 'none';
        pauseButton.style.display = 'none';
        jetpackButton.style.display = 'none';
        IncreaseFireRate.style.display = 'none';
        return;
    } else {
        introScreen.style.display = 'none';
        canvas.style.display = 'block';
        resumeButton.style.display = 'inline-block';
        pauseButton.style.display = 'inline-block';
        jetpackButton.style.display = 'inline-block';
        IncreaseFireRate.style.display = 'inline-block';
    }

    // Draw background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    player.draw();
    zombies.forEach(zombie => zombie.draw());
    projectiles.forEach(projectile => projectile.draw());
    blocks.forEach(block => block.draw());

    // Draw health
    ctx.fillStyle = 'black';
    ctx.font = '30px Orbitron';
    ctx.fillText(`Health: ${player.health}`, 20, 30);
    ctx.fillText(`Resources: ${resources}`, 200, 30);

    if (gameState === 'gameover') {
        ctx.fillStyle = 'red';
        ctx.font = '30px Orbitron';
        ctx.fillText('Game Over', canvasWidth / 2 - 150, canvasHeight / 2);
        ctx.fillText('Press "Refresh" to restart the game', canvasWidth / 2 - 150, canvasHeight * 3 / 4);
    }
}

function shoot() {
    const now = Date.now();
    if (now - lastShotTime > fireRate) {
        const projectile = new Projectile(player.x + player.width / 2, player.y, player.direction);
        projectiles.push(projectile);
        lastShotTime = now;
    }
}

function deployBlock() {
    const block = new Block(player.x + 55, player.y , 50, 50);
    blocks.push(block);
}


