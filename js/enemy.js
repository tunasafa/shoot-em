// Define the spawn and end line boundaries
const SPAWN_LINE = {
    xMin: 395, // Left boundary of spawn area
    xMax: 490, // Right boundary of spawn area
    y: 230    // Y position of spawn line
};

const END_LINE = {
    xMin: 400, // Left boundary of end area
    xMax: 650, // Right boundary of end area
    y: 550    // Y position of end line
};

export class Enemy {
    constructor(game, lane, type = 'normal') {
        this.game = game;
        this.initialWidth = 20; 
        this.initialHeight = 20; 
        
        // Generate random start and end points
        this.startX = Math.random() * (SPAWN_LINE.xMax - SPAWN_LINE.xMin) + SPAWN_LINE.xMin;
        this.endX = Math.random() * (END_LINE.xMax - END_LINE.xMin) + END_LINE.xMin;
        
        // Set initial position at spawn line
        this.y = SPAWN_LINE.y;
        this.x = this.startX;
        
        // Set initial size based on spawn position
        this.width = this.initialWidth;
        this.height = this.initialHeight;
        this.speed = 1 + Math.random() * 0.3;
        this.health = type === 'strong' ? 3 : type === 'ancient' ? 4 : 1;
        this.maxHealth = this.health;
        this.type = type;
        this.lane = lane;
        this.animFrame = 0;
        this.walkCycle = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.hitFlash = 0;
        this.active = true;

        // Scale with wave difficulty
        this.speed += this.game.wave * 0.1;
        if (this.type === 'strong') {
            this.health = 2 + Math.floor(this.game.wave/4);
            this.maxHealth = this.health;
        } else if (this.type === 'ancient') {
            this.health = 3 + Math.floor(this.game.wave/3);
            this.maxHealth = this.health;
        }

        // Animation parameters
        this.t = 0;
        this.scale = 1;
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 16);
        this.animFrame++;
        this.walkCycle += 0.1;
        
        if (this.hitFlash > 0) this.hitFlash--;

        
        const dy = this.y - SPAWN_LINE.y;
        const totalY = END_LINE.y - SPAWN_LINE.y;
        const t = Math.min(1, dy / totalY);
        
        // Interpolate position along the trajectory
        this.x = this.startX + (this.endX - this.startX) * t;
        
        // Update scale based on distance from player
        const minYForScale = 200;
        const maxYForScale = 550;
        const minScale = 0.2;
        const maxScale = 1.1;

        let scale = minScale + (maxScale - minScale) * ((this.y - minYForScale) / (maxYForScale - minYForScale));
        scale = Math.max(minScale, Math.min(maxScale, scale));
        this.scale = scale;

        this.width = this.initialWidth * scale;
        this.height = this.initialHeight * scale;

        // Deactivate enemy if it goes beyond the pink horizon
        if (this.y > END_LINE.y + 50) {
            this.active = false;
            this.game.health -= this.type === 'strong' ? 15 : this.type === 'ancient' ? 20 : 8;
            this.game.updateUI();
            
            if (this.game.health <= 0) {
                this.game.gameOver();
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        this.hitFlash = 15;
        
        if (this.health <= 0) {
            this.active = false;
        }
    }

    // Pixel art skeleton rendering
    render(ctx) {
        const bobY = this.y + Math.sin(this.animFrame * 0.1 + this.bobOffset) * 2 * (this.height / this.initialHeight);
        
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000000';
        const shadowWidth = this.width * 0.8;
        const shadowHeight = this.height * 0.3;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, bobY + this.height + 5, shadowWidth/2, shadowHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Hit flash effect
        if (this.hitFlash > 0) {
            const flashIntensity = this.hitFlash / 15;
            ctx.fillStyle = `rgba(255, 100, 100, ${flashIntensity * 0.7})`;
            ctx.beginPath();
            ctx.arc(this.x + this.width/2, bobY + this.height/2, this.width/2 + 8, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.drawDetailedSkeleton(ctx, bobY);
        
        // Health bar for damaged enemies
        if (this.health < this.maxHealth) {
            this.drawHealthBar(ctx, bobY);
        }
    }

    drawDetailedSkeleton(ctx, bobY) {
        const s = Math.max(1, this.scale * 2); 
        const centerX = this.x + this.width/2;
        const baseY = bobY + Math.sin(this.walkCycle + this.bobOffset) * 0.5 * s;
        
        // Skeleton pixel art coordinates (scaled)
        const skullY = baseY;
        const neckY = baseY + 6 * s;
        const shoulderY = baseY + 7 * s;
        const chestY = baseY + 8 * s;
        const waistY = baseY + 14 * s;
        const hipY = baseY + 16 * s;
        const legY = baseY + 18 * s;
        
        // Animation offsets
        const legSwing = Math.sin(this.walkCycle) * 2 * s;
        const armSwing = Math.sin(this.walkCycle + Math.PI/3) * 1.5 * s;
        const headBob = Math.sin(this.walkCycle * 2) * 0.5 * s;
        
        // Draw back arm first
        if (legSwing > 0) {
            this.drawArm(ctx, centerX - 4 * s, shoulderY, true, -armSwing, s);
        } else {
            this.drawArm(ctx, centerX + 4 * s, shoulderY, false, armSwing, s);
        }
        
        // Draw back leg
        if (legSwing > 0) {
            this.drawLeg(ctx, centerX - 2 * s, legY, true, legSwing, s);
        } else {
            this.drawLeg(ctx, centerX + 2 * s, legY, false, -legSwing, s);
        }
        
        // Draw torso
        this.drawTorso(ctx, centerX, neckY, shoulderY, chestY, waistY, hipY, s);
        
        // Draw front leg
        if (legSwing <= 0) {
            this.drawLeg(ctx, centerX - 2 * s, legY, true, legSwing, s);
        } else {
            this.drawLeg(ctx, centerX + 2 * s, legY, false, -legSwing, s);
        }
        
        // Draw front arm
        if (legSwing > 0) {
            this.drawArm(ctx, centerX + 4 * s, shoulderY, false, armSwing, s);
        } else {
            this.drawArm(ctx, centerX - 4 * s, shoulderY, true, -armSwing, s);
        }
        
        // Draw detailed skull
        this.drawSkull(ctx, centerX, skullY + headBob, s);
    }

    drawSkull(ctx, centerX, y, s) {
        const colors = this.getColors();
        
        // Top of skull (cranium)
        this.drawPixel(ctx, centerX - 2*s, y, 4*s, 1*s, colors.bone);
        this.drawPixel(ctx, centerX - 3*s, y + 1*s, 6*s, 1*s, colors.bone);
        this.drawPixel(ctx, centerX - 4*s, y + 2*s, 8*s, 3*s, colors.bone);
        this.drawPixel(ctx, centerX - 3*s, y + 5*s, 6*s, 1*s, colors.bone);
        
        // Skull shading for depth
        this.drawPixel(ctx, centerX - 3*s, y + 1*s, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX + 2*s, y + 1*s, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX - 4*s, y + 2*s, 1*s, 3*s, colors.shadow);
        this.drawPixel(ctx, centerX + 3*s, y + 2*s, 1*s, 3*s, colors.shadow);
        
        // Large, menacing eye sockets
        this.drawPixel(ctx, centerX - 3*s, y + 2*s, 2*s, 2*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX + 1*s, y + 2*s, 2*s, 2*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX - 2*s, y + 1*s, 1*s, 1*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX + 1*s, y + 1*s, 1*s, 1*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX - 4*s, y + 3*s, 1*s, 1*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX + 3*s, y + 3*s, 1*s, 1*s, colors.eyeSocket);
        
        // Glowing eyes - centered in sockets
        this.drawPixel(ctx, centerX - 2*s, y + 3*s, 1*s, 1*s, colors.eye);
        this.drawPixel(ctx, centerX + 1*s, y + 3*s, 1*s, 1*s, colors.eye);
        
        // Eye glow effect
        ctx.shadowColor = colors.eye;
        ctx.shadowBlur = 4 * s;
        this.drawPixel(ctx, centerX - 2*s, y + 3*s, 1*s, 1*s, colors.eye);
        this.drawPixel(ctx, centerX + 1*s, y + 3*s, 1*s, 1*s, colors.eye);
        ctx.shadowBlur = 0;
        
        // Triangular nasal cavity - more skull-like
        this.drawPixel(ctx, centerX - 1*s, y + 4*s, 2*s, 1*s, colors.eyeSocket);
        this.drawPixel(ctx, centerX, y + 5*s, 1*s, 1*s, colors.eyeSocket);
        
        // Jaw structure - more defined
        this.drawPixel(ctx, centerX - 3*s, y + 6*s, 6*s, 1*s, colors.bone);
        this.drawPixel(ctx, centerX - 2*s, y + 7*s, 4*s, 1*s, colors.bone);
        
        // Individual teeth - more realistic spacing
        this.drawPixel(ctx, centerX - 2*s, y + 7*s, 1*s, 1*s, colors.tooth);
        this.drawPixel(ctx, centerX - 1*s, y + 8*s, 1*s, 1*s, colors.tooth);
        this.drawPixel(ctx, centerX, y + 8*s, 1*s, 1*s, colors.tooth);
        this.drawPixel(ctx, centerX + 1*s, y + 7*s, 1*s, 1*s, colors.tooth);
        
        // Jaw shading
        this.drawPixel(ctx, centerX - 3*s, y + 6*s, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX + 2*s, y + 6*s, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX - 1*s, y + 7*s, 2*s, 1*s, colors.shadow);
        
        // Skull cracks and battle damage
        this.drawPixel(ctx, centerX - 1*s, y + 1*s, 1*s, 1*s, colors.crack);
        this.drawPixel(ctx, centerX + 2*s, y + 2*s, 1*s, 1*s, colors.crack);
        this.drawPixel(ctx, centerX - 3*s, y, 1*s, 1*s, colors.crack);
        this.drawPixel(ctx, centerX + 1*s, y + 4*s, 1*s, 1*s, colors.crack);
        
        // Temple indentations for realism
        this.drawPixel(ctx, centerX - 4*s, y + 1*s, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX + 3*s, y + 1*s, 1*s, 1*s, colors.shadow);
    }

    drawTorso(ctx, centerX, neckY, shoulderY, chestY, waistY, hipY, s) {
        const colors = this.getColors();
        
        // Neck vertebrae
        this.drawPixel(ctx, centerX - 1*s, neckY, 2*s, 1*s, colors.bone);
        
        // Shoulder bones/clavicle
        this.drawPixel(ctx, centerX - 3*s, shoulderY, 6*s, 1*s, colors.bone);
        this.drawPixel(ctx, centerX - 3*s, shoulderY, 1*s, 1*s, colors.shadow);
        this.drawPixel(ctx, centerX + 2*s, shoulderY, 1*s, 1*s, colors.shadow);
        
        // Ribcage - detailed individual ribs
        this.drawPixel(ctx, centerX - 1*s, chestY, 2*s, 6*s, colors.bone); // Spine
        
        // Individual ribs (left and right)
        for (let i = 0; i < 5; i++) {
            const ribY = chestY + i * s + s;
            const ribWidth = 3 - Math.floor(i/2);
            
            // Left ribs
            this.drawPixel(ctx, centerX - 1*s - ribWidth*s, ribY, ribWidth*s, 1*s, colors.bone);
            // Right ribs  
            this.drawPixel(ctx, centerX + 1*s, ribY, ribWidth*s, 1*s, colors.bone);
            
            // Rib shading
            if (i % 2 === 0) {
                this.drawPixel(ctx, centerX - 1*s - ribWidth*s, ribY, 1*s, 1*s, colors.shadow);
                this.drawPixel(ctx, centerX + ribWidth*s, ribY, 1*s, 1*s, colors.shadow);
            }
        }
        
        // Pelvis
        this.drawPixel(ctx, centerX - 3*s, hipY, 6*s, 2*s, colors.bone);
        this.drawPixel(ctx, centerX - 3*s, hipY, 1*s, 2*s, colors.shadow);
        this.drawPixel(ctx, centerX + 2*s, hipY, 1*s, 2*s, colors.shadow);
        this.drawPixel(ctx, centerX - 1*s, hipY + 1*s, 2*s, 1*s, colors.shadow);
    }

    drawArm(ctx, x, y, isLeft, swingOffset, s) {
        const colors = this.getColors();
        
        // Upper arm
        const upperArmX = x + swingOffset * 0.3;
        const upperArmY = y;
        this.drawPixel(ctx, upperArmX, upperArmY, 1*s, 4*s, colors.bone);
        this.drawPixel(ctx, upperArmX, upperArmY, 1*s, 1*s, colors.shadow);
        
        // Elbow joint
        const elbowX = upperArmX + swingOffset * 0.5;
        const elbowY = upperArmY + 4*s;
        this.drawPixel(ctx, elbowX - 1*s, elbowY, 3*s, 1*s, colors.bone);
        this.drawPixel(ctx, elbowX - 1*s, elbowY, 1*s, 1*s, colors.shadow);
        
        // Forearm
        const forearmX = elbowX + swingOffset * 0.7;
        const forearmY = elbowY + 1*s;
        this.drawPixel(ctx, forearmX, forearmY, 1*s, 4*s, colors.bone);
        
        // Hand
        const handX = forearmX - 1*s;
        const handY = forearmY + 4*s;
        this.drawPixel(ctx, handX, handY, 3*s, 2*s, colors.bone);
        // Finger bones
        this.drawPixel(ctx, handX, handY + 2*s, 1*s, 1*s, colors.bone);
        this.drawPixel(ctx, handX + 1*s, handY + 2*s, 1*s, 1*s, colors.bone);
        this.drawPixel(ctx, handX + 2*s, handY + 2*s, 1*s, 1*s, colors.bone);
    }

    drawLeg(ctx, x, y, isLeft, swingOffset, s) {
        const colors = this.getColors();
        
        // Thigh
        const thighX = x + swingOffset * 0.2;
        const thighY = y;
        this.drawPixel(ctx, thighX, thighY, 1*s, 5*s, colors.bone);
        this.drawPixel(ctx, thighX, thighY, 1*s, 1*s, colors.shadow);
        
        // Knee joint
        const kneeX = thighX + swingOffset * 0.4;
        const kneeY = thighY + 5*s;
        this.drawPixel(ctx, kneeX - 1*s, kneeY, 3*s, 1*s, colors.bone);
        this.drawPixel(ctx, kneeX - 1*s, kneeY, 1*s, 1*s, colors.shadow);
        
        // Shin
        const shinX = kneeX + swingOffset * 0.6;
        const shinY = kneeY + 1*s;
        this.drawPixel(ctx, shinX, shinY, 1*s, 5*s, colors.bone);
        
        // Foot
        const footX = shinX - 2*s;
        const footY = shinY + 5*s;
        this.drawPixel(ctx, footX, footY, 5*s, 2*s, colors.bone);
        this.drawPixel(ctx, footX, footY, 1*s, 1*s, colors.shadow);
        // Toe bones
        this.drawPixel(ctx, footX + 4*s, footY + 1*s, 1*s, 1*s, colors.bone);
    }

    drawPixel(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.floor(x), Math.floor(y), width, height);
    }

    getColors() {
        switch(this.type) {
            case 'strong':
                return {
                    bone: '#DDDDDD',
                    shadow: '#999999',
                    eyeSocket: '#000000',
                    eye: '#FF3333',
                    tooth: '#FFFFFF',
                    crack: '#AAAAAA'
                };
            case 'ancient':
                return {
                    bone: '#CCCC99',
                    shadow: '#999966',
                    eyeSocket: '#000000',
                    eye: '#9966FF',
                    tooth: '#FFFFCC',
                    crack: '#AAAA77'
                };
            default:
                return {
                    bone: '#E6E6E6',
                    shadow: '#BBBBBB',
                    eyeSocket: '#000000',
                    eye: '#00FF44',
                    tooth: '#FFFFFF',
                    crack: '#CCCCCC'
                };
        }
    }

    drawHealthBar(ctx, bobY) {
        const barWidth = this.width * 1.2;
        const barHeight = 6;
        const barX = this.x - (barWidth - this.width) / 2;
        const barY = bobY - 15;
        
        // Background
        ctx.fillStyle = '#330000';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health fill
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFA500' : '#FF0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        } else {
            var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
            for (var side in defaultRadius) {
                radius[side] = radius[side] || defaultRadius[side];
            }
        }
        this.beginPath();
        this.moveTo(x + radius.tl, y);
        this.lineTo(x + width - radius.tr, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.lineTo(x + width, y + height - radius.br);
        this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.lineTo(x + radius.bl, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.lineTo(x, y + radius.tl);
        this.quadraticCurveTo(x, y, x + radius.tl, y);
        this.closePath();
        return this;
    };
}
