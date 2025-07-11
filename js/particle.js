export class Particle {
    constructor(game, x, y, color) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.color = color || `hsl(${Math.random() * 60 + 10}, 100%, 50%)`;
        this.size = Math.random() * 5 + 2;
        this.life = 30 + Math.random() * 20;
        this.maxLife = this.life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.active = true;
    }

    update(deltaTime) {
        this.x += this.vx * (deltaTime / 16);
        this.y += this.vy * (deltaTime / 16);
        this.vy += 0.1;
        this.life--;
        this.rotation += this.rotationSpeed;
        
        if (this.life <= 0) {
            this.active = false;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
