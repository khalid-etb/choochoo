const canvas = document.querySelector("#bg-canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&+-=§/:;";

class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;

    this.direction = Math.floor(Math.random() * 4);

    this.speed = 2 + Math.random() * 1.5;
    this.headChar = CHARS[Math.floor(Math.random() * CHARS.length)];
    this.body = [];
    this.maxSegments = 25;
  }

  update() {
    if (Math.random() < 0.02) {
      const turn = Math.random() < 0.5 ? -1 : 1;
      this.direction = (this.direction + turn + 4) % 4;
    }

    this.headChar = CHARS[Math.floor(Math.random() * CHARS.length)];

    switch (this.direction) {
      case 0: this.x += this.speed; break;
      case 1: this.y += this.speed; break;
      case 2: this.x -= this.speed; break;
      case 3: this.y -= this.speed; break;
    }

    if (this.x <= 0) { this.x = 0; this.direction = 0; }
    if (this.x >= canvas.width) { this.x = canvas.width; this.direction = 2; }
    if (this.y <= 0) { this.y = 0; this.direction = 1; }
    if (this.y >= canvas.height) { this.y = canvas.height; this.direction = 3; }

    this.body.unshift({
      x: this.x,
      y: this.y,
      char: this.headChar,
    });

    if (this.body.length > this.maxSegments)
      this.body.pop();
  }

  draw() {
    ctx.font = "14px monospace";

    for (let i = 0; i < this.body.length; i++) {
      const segment = this.body[i];
      const alpha = 1 - i / this.body.length;

      if (i === 0) {
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.shadowBlur = 0;
      }

      ctx.fillText(segment.char, segment.x, segment.y);
    }
  }
}

const snakes = Array.from({ length: 15 }, () => new Snake());

function animate() {
  ctx.fillStyle = "rgba(18, 18, 18, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  snakes.forEach((snake) => {
    snake.update();
    snake.draw();
  });

  requestAnimationFrame(animate);
}

animate();