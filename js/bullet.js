export class Bullet {
    constructor(game, x, y, power) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 20;
        this.speed = 15;
        this.power = power;
        this.trail = [];
        this.hue = 25;
        this.active = true;
    }

    update(deltaTime) {
        this.trail.push({ 
            x: this.x + this.width/2, 
            y: this.y + this.height,
            hue: this.hue
        });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
        this.y -= this.speed * (deltaTime / 16);
        this.hue = (this.hue + 2) % 360;
        
        if (this.y < 0) {
            this.active = false;
        }
    }

    render(ctx) {
        // Draw bullet trail
        ctx.globalAlpha = 0.6;
        this.trail.forEach((point, index) => {
            const alpha = (index + 1) / this.trail.length * 0.7;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `hsla(${point.hue}, 100%, 50%, ${alpha})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4 * (index/this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Draw bullet
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, `hsla(25, 100%, 80%, 1)`); // Bright light orange
        gradient.addColorStop(0.5, `hsla(20, 100%, 60%, 1)`); // Pure orange
        gradient.addColorStop(1, `hsla(15, 100%, 50%, 1)`); // Deep orange
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 4);
        ctx.fill();
        
        // Bullet glow
        ctx.shadowColor = `hsla(20, 100%, 60%, 1)`;
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, 4);
        ctx.shadowBlur = 0;
    }
}