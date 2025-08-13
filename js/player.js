export class Player {
    constructor(game) {
        this.game = game;
        this.x = 400;
        this.y = 550;
        
        // Sprite properties (original size)
        this.spriteWidth = 1024;
        this.spriteHeight = 1536;
        
        // Display size (change these to scale up)
        this.width = 48;
        this.height = 48;
        
        this.speed = 6;
        
        // Animation properties
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 0;
        this.animationTimer = 0;
        this.animationInterval = 250;
        
        // Image loading with robust handling
        this.image = new Image();
        this.image.src = 'assets/player/soldier.png';
        this.image.onload = () => {
            console.log("Player sprite loaded");
            this.spriteReady = true;
        };
        this.image.onerror = () => {
            console.error("Sprite failed to load");
            this.spriteReady = false;
        };
        this.spriteReady = false;
    }

    update(deltaTime) {
        // Movement handling
        if ((this.game.keys['a'] || this.game.keys['arrowleft']) && this.x > 100) {
            this.x -= this.speed;
        }
        
        if ((this.game.keys['d'] || this.game.keys['arrowright']) && this.x < 650) {
            this.x += this.speed;
        }

        // Always animate regardless of movement
        this.animationTimer += deltaTime;
        if (this.animationTimer > this.animationInterval) {
            this.animationTimer = 0;
            this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
        }
    }

    render(ctx) {
        if (!this.spriteReady) {
            // Fallback rendering
            ctx.fillStyle = '#3498db';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PLAYER', this.x + this.width/2, this.y + this.height/2);
            return;
        }

        // Main sprite rendering
        ctx.drawImage(
            this.image,
            this.frameX * this.spriteWidth,
            this.frameY * this.spriteHeight,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );

        // Health bar
        this.drawHealthBar(ctx);
    }

    drawHealthBar(ctx) {
        const barWidth = this.width + 10;
        const barHeight = 8;
        const barX = this.x - 5;
        const barY = this.y - 20;
        
        // Background
        ctx.fillStyle = 'rgba(255,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health level
        const healthWidth = (barWidth * this.game.health) / this.game.maxHealth;
        ctx.fillStyle = 'rgba(0,255,0,0.7)';
        ctx.fillRect(barX, barY, healthWidth, barHeight);
        
        // Border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}
