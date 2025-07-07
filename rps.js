const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const inp = document.querySelector("input");
const pouseButton = document.getElementById("pause");

const rocksDiv = document.getElementById("rocks");
const paperDiv = document.getElementById("paper");
const scissorsDiv = document.getElementById("scissors");

let rockCount = 0;
let paperCount = 0;
let scissorsCount = 0;

const soundCooldown = 100;

let run = false;
let started = false;
let animationFrameID;
const size = 25;
let numOfBalls = 1; 
let balls = [];

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function playCollisionSound() {
    const sound = new Audio("assets/bump.mp3");
    sound.play().catch(error => {
        console.log('Please click/tap anywhere to enable sound.');
    });
    canPlaySound = false;
    setTimeout(() => canPlaySound = true, soundCooldown);
    
}

class Ball {
    constructor(x, y, velX, velY, size, type) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.size = size;
        this.mass = size*size;

        this.type = type; // 'rock', 'paper', or 'scissors'
        this.image = new Image();
        this.image.src = `assets/${this.type}.png`;
    }
    draw() {
  	    ctx.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
	}
    update() {
        if ((this.x + this.size) >= width) {
            this.velX = -(this.velX);
        }
      
        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }
      
        if ((this.y + this.size) >= height) {
            this.velY = -(this.velY);
        }
      
        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }
      
        this.x += this.velX;
        this.y += this.velY;
    }

    decideWinner(other) {
        if (this.type === other.type) {
            return;
        }

        const win = () => {
            other.type = this.type;
            other.image.src = this.image.src;
            other.draw();
        }
        const loose = () => {
            this.type = other.type;
            this.image.src = other.image.src;
            this.draw();
        }
        
        if (this.type === 'rock' && other.type === 'paper') {
            rockCount--;
            paperCount++;
            loose();
        } else if (this.type === 'paper' && other.type === 'scissors') {
            paperCount--;
            scissorsCount++;
            loose();
        } else if (this.type === 'scissors' && other.type === 'rock') {
            scissorsCount--;
            rockCount++;
            loose();
        } else if (this.type === 'rock' && other.type === 'scissors') {
            rockCount++;
            scissorsCount--;
            win();
        } else if (this.type === 'paper' && other.type === 'rock') {
            paperCount++;
            rockCount--;
            win();
        } else if (this.type === 'scissors' && other.type === 'paper') {
            scissorsCount++;
            paperCount--;
            win();
        }
        
        rocksDiv.innerText = `rocks: ${rockCount}`;
        paperDiv.innerText = `papers: ${paperCount}`;
        scissorsDiv.innerText = `scissors: ${scissorsCount}`;
        
    }


    collisionDetect() {
        for (let other of balls) {
            if (this !== other) {               

                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy)
                const minDistance = this.size + other.size;

                if (distance <= minDistance) {
                    // calculate collision normal
                    const nx = (dx) / distance;
                    const ny = (dy) / distance;

                    // calculate relative velocity
                    const relativeVelocityX = other.velX - this.velX;
                    const relativeVelocityY = other.velY - this.velY;

                    // calculate dot product of relative velocity and normal
                    const dotProduct = relativeVelocityX * nx + relativeVelocityY * ny;

                    // calculate impulse
                    const impulse = (2 * dotProduct) / (1 / this.mass + 1 / other.mass);

                    // update velocities using impulse
                    this.velX += (impulse * nx) / this.mass;
                    this.velY += (impulse * ny) / this.mass;
                    other.velX -= (impulse * nx) / other.mass;
                    other.velY -= (impulse * ny) / other.mass;

                    // apply repulsion force to prevent sticking
                    const overlap = minDistance - distance;
                    const repulsionX = (overlap / 2) * nx;
                    const repulsionY = (overlap / 2) * ny;

                    // adjust positions to resolve overlap
                    this.x -= repulsionX;
                    this.y -= repulsionY;
                    other.x += repulsionX;
                    other.y += repulsionY;

                    this.decideWinner(other);
                    // playCollisionSound() // uncomment for sound on collision
                }
            }
        }
    }
}

function generateBalls(){
    balls = [];
    while (balls.length < numOfBalls) {
        
        const ball = new Ball(
            random(0 + size, width - size),
            random(0 + size, height - size),
            random(-5, 5),
            random(-5, 5),
            size,
            balls.length % 3 === 0 ? 'rock' : balls.length % 3 === 1 ? 'paper' : 'scissors'
        );

        balls.push(ball);
    }
}

function runloop() {
    //ctx.fillStyle = "rgb(0 0 0 / 20%)"; // for movement tail (ugly)
    ctx.fillRect(0, 0, width, height);
    
    for (const ball of balls) {
        ball.draw();
        ball.update();
        ball.collisionDetect();
    }
    if (!run)
        return;
    animationFrameID = requestAnimationFrame(runloop);
}

function start (){
    pouseButton.innerText = "pause";
    numOfBalls = Number.parseInt(inp.value);
    
    rockCount = numOfBalls;
    paperCount = numOfBalls;
    scissorsCount = numOfBalls;
    rocksDiv.innerText = `rocks: ${rockCount}`;
    paperDiv.innerText = `papers: ${paperCount}`;
    scissorsDiv.innerText = `scissors: ${scissorsCount}`;
    
    numOfBalls = 3 * numOfBalls;
    generateBalls(numOfBalls);
    run = true;
    runloop();
}

document.getElementById("start").addEventListener('click', () => {
    if (inp.value && Number.parseInt(inp.value) > 0) {
        document.getElementById("start").innerText = "restart";
        if (animationFrameID) {
            cancelAnimationFrame(animationFrameID);
        }
        started = true;
        start();
    }
});

pouseButton.addEventListener('click', () => {
    if (run && started) {
        pouseButton.innerText = "resume";
        run = false;
    }
    else if (started) {
        pouseButton.innerText = "pause";
        run = true;
        runloop();
    }
});
