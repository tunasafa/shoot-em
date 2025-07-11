export class PowerUp {
    constructor(game, x, y, type) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.speed = 2;
        this.type = type;
        this.color = this.getColor();
        this.symbol = type;
        this.rotationAngle = 0;
        this.pulseScale = 1;
        this.pulseDirection = 1;
        this.hue = type === '+' ? 120 : (type === '×' ? 240 : 300);
        this.active = true;
    }

    getColor() {
        switch(this.type) {
            case '+': return '#00FF00';
            case '×': return '#0066FF';
            case '÷': return '#FF00FF';
            default: return '#FFFF00';
        }
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 16);
        this.rotationAngle += 0.05;
        this.pulseScale += 0.02 * this.pulseDirection;
        if (this.pulseScale > 1.3 || this.pulseScale < 0.7) {
            this.pulseDirection *= -1;
        }
        this.hue = (this.hue + 1) % 360;
        
        if (this.y > this.game.canvas.height) {
            this.active = false;
        }
    }

    render(ctx) {
        const centerX = this.x + this.width/2;
        const centerY = this.y + this.height/2;
        
        // Outer glow
        ctx.shadowColor = `hsla(${this.hue}, 100%, 50%, 0.7)`;
        ctx.shadowBlur = 20;
        
        // Rotating outer ring
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotationAngle);
        ctx.scale(this.pulseScale, this.pulseScale);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width/2);
        gradient.addColorStop(0, `hsla(${this.hue}, 100%, 50%, 1)`);
        gradient.addColorStop(0.8, 'hsla(0, 0%, 100%, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner core
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2 - 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Symbol
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, 1)`;
        ctx.font = 'bold 22px Orbitron';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        
        ctx.restore();
        ctx.shadowBlur = 0;
    }
}