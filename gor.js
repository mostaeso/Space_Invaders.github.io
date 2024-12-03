let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; 
let boardHeight = tileSize * rows; 
let context;

let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
};

let shipImg;
let shipVelocityX = tileSize;

let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; 
let alienVelocityX = 0.5 ;

let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

let alienBulletArray = [];
let alienBulletVelocityY = 5;

let gameLoop; 

let particleArray = [];

let alienImg1= new Image();
let alienImg2= new Image();
let alienImg3= new Image();

alienImg1.src ="./alien-cyan.png";
alienImg2.src ="./alien-yellow.png";
alienImg3.src ="./alien-magenta.png";

let backgroundMusic = new Audio("./two.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume =0.1;

function Particle(x, y, velocityX, velocityY, size, lifetime, color) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.size = size;
    this.lifetime = lifetime;
    this.color = color;
}

function createParticles(x, y) {
    let particleCount = 10;  
    for (let i = 0; i < particleCount; i++) {
        let velocityX = (Math.random() - 0.5) * 4;  
        let velocityY = (Math.random() - 0.5) * 4;  
        let size = Math.random() * 4 + 2; 
        let lifetime = Math.random() * 20 + 20;  
        let color = 'rgba(255, 255, 255, 0.8)';  
        
        let particle = new Particle(x, y, velocityX, velocityY, size, lifetime, color);
        particleArray.push(particle);
            
        }
    }
    function updateParticles() {
        for (let i =0; i<particleArray.length; i++) {
            let particle= particleArray[i];
            if (particle.lifetime<=0) {
                particleArray.splice(i,1);
                i--;
            } else {
                particle.x+=particle.velocityX;
                particle.y +=particle.velocityY;
                particle.lifetime--;

                particle.color=`rgba(255,255,255,${particle.lifetime/40})`;
            }
        }
    }
    function drawParticles(){
        for (let i = 0; i< particleArray.length; i++) {
            let particle=particleArray[i];
            context.fillStyle=particle.color;
            context.beginPath();
            context.arc (particle.x,particle.y,particle.size,0,Math.PI*2)
            context.fill();
            context.closePath();

        }
    }

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    backgroundMusic.play();

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();
    createAlienBullets();

    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
    document.addEventListener("keydown", restartGame);

    
    gameLoop = requestAnimationFrame(update);
}

function restartGame(e) {
    if (e.code === "KeyR" && gameOver) {
        
        cancelAnimationFrame(gameLoop);

        gameOver = false;
        score = 0;
        alienCount = 0;
        alienColumns=3;
        alienRows= 2;
        alienArray = [];
        bulletArray = [];
        alienBulletArray = [];
        createAliens();

        gameLoop = requestAnimationFrame(update);
    }
}

function update() {
    gameLoop = requestAnimationFrame(update);

    if (gameOver) {
        context.fillStyle = "red";
        context.font = "30px 'Courier New', Courier";
        context.fillText("Game Over", board.width / 2 - 75, board.height / 2);
        context.fillText("Score: " + score, board.width / 2 - 60, board.height / 2 + 40);
        context.fillText("Press R to Restart", board.width / 2 - 120, board.height / 2 + 80);
        context.fillText("Best Score : 37200", board.width / 2 - 142, board.height / 2 + 120);
        backgroundMusic.volume =0;
        return;
    }

    context.clearRect(0, 0, board.width, board.height);
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    updateParticles();
    drawParticles();

    for (let i = 0; i < alienBulletArray.length; i++) {
        let bullet = alienBulletArray[i];
        bullet.y += alienBulletVelocityY;
        context.fillStyle= "red";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        if (detectCollision(bullet, ship)) {
            gameOver = true;
        }
    }
    alienBulletArray = alienBulletArray.filter(bullet => !bullet.used && bullet.y <= board.height);

    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alien.speed *alienVelocityX;

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;

                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.strength-=1;
                if (alien.strength<=0) {
                    alien.alive = false;
                    alienCount--;
                    score += 100;
    
                    createParticles(alien.x+ alien.width/2, alien.y +alien.height/2)
                }
               
            }
        }
    }


    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2;
        } else {
            alienVelocityX -= 0.2;
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

   
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
           let randomImage =Math.random();
           let alienImage, strength, speed;
           
            if (randomImage < 0.9) {
                alienImage=alienImg;
                strength= 1;
                speed=2.5;
            } else if (randomImage>=0.9 && randomImage< 0.93) {
                alienImage= alienImg1;
                strength=2;
                speed=2;
            } else if (randomImage>=0.93 && randomImage< 0.96) {
                alienImage=alienImg2;
                strength=3;
                speed=2;
            }else {
                alienImage=alienImg3;
                strength=4;
                speed=2;
            }

            let alien = {
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true,
                img: alienImage,
                strength:strength,
                speed:speed
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        let bulletWidth= tileSize/8;
        let bulletHeight = tileSize/2;

        if(score>= 8000) {
            let bullet1={
                x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: bulletWidth,
            height: bulletHeight,
            used: false
            };

            let bullet2={
                x: ship.x + shipWidth * 15 / 32 -tileSize/8,
            y: ship.y - tileSize/4,
            width: bulletWidth,
            height: bulletHeight,
            used: false
            };
            
            let bullet3={
                x: ship.x + shipWidth * 15 / 32 +tileSize/8,
            y: ship.y - tileSize/4,
            width: bulletWidth,
            height: bulletHeight,
            used: false
            };
            bulletArray.push(bullet1,bullet2,bullet3);
        } else {

            let bullet = {
                x: ship.x + shipWidth * 15 / 32,
                y: ship.y,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false
            };
            bulletArray.push(bullet);
        }
     
    }
}

function createAlienBullets() {
    setInterval(function() {
        let aliveAliens = alienArray.filter(alien => alien.alive);
        if (aliveAliens.length > 0) {
            let randomAlien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        
            let bulletSpeed = randomAlien.strength>1? alienBulletVelocityY +2 :alienBulletVelocityY;
        
            let alienBullet = {
                x: randomAlien.x + randomAlien.width / 2 - tileSize / 16,
                y: randomAlien.y + randomAlien.height,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false,
                velocityY : bulletSpeed
            };
            alienBulletArray.push(alienBullet);
        }
    }, 1500);
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}
