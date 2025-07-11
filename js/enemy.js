export class Enemy {
    constructor(game, lane, type = 'normal') {
        this.game = game;
        this.x = Math.random() * 550 + 100;
        this.y = -50;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + Math.random() * 0.3;
        this.health = type === 'strong' ? 2 : 1;
        this.maxHealth = this.health;
        this.type = type;
        this.lane = lane;
        this.animFrame = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.hitFlash = 0;
        this.active = true;

        // Scale with wave difficulty
        this.speed += this.game.wave * 0.1;
        if (this.type === 'strong') {
            this.health = 2 + Math.floor(this.game.wave/5);
            this.maxHealth = this.health;
        }
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 16);
        this.animFrame++;
        if (this.hitFlash > 0) this.hitFlash--;

        if (this.y > this.game.canvas.height) {
            this.active = false;
            this.game.health -= this.type === 'strong' ? 10 : 5;
            this.game.updateUI();
            
            if (this.game.health <= 0) {
                this.game.gameOver();
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.hitFlash = 10;
        
        if (this.health <= 0) {
            this.active = false;
            // Handle scoring and powerups in game.js
        }
    }

    render(ctx) {
        const bobY = this.y + Math.sin(this.animFrame * 0.1 + this.bobOffset) * 3;
        
        // Enemy shadow
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, bobY + this.height + 8, this.width/2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash/10})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Enemy body gradient
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, bobY + this.height/2, 0,
            this.x + this.width/2, bobY + this.height/2, this.width/2
        );
        
        if (this.type === 'strong') {
            gradient.addColorStop(0, '#FF3355');
            gradient.addColorStop(1, '#990022');
        } else {
            gradient.addColorStop(0, '#FF9933');
            gradient.addColorStop(1, '#CC6600');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Enemy details
        ctx.fillStyle = '#331100';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2 - 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Glowing eyes
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 10, bobY + this.height/2 - 5, 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.width/2 + 10, bobY + this.height/2 - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, bobY + this.height/2 + 10, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
        
        // Teeth
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 4; i++) {
            ctx.fillRect(this.x + this.width/2 - 12 + i * 8, bobY + this.height/2 + 5, 4, 5);
        }
        
        // Health bar (only if damaged)
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - 5, bobY - 15, this.width + 10, 6);
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 6);
            
            // Health bar glow
            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 3);
            ctx.shadowBlur = 0;
        }
    }
}