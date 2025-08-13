// export class Enemy {
//     constructor(game, lane, type = 'normal') {
//         this.game = game;
//         this.x = Math.random() * 550 + 100;
//         // Start at the 'green line' which is approximately at 40% of the canvas height
//         this.y = this.game.canvas.height * 0.4;
//         this.baseWidth = 30; // Max size
//         this.baseHeight = 30; // Max size
//         this.width = this.baseWidth; // Will be scaled in update
//         this.height = this.baseHeight; // Will be scaled in update
//         this.speed = 0.5 + Math.random() * 0.2; // Decreased speed
//         this.health = type === 'strong' ? 2 : 1;
//         this.maxHealth = this.health;
//         this.type = type;
//         this.lane = lane;
//         this.animFrame = 0;
//         this.bobOffset = Math.random() * Math.PI * 2;
//         this.hitFlash = 0;
//         this.active = true;

//         // Scale with wave difficulty
//         this.speed += this.game.wave * 0.1;
//         if (this.type === 'strong') {
//             this.health = 2 + Math.floor(this.game.wave/5);
//             this.maxHealth = this.health;
//         }
//     }

//     update(deltaTime) {
//         const canvasHeight = this.game.canvas.height;
//         const startY = canvasHeight * 0.4; // Green line y-coordinate
//         const endY = canvasHeight; // Red line y-coordinate

//         // Calculate scale factor based on y position
//         const minScale = 0.1; // Start even smaller
//         // Interpolate scale factor from minScale at startY to 1 at endY
//         let scaleFactor = minScale + (1 - minScale) * Math.max(0, (this.y - startY)) / (endY - startY);
//         scaleFactor = Math.max(minScale, Math.min(1, scaleFactor)); // Clamp between minScale and 1

//         console.log('Enemy update - y:', this.y, 'scaleFactor:', scaleFactor, 'baseWidth:', this.baseWidth, 'baseHeight:', this.baseHeight);
//         console.log('Enemy update values:', this.x, this.y, this.width, this.height, scaleFactor);
//         this.width = Math.max(0, this.baseWidth * scaleFactor); // Ensure width is not negative
//         this.height = Math.max(0, this.baseHeight * scaleFactor); // Ensure height is not negative

//         // Adjust x position to stay within the highway based on perspective
//         const centerX = this.game.canvas.width / 2;
//         const topRoadWidth = 160; // Road width at green line
//         const bottomRoadWidth = 600; // Road width at red line
//         const currentRoadWidth = topRoadWidth + (bottomRoadWidth - topRoadWidth) * Math.max(0, (this.y - startY)) / (endY - startY);

//         const minX = centerX - currentRoadWidth / 2; // Left edge of the road
//         const maxX = centerX + currentRoadWidth / 2 - this.width;

//         // Ensure enemy stays within calculated bounds, while maintaining some randomness
//         this.x = Math.max(minX, Math.min(maxX, this.x));
//         // Add slight random movement within bounds if desired, or just clamp
//         // this.x += (Math.random() - 0.5) * 2; // Optional: add slight horizontal wobble

//         this.y += this.speed * (deltaTime / 16);
//         this.animFrame++;
//         if (this.hitFlash > 0) this.hitFlash--;

//         if (this.y > this.game.canvas.height) {
//             this.active = false;
//             this.game.health -= this.type === 'strong' ? 10 : 5;
//             this.game.updateUI();
            
//             if (this.game.health <= 0) {
//                 this.game.gameOver();
//             }
//         }
//     }

//     takeDamage(amount) {
//         this.health -= amount;
//         this.hitFlash = 10;
        
//         if (this.health <= 0) {
//             this.active = false;
//             // Handle scoring and powerups in game.js
//         }
//     }

//     render(ctx) {
//         const bobY = this.y + Math.sin(this.animFrame * 0.1 + this.bobOffset) * 3;
        
//         // Enemy shadow
//         ctx.globalAlpha = 0.4;
//         ctx.fillStyle = '#000000';
//         ctx.beginPath();
//         ctx.ellipse(this.x + this.width/2, bobY + this.height + 8, this.width/2, 6, 0, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.globalAlpha = 1;
        
//         // Hit flash effect
//         if (this.hitFlash > 0) {
//             ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash/10})`;
//             ctx.beginPath();
//             ctx.arc(this.x + this.width/2, bobY + this.height/2, Math.max(0, this.width/2 + 5), 0, Math.PI * 2);
//             ctx.fill();
//         }

//         // Enemy body gradient
//         console.log('Gradient args:', this.x + this.width/2, bobY + this.height/2, 0, this.x + this.width/2, bobY + this.height/2, this.width/2);
//         console.log('Enemy render values before gradient:', this.x, bobY, this.width, this.height);
//         const gradient = ctx.createRadialGradient(
//             this.x + this.width/2, bobY + this.height/2, 0,
//             this.x + this.width/2, bobY + this.height/2, this.width/2
//         );
        
//         if (this.type === 'strong') {
//             gradient.addColorStop(0, '#FF3355');
//             gradient.addColorStop(1, '#990022');
//         } else {
//             gradient.addColorStop(0, '#FF9933');
//             gradient.addColorStop(1, '#CC6600');
//         }
        
//         ctx.fillStyle = gradient;
//         ctx.beginPath();
//         ctx.arc(this.x + this.width/2, bobY + this.height/2, Math.max(0, this.width/2), 0, Math.PI * 2);
//         ctx.fill();

//         // Enemy details
//         ctx.fillStyle = '#331100';
//         ctx.beginPath();
//         ctx.arc(this.x + this.width/2, bobY + this.height/2, Math.max(0, this.width/2 - 6), 0, Math.PI * 2);
//         ctx.fill();

//         // Glowing eyes
//         ctx.shadowColor = '#FF0000';
//         ctx.shadowBlur = 15;
//         ctx.fillStyle = '#FF0000';
//         ctx.beginPath();
//         ctx.arc(this.x + this.width/2 - Math.max(0, this.width * 0.15), bobY + this.height/2 - Math.max(0, this.height * 0.1), Math.max(0, this.width * 0.08), 0, Math.PI * 2);
//         ctx.arc(this.x + this.width/2 + Math.max(0, this.width * 0.15), bobY + this.height/2 - Math.max(0, this.height * 0.1), Math.max(0, this.width * 0.08), 0, Math.PI * 2);
//         ctx.fill();
//         ctx.shadowBlur = 0;

//         // Mouth
//         ctx.fillStyle = '#000';
//         ctx.beginPath();
//         ctx.arc(this.x + this.width/2, bobY + this.height/2 + 10, 8, 0.1 * Math.PI, 0.9 * Math.PI);
//         ctx.fill();
        
//         // Health bar (only if damaged)
//         if (this.health < this.maxHealth) {
//             ctx.fillStyle = '#FF0000';
//             ctx.fillRect(this.x - 5, bobY - 15, this.width + 10, 6);
//             ctx.fillStyle = '#00FF00';
//             ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 6);
            
//             // Health bar glow
//             ctx.shadowColor = '#00FF00';
//             ctx.shadowBlur = 10;
//             ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 3);
//             ctx.shadowBlur = 0;
//         }
//     }
// }

export class Enemy {
    constructor(game, lane = 'left', type = 'normal') {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;

        this.baseWidth = 30;
        this.baseHeight = 30;
        this.width = this.baseWidth;
        this.height = this.baseHeight;

        this.y = this.canvas.height * 0.4; // Start at green line
        const laneBounds = this.getLaneBounds(this.y, lane);
        this.x = Math.random() * (laneBounds.maxX - laneBounds.minX - this.baseWidth) + laneBounds.minX;

        this.speed = 0.5 + Math.random() * 0.2;
        this.health = type === 'strong' ? 2 : 1;
        this.maxHealth = this.health;
        this.type = type;
        this.lane = lane;
        this.animFrame = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.hitFlash = 0;
        this.active = true;

        this.speed += this.game.wave * 0.1;
        if (this.type === 'strong') {
            this.health = 2 + Math.floor(this.game.wave / 5);
            this.maxHealth = this.health;
        }
    }

    getLaneBounds(y, lane) {
        const centerX = this.canvas.width / 2;
        const topRoadWidth = 160;
        const bottomRoadWidth = 600;
        const startY = this.canvas.height * 0.4;
        const endY = this.canvas.height;
        const currentRoadWidth = topRoadWidth + (bottomRoadWidth - topRoadWidth) * Math.max(0, (y - startY)) / (endY - startY);
        const laneWidth = currentRoadWidth / 2;

        if (lane === 'left') {
            return {
                minX: centerX - currentRoadWidth / 2,
                maxX: centerX - laneWidth / 2
            };
        } else {
            return {
                minX: centerX + laneWidth / 2,
                maxX: centerX + currentRoadWidth / 2
            };
        }
    }

    update(deltaTime) {
        const canvasHeight = this.canvas.height;
        const startY = canvasHeight * 0.4;
        const endY = canvasHeight;

        const minScale = 0.1;
        let scaleFactor = minScale + (1 - minScale) * Math.max(0, (this.y - startY)) / (endY - startY);
        scaleFactor = Math.max(minScale, Math.min(1, scaleFactor));

        this.width = Math.max(0, this.baseWidth * scaleFactor);
        this.height = Math.max(0, this.baseHeight * scaleFactor);

        const laneBounds = this.getLaneBounds(this.y, this.lane);
        this.x = Math.max(laneBounds.minX, Math.min(laneBounds.maxX - this.width, this.x));

        this.y += this.speed * (deltaTime / 16);
        this.animFrame++;
        if (this.hitFlash > 0) this.hitFlash--;

        if (this.y > canvasHeight) {
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
            // Scoring and powerups handled in game.js
        }
    }

    render(ctx) {
        const bobY = this.y + Math.sin(this.animFrame * 0.1 + this.bobOffset) * 3;

        // Shadow
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, bobY + this.height + 8, this.width / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.hitFlash / 10})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, bobY + this.height / 2, Math.max(0, this.width / 2 + 5), 0, Math.PI * 2);
            ctx.fill();
        }

        // Body gradient
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, bobY + this.height / 2, 0,
            this.x + this.width / 2, bobY + this.height / 2, this.width / 2
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
        ctx.arc(this.x + this.width / 2, bobY + this.height / 2, Math.max(0, this.width / 2), 0, Math.PI * 2);
        ctx.fill();

        // Inner body
        ctx.fillStyle = '#331100';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, bobY + this.height / 2, Math.max(0, this.width / 2 - 6), 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - Math.max(0, this.width * 0.15), bobY + this.height / 2 - Math.max(0, this.height * 0.1), Math.max(0, this.width * 0.08), 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + Math.max(0, this.width * 0.15), bobY + this.height / 2 - Math.max(0, this.height * 0.1), Math.max(0, this.width * 0.08), 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Mouth
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, bobY + this.height / 2 + 10, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();

        // Health bar
        if (this.health < this.maxHealth) {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(this.x - 5, bobY - 15, this.width + 10, 6);
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 6);

            ctx.shadowColor = '#00FF00';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x - 5, bobY - 15, ((this.width + 10) * this.health) / this.maxHealth, 3);
            ctx.shadowBlur = 0;
        }
    }
}
