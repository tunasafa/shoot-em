// powerup.js
export class PowerUp {
    constructor(game, type) {
        this.game = game;
        this.type = type; // 'ammo', 'power', 'firerate'
        
        // Spawn on the left side of the highway at x = 345
        this.x = 345;
        this.y = 230; // Same as enemy spawn Y
        
        // Pixel art dimensions
        this.initialWidth = 20;
        this.initialHeight = 20;
        
        this.width = this.initialWidth;
        this.height = this.initialHeight;
        this.speed = 2; // Slightly faster than enemies
        this.active = true;
        
        // Animation
        this.animFrame = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.pulse = 0;
        
        // Set colors and sprite based on type
        this.setColorByType();
    }
    
    setColorByType() {
        switch(this.type) {
            case 'ammo':
                this.primaryColor = '#4169E1'; // Royal Blue
                this.secondaryColor = '#87CEEB'; // Sky Blue
                this.accentColor = '#FFD700'; // Gold accent
                this.sprite = 'bullets';
                break;
            case 'power':
                this.primaryColor = '#FFD700'; // Gold
                this.secondaryColor = '#FFA500'; // Orange
                this.accentColor = '#FF4500'; // Red-Orange
                this.sprite = 'lightning';
                break;
            case 'firerate':
                this.primaryColor = '#FF69B4'; // Hot Pink
                this.secondaryColor = '#FF1493'; // Deep Pink
                this.accentColor = '#FFFFFF'; // White
                this.sprite = 'particles';
                break;
            default:
                this.primaryColor = '#FFFFFF';
                this.secondaryColor = '#CCCCCC';
                this.accentColor = '#999999';
                this.sprite = 'bullets';
        }
    }
    
    update(deltaTime) {
        this.y += this.speed * (deltaTime / 16);
        this.animFrame++;
        this.pulse = Math.sin(this.animFrame * 0.1) * 0.2 + 1;
        
        // Update scale based on distance (same as enemies)
        const minYForScale = 200;
        const maxYForScale = 550;
        const minScale = 0.3;
        const maxScale = 1.2;
        
        let scale = minScale + (maxScale - minScale) * ((this.y - minYForScale) / (maxYForScale - minYForScale));
        scale = Math.max(minScale, Math.min(maxScale, scale));
        
        this.width = this.initialWidth * scale;
        this.height = this.initialHeight * scale;
        
        // Deactivate if gone beyond screen
        if (this.y > 600) {
            this.active = false;
        }
    }
    
    render(ctx) {
        const bobY = this.y + Math.sin(this.animFrame * 0.1 + this.bobOffset) * 2;
        const centerX = this.x + this.width/2;
        const centerY = bobY + this.height/2;
        const scaledWidth = this.width * this.pulse;
        const scaledHeight = this.height * this.pulse;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // Draw pixel art style based on type
        this.drawPixelArtSprite(ctx, scaledWidth, scaledHeight);
        
        ctx.restore();
    }
    
    drawPixelArtSprite(ctx, width, height) {
        ctx.imageSmoothingEnabled = false;
        
        switch(this.sprite) {
            case 'bullets':
                this.drawThreeBulletsSprite(ctx, width, height);
                break;
            case 'lightning':
                this.drawExplosionSprite(ctx, width, height);
                break;
            case 'particles':
                this.drawWindSprite(ctx, width, height);
                break;
        }
    }
    
    // Enhanced sprite methods for powerup.js - Bigger and better designs

drawThreeBulletsSprite(ctx, width, height) {
    const w = Math.floor(width * 1.3); // 30% bigger
    const h = Math.floor(height * 1.3); // 30% bigger
    
    ctx.save();
    ctx.translate(-w/2, -h/2);
    
    // Draw a simple plus sign for ammo
    ctx.fillStyle = '#4169E1'; // Royal Blue
    ctx.fillRect(w/2 - w/6, 0, w/3, h); // Vertical bar
    ctx.fillRect(0, h/2 - h/6, w, h/3); // Horizontal bar
    
    // Add a white highlight
    ctx.fillStyle = '#87CEEB'; // Sky Blue
    ctx.fillRect(w/2 - w/8, h/4, w/4, h/2); // Vertical highlight
    ctx.fillRect(w/4, h/2 - h/8, w/2, h/4); // Horizontal highlight
    
    ctx.restore();
}

drawExplosionSprite(ctx, width, height) {
    const w = Math.floor(width * 1.3); // 30% bigger
    const h = Math.floor(height * 1.3); // 30% bigger
    
    ctx.save();
    ctx.translate(-w/2, -h/2);
    
    // Draw a simple star for explosion
    ctx.fillStyle = '#FFD700'; // Gold
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI/2;
        const x = w/2 + Math.cos(angle) * w/2;
        const y = h/2 + Math.sin(angle) * h/2;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    // Add inner star
    ctx.fillStyle = '#FF4500'; // Red-Orange
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI/2;
        const x = w/2 + Math.cos(angle) * w/4;
        const y = h/2 + Math.sin(angle) * h/4;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

drawWindSprite(ctx, width, height) {
    const w = Math.floor(width * 1.3); // 30% bigger
    const h = Math.floor(height * 1.3); // 30% bigger
    
    ctx.save();
    ctx.translate(-w/2, -h/2);
    
    // Draw three simple arrows
    const arrowWidth = w * 0.3;
    const arrowHeight = h * 0.3;
    
    // Function to draw a simple arrow
    function drawArrow(x, y, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + arrowWidth/2, y);
        ctx.lineTo(x, y + arrowHeight);
        ctx.lineTo(x + arrowWidth, y + arrowHeight);
        ctx.closePath();
        ctx.fill();
    }
    
    // Draw three arrows in sequence (green shades)
    drawArrow(0, 0, '#90EE90'); // Light green
    drawArrow(w*0.35, h*0.2, '#32CD32'); // Lime green
    drawArrow(w*0.7, h*0.4, '#006400'); // Dark green
    
    ctx.restore();
}
    
    // Check collision with player
    checkCollision(player) {
        return this.x < player.x + player.width &&
               this.x + this.width > player.x &&
               this.y < player.y + player.height &&
               this.y + this.height > player.y;
    }
    
    // Apply power-up effect
    applyEffect() {
        switch(this.type) {
            case 'ammo':
                this.game.ammo = Math.min(this.game.maxAmmo, this.game.ammo + 15);
                this.game.showUpgradeMessage("AMMO +15");
                break;
            case 'power':
                this.game.power = Math.min(10, this.game.power + 1);
                this.game.showUpgradeMessage("POWER +1");
                break;
            case 'firerate':
                this.game.fireRate = Math.min(10, this.game.fireRate + 1);
                this.game.showUpgradeMessage("FIRE RATE +1");
                break;
        }
        this.game.updateUI();
        this.game.createExplosion(this.x + this.width/2, this.y + this.height/2, this.primaryColor, 15, 1);
    }
}