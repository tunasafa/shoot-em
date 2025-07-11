export function updateUI() {
    document.getElementById('score').textContent = this.score;
    document.getElementById('health').textContent = this.health;
    document.getElementById('ammo').textContent = this.ammo;
    document.getElementById('power').textContent = this.power;
    document.getElementById('wave').textContent = this.wave;
    document.getElementById('fireRate').textContent = this.fireRate;
}

export function showUpgradeMessage(text) {
    const notification = document.getElementById('upgradeNotification');
    notification.textContent = text;
    notification.style.opacity = 1;
    
    setTimeout(() => {
        notification.style.opacity = 0;
    }, 1500);
}

export function gameOver() {
    this.gameRunning = false;
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('gameOver').style.display = 'block';
}

export function restart() {
    this.score = 0;
    this.health = this.maxHealth;
    this.ammo = 20;
    this.power = 1;
    this.fireRate = 1;
    this.wave = 1;
    this.waveTimer = 0;
    this.enemiesDefeated = 0;
    this.nextPowerUpAt = 3;
    this.comboMultiplier = 1;
    
    this.player.x = 400;
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    
    document.getElementById('gameOver').style.display = 'none';
    this.updateUI();
    this.gameRunning = true;
}

export function spawnEnemy() {
    const lane = Math.floor(Math.random() * 2);
    let typeChance = 0.05 + (this.wave * 0.01);
    typeChance = Math.min(typeChance, 0.2);
    const type = Math.random() < typeChance ? 'strong' : 'normal';
    
    const enemy = new Enemy(this, lane, type);
    enemy.speed += this.wave * 0.1;
    
    if (type === 'strong') {
        enemy.health = 2 + Math.floor(this.wave/5);
        enemy.maxHealth = enemy.health;
    }
    
    this.enemies.push(enemy);
}

export function spawnPowerUp(x, y) {
    const types = ['+', '×', '÷'];
    const type = types[Math.floor(Math.random() * types.length)];
    this.powerUps.push(new PowerUp(this, x, y, type));
    this.nextPowerUpAt = this.enemiesDefeated + Math.max(2, 5 - Math.floor(this.wave/3));
}

export function autoShoot() {
    const currentTime = Date.now();
    const shootInterval = Math.max(50, 600 - (this.fireRate * 50));
    
    if (currentTime - this.lastShot >= shootInterval && this.ammo > 0) {
        this.shoot();
        this.lastShot = currentTime;
    }
}

export function shoot() {
    const bulletCount = Math.min(3, Math.floor(this.power/3) + 1);
    const spread = (bulletCount - 1) * 5;
    
    for (let i = 0; i < bulletCount; i++) {
        const offset = (i - (bulletCount - 1)/2) * spread;
        this.bullets.push(new Bullet(
            this,
            this.player.x + this.player.width/2 - 4 + offset, 
            this.player.y, 
            this.power
        ));
    }
    
    this.ammo--;
    this.updateUI();
}

export function createExplosion(x, y, color, count = 15, size = 1) {
    for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this, x, y, color));
        if (size > 1) {
            for (let j = 0; j < size; j++) {
                this.particles.push(new Particle(
                    this,
                    x + (Math.random() - 0.5) * 10, 
                    y + (Math.random() - 0.5) * 10, 
                    color
                ));
            }
        }
    }
}

export function drawBackground() {
    const { ctx, canvas } = this;
    
    // Draw desert sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#F39C12');  // Bright desert sun
    skyGradient.addColorStop(0.5, '#E67E22'); // Dusty orange
    skyGradient.addColorStop(1, '#D35400');  // Deep desert color
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);
    
    // Draw desert ground
    const sandGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
    sandGradient.addColorStop(0, '#EDBB99'); // Light sand
    sandGradient.addColorStop(1, '#DC7633'); // Darker sand
    
    ctx.fillStyle = sandGradient;
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);
    
    // Draw degraded highway
    const highwayWidth = 300;
    const highwayX = (canvas.width - highwayWidth) / 2;
    
    // Base asphalt with cracks and wear
    ctx.fillStyle = '#34495E';
    ctx.fillRect(highwayX, 0, highwayWidth, canvas.height);
    
    // Draw road damage patterns
    ctx.fillStyle = '#5D6D7E';
    for (let i = 0; i < 15; i++) {
        const crackX = highwayX + Math.random() * highwayWidth;
        const crackWidth = 5 + Math.random() * 30;
        const crackHeight = 10 + Math.random() * 50;
        ctx.fillRect(crackX, Math.random() * canvas.height, crackWidth, crackHeight);
    }
    
    // Sand drifts encroaching on the road
    ctx.fillStyle = 'rgba(237, 187, 153, 0.7)';
    for (let i = 0; i < 8; i++) {
        const driftX = i % 2 === 0 ? highwayX - 20 : highwayX + highwayWidth;
        const driftWidth = 40 + Math.random() * 60;
        const segments = 5 + Math.floor(Math.random() * 10);
        
        ctx.beginPath();
        ctx.moveTo(driftX, canvas.height);
        for (let s = 0; s < segments; s++) {
            const segmentY = canvas.height - (s * (canvas.height / segments));
            const segmentX = driftX + (Math.random() * 40 - 20);
            ctx.lineTo(segmentX, segmentY);
        }
        ctx.lineTo(driftX, 0);
        ctx.closePath();
        ctx.fill();
    }
    
    // Faded lane markings (original center divider)
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 4;
    ctx.setLineDash([40, 30]); // Broken line pattern
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw distant desert mountains
    ctx.fillStyle = '#A04000';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.6);
    for (let i = 0; i < 20; i++) {
        const x = i * (canvas.width / 20);
        const y = canvas.height * (0.5 + Math.random() * 0.1);
        ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height * 0.6);
    ctx.lineTo(canvas.width, canvas.height * 0.7);
    ctx.lineTo(0, canvas.height * 0.7);
    ctx.closePath();
    ctx.fill();
    
    // Add heat distortion effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 5; i++) {
        const waveHeight = 2 + Math.random() * 8;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.7 + Math.random() * 50);
        for (let x = 0; x < canvas.width; x += 20) {
            ctx.lineTo(x, canvas.height * 0.7 + Math.sin(x * 0.01 + i) * waveHeight);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        ctx.fill();
    }
}

export function checkCollisions() {
    // Bullet vs Enemy collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
            const bullet = this.bullets[i];
            const enemy = this.enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                enemy.takeDamage(bullet.power);
                this.createExplosion(bullet.x + bullet.width/2, bullet.y + bullet.height/2, '#FFD700', 8);
                this.bullets.splice(i, 1);
                
                if (enemy.health <= 0) {
                    const currentTime = Date.now();
                    if (currentTime - this.lastEnemyKillTime < 1000) {
                        this.comboMultiplier = Math.min(5, this.comboMultiplier + 0.5);
                    } else {
                        this.comboMultiplier = 1;
                    }
                    this.lastEnemyKillTime = currentTime;
                    
                    const basePoints = enemy.type === 'strong' ? 30 : 15;
                    this.score += Math.floor(basePoints * this.comboMultiplier);
                    this.enemiesDefeated++;
                    
                    this.createExplosion(
                        enemy.x + enemy.width/2, 
                        enemy.y + enemy.height/2, 
                        enemy.type === 'strong' ? '#FF3355' : '#FF9933', 
                        20,
                        2
                    );
                    this.enemies.splice(j, 1);
                    
                    if (this.enemiesDefeated >= this.nextPowerUpAt) {
                        this.spawnPowerUp(enemy.x, enemy.y);
                    }
                }
                break;
            }
        }
    }
    
    // Player vs PowerUps
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
        const powerUp = this.powerUps[i];
        if (this.player.x < powerUp.x + powerUp.width &&
            this.player.x + this.player.width > powerUp.x &&
            this.player.y < powerUp.y + powerUp.height &&
            this.player.y + this.player.height > powerUp.y) {
            
            this.applyPowerUp(powerUp.type);
            this.createExplosion(
                powerUp.x + powerUp.width/2, 
                powerUp.y + powerUp.height/2, 
                powerUp.color, 
                15,
                2
            );
            this.powerUps.splice(i, 1);
        }
    }
}

export function applyPowerUp(type) {
    let message = "";
    switch(type) {
        case '+': // Ammo
            this.ammo = Math.min(this.maxAmmo, this.ammo + 10);
            message = "AMMO +10";
            break;
        case '×': // Power
            this.power = Math.min(10, this.power + 1);
            message = "POWER UP!";
            break;
        case '÷': // Fire rate
            this.fireRate = Math.min(12, this.fireRate + 1);
            message = "FASTER FIRE!";
            break;
    }
    this.showUpgradeMessage(message);
    this.updateUI();
}

export function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}
