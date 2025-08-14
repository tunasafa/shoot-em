import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';
import { Particle } from './particle.js';

export class Game {
    constructor() {
 console.log('Game class constructor started');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.keys = {};
        this.gameRunning = false;

        // Game state
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.ammo = 20;
        this.maxAmmo = 30;
        this.power = 1;
        this.fireRate = 1;
        this.wave = 1;
        this.waveTimer = 0;
        this.lastAmmoRegen = 0;
        this.lastShot = 0;
        this.enemiesDefeated = 0;
        this.comboMultiplier = 1;
        this.lastEnemyKillTime = 0;
        this.frameCount = 0; // Added missing frameCount property
        
        // Game objects
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.backgroundStars = []; // Added missing backgroundStars array
        
        // Initialize background stars/sand particles
        this.initBackgroundParticles();
        
        // Event listeners
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        console.log('Restart button event listener attached.');
 console.log('Game class constructor finished');
    }

    // Initialize background sand particles
    initBackgroundParticles() {
        for (let i = 0; i < 50; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                alpha: Math.random() * 0.5 + 0.3,
                twinklePhase: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
    }

    async init() {
        this.player = new Player(this);
        this.updateUI();
        this.gameRunning = true;
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        if (!this.gameRunning) return;
        
        this.waveTimer++;
        this.frameCount++; // Increment frame count for animations
        
        // Wave progression (every 20 seconds)
        if (this.waveTimer > 1200) {
            this.wave++;
            this.waveTimer = 0;
            this.showUpgradeMessage(`WAVE ${this.wave}!`);
            this.updateUI();
        }
        
        // Ammo regeneration (every second)
        if (Date.now() - this.lastAmmoRegen > 1000) {
            if (this.ammo < this.maxAmmo) this.ammo++;
            this.lastAmmoRegen = Date.now();
            this.updateUI();
        }
        
        // Update player
        this.player.update(deltaTime);
        
        // Auto shooting
        this.autoShoot();
        
        // Controlled enemy spawning
        if (Math.random() < 0.006 + (this.wave * 0.002)) {
            this.spawnEnemy();
        }
        
        // Update game objects
        this.bullets.forEach(bullet => bullet.update(deltaTime));
        this.bullets = this.bullets.filter(bullet => bullet.active);
        
        this.enemies.forEach(enemy => enemy.update(deltaTime));
        this.enemies = this.enemies.filter(enemy => enemy.active);

        
        this.particles.forEach(particle => particle.update(deltaTime));


        this.particles = this.particles.filter(particle => particle.active);
        
        this.checkCollisions();
    }

    render() {
        this.drawBackground();
        
        // Draw game objects
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        this.player.render(this.ctx);
    }


    drawRealisticCactus(x, y, scale) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    
    // Main trunk with rounded edges
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.roundRect(-12, -85, 24, 105, 5);
    this.ctx.fill();
    
    // Trunk highlight
    this.ctx.fillStyle = '#32CD32';
    this.ctx.beginPath();
    this.ctx.roundRect(-10, -83, 8, 100, 3);
    this.ctx.fill();
    
    // Trunk shadow
    this.ctx.fillStyle = '#1F5F1F';
    this.ctx.beginPath();
    this.ctx.roundRect(2, -83, 8, 100, 3);
    this.ctx.fill();
    
    // Left arm (bigger, positioned up)
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.roundRect(-40, -65, 18, 40, 4);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.roundRect(-40, -70, 28, 18, 4);
    this.ctx.fill();
    
    // Left arm highlight
    this.ctx.fillStyle = '#32CD32';
    this.ctx.beginPath();
    this.ctx.roundRect(-38, -63, 6, 35, 2);
    this.ctx.fill();
    
    // Right arm (smaller)
    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.roundRect(22, -45, 15, 30, 3);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.roundRect(17, -50, 20, 15, 3);
    this.ctx.fill();
    
    // Right arm highlight
    this.ctx.fillStyle = '#32CD32';
    this.ctx.beginPath();
    this.ctx.roundRect(24, -43, 5, 25, 2);
    this.ctx.fill();
    
    // Add simple spine details
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 6; i++) {
        this.ctx.beginPath();
        this.ctx.arc(-8 + (i % 2) * 8, -70 + Math.floor(i / 2) * 25, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    this.ctx.restore();
}

drawRealisticShrub(x, y, scale) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.scale(scale, scale);
    
    // Multiple overlapping circles for natural look
    const shrubColor = 'rgba(107, 142, 35, 0.8)';
    const highlightColor = 'rgba(154, 205, 50, 0.6)';
    
    this.ctx.fillStyle = shrubColor;
    
    // Base shrub masses
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(-12, -8, 14, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(10, -5, 12, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(-5, 8, 10, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Highlight areas
    this.ctx.fillStyle = highlightColor;
    this.ctx.beginPath();
    this.ctx.arc(-3, -8, 8, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(5, -10, 6, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
}


    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('health').textContent = this.health;
        document.getElementById('ammo').textContent = this.ammo;
        document.getElementById('power').textContent = this.power;
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('fireRate').textContent = this.fireRate;
    }

    showUpgradeMessage(text) {
        const notification = document.getElementById('upgradeNotification');
        notification.textContent = text;
        notification.style.opacity = 1;
        
        setTimeout(() => {
            notification.style.opacity = 0;
        }, 1500);
    }

    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }

    restart() {
        console.log('Restart button clicked!');
        this.score = 0;
        this.health = this.maxHealth;
        this.ammo = 20;
        this.power = 1;
        this.fireRate = 1;
        this.wave = 1;
        this.waveTimer = 0;
        this.enemiesDefeated = 0;
        this.comboMultiplier = 1;
        this.frameCount = 0;
        
        this.player.x = 400;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        
        // Reinitialize background particles
        this.initBackgroundParticles();
        
        document.getElementById('gameOver').style.display = 'none';
        this.updateUI();
        this.gameRunning = true;
    }

    spawnEnemy() {
        let typeChance = 0.05 + (this.wave * 0.01);
        typeChance = Math.min(typeChance, 0.2);
        const type = Math.random() < typeChance ? 'strong' : 'normal';

        const x = Math.random() * (this.canvas.width - 100) + 50; // Spawn randomly within canvas width
        this.enemies.push(new Enemy(this, x, type));
    }


    autoShoot() {
        const currentTime = Date.now();
        const shootInterval = Math.max(50, 600 - (this.fireRate * 50));
        
        if (currentTime - this.lastShot >= shootInterval && this.ammo > 0) {
            this.shoot();
            this.lastShot = currentTime;
        }
    }

    shoot() {
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
        
        // Play shoot sound
        const shootSound = new Audio('assets/sounds/shoot.wav');
        shootSound.volume = 0.25;
        shootSound.play().catch(e => console.log("Audio play failed:", e));


        this.ammo--;
        this.updateUI();
    }

    createExplosion(x, y, color, count = 15, size = 1) {
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


    drawBackground() {
    // Create sky gradient - warm desert sunset colors
    const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 0.6);
    skyGradient.addColorStop(0, '#FFB347');    // Peach
    skyGradient.addColorStop(0.3, '#FF8C69');  // Salmon
    skyGradient.addColorStop(0.6, '#FF6347');  // Tomato
    skyGradient.addColorStop(1, '#CD853F');    // Peru
    
    this.ctx.fillStyle = skyGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.6);
    
    // Draw distant mountains/mesa silhouettes
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(139, 69, 19, 0.8)'; // Dark brown silhouette
    
    // Left mountain range
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height * 0.1);
    this.ctx.lineTo(100, this.canvas.height * 0.25);
    this.ctx.lineTo(180, this.canvas.height * 0.3);
    this.ctx.lineTo(250, this.canvas.height * 0.3);
    this.ctx.lineTo(320, this.canvas.height * 0.4);
    this.ctx.lineTo(0, this.canvas.height * 0.4);
    this.ctx.fill();
    
    // Right mountain range
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width, this.canvas.height * 0.3);
    this.ctx.lineTo(this.canvas.width - 100, this.canvas.height * 0.28);
    this.ctx.lineTo(this.canvas.width - 180, this.canvas.height * 0.32);
    this.ctx.lineTo(this.canvas.width - 250, this.canvas.height * 0.3);
    this.ctx.lineTo(this.canvas.width - 320, this.canvas.height * 0.4);
    this.ctx.lineTo(this.canvas.width, this.canvas.height * 0.4);
    this.ctx.fill();
    
   
    this.ctx.restore();
    
    // Draw desert floor gradient with sand waves
    const desertGradient = this.ctx.createLinearGradient(0, this.canvas.height * 0.1, 0, this.canvas.height);
    desertGradient.addColorStop(0, '#DEB887');  // Burlywood
    desertGradient.addColorStop(0.5, '#D2691E'); // Chocolate
    desertGradient.addColorStop(1, '#A0522D');   // Sienna
    
    this.ctx.fillStyle = desertGradient;
    this.ctx.fillRect(0, this.canvas.height * 0.4, this.canvas.width, this.canvas.height * 0.6);
    
    // Add sand waves and dunes
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(244, 164, 96, 0.6)';
    
    // Draw rolling sand waves
    for (let i = 0; i < 4; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height * 0.9);
        
        for (let x = 0; x <= this.canvas.width; x += 20) {
            const waveHeight = Math.sin(x * 0.01 + i * 1.5 + this.frameCount * 0.01) * 15;
            const baseY = this.canvas.height * (0.55 + i * 0.08);
            this.ctx.lineTo(x, baseY + waveHeight);
        }
        
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.fill();
    }
    
    // Add sand ripples
    this.ctx.strokeStyle = 'rgba(210, 180, 140, 0.4)';
    this.ctx.lineWidth = 2;
    
    for (let i = 0; i < 8; i++) {
        this.ctx.beginPath();
        const rippleY = this.canvas.height * (0.5 + i * 0.05);
        
        for (let x = 0; x <= this.canvas.width; x += 15) {
            const rippleHeight = Math.sin(x * 0.02 + i * 0.8 + this.frameCount * 0.005) * 8;
            if (x === 0) {
                this.ctx.moveTo(x, rippleY + rippleHeight);
            } else {
                this.ctx.lineTo(x, rippleY + rippleHeight);
            }
        }
        this.ctx.stroke();
    }
    
    this.ctx.restore();
    
    // Draw road with perspective (2x larger)
    const roadWidth = 600;
    const roadTop = this.canvas.height * 0.4;
    const roadBottom = this.canvas.height;
    const centerX = this.canvas.width / 2;
    
    // Enhanced cacti with more realistic shapes
    this.drawRealisticCactus(70, this.canvas.height * 0.45, 0.7);
    this.drawRealisticCactus(this.canvas.width - 100, this.canvas.height * 0.52, 0.7);
    this.drawRealisticCactus(180, this.canvas.height * 0.58, 0.6);
    this.drawRealisticCactus(this.canvas.width - 200, this.canvas.height * 0.55, 0.8);
    
    // Enhanced shrubs with variety
    this.drawRealisticShrub(140, this.canvas.height * 0.62, 0.5);
    this.drawRealisticShrub(this.canvas.width - 160, this.canvas.height * 0.65, 0.4);
    this.drawRealisticShrub(60, this.canvas.height * 0.68, 0.6);
    this.drawRealisticShrub(this.canvas.width - 80, this.canvas.height * 0.7, 0.3);
    

    // Road surface
    this.ctx.fillStyle = '#798787';
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 80, roadTop);
    this.ctx.lineTo(centerX + 80, roadTop);
    this.ctx.lineTo(centerX + roadWidth/2, roadBottom);
    this.ctx.lineTo(centerX - roadWidth/2, roadBottom);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Road center line with perspective
    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([20, 15]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, roadTop);
    this.ctx.lineTo(centerX, roadBottom);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Road edges
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 3;
    
    // Left edge
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 80, roadTop);
    this.ctx.lineTo(centerX - roadWidth/2, roadBottom);
    this.ctx.stroke();
    
    // Right edge
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + 80, roadTop);
    this.ctx.lineTo(centerX + roadWidth/2, roadBottom);
    this.ctx.stroke();

    
    // Add sun
    this.ctx.save();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.shadowColor = '#FFD700';
    this.ctx.shadowBlur = 30;
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width * 0.8, this.canvas.height * 0.15, 40, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    
    // Add floating dust particles
    this.ctx.fillStyle = 'rgba(244, 164, 96, 0.6)';
    this.backgroundStars.forEach(particle => {
        particle.twinklePhase += particle.twinkleSpeed;
        const shimmer = Math.sin(particle.twinklePhase) * 0.3 + 0.7;
        
        this.ctx.globalAlpha = particle.alpha * shimmer * 0.5;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        particle.y += particle.speed * 0.3;
        particle.x += Math.sin(particle.y * 0.008) * 0.2;
        
        if (particle.y > this.canvas.height) {
            particle.y = -particle.size;
            particle.x = Math.random() * this.canvas.width;
        }
    });
    this.ctx.globalAlpha = 1;
    
    // Add heat shimmer effect
    this.ctx.save();
    this.ctx.globalAlpha = 0.05;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < 3; i++) {
        const wave = Math.sin(this.frameCount * 0.03 + i * 0.7) * 5;
        this.ctx.beginPath();
        for (let x = 0; x < this.canvas.width; x += 10) {
            const y = this.canvas.height * 0.5 + wave + Math.sin(x * 0.01) * 2;
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }
    this.ctx.restore();
}


    checkCollisions() {
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
                        
                    }
                    break;
                }
            }
        }
                
    }
}

