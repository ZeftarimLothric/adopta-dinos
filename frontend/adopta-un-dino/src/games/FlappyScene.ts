import Phaser from 'phaser';

interface FlappyConfig {
  PTERO: {
    JUMP_STRENGTH: number;
    GRAVITY: number;
    MAX_VELOCITY: number;
    ROTATION_FACTOR: number;
    SIZE: number;
    FLAP_ANIMATION_SPEED: number;
  };
  OBSTACLES: {
    WIDTH: number;
    GAP: number;
    MIN_HEIGHT: number;
    MAX_HEIGHT: number;
    SPAWN_DELAY: number;
    MIN_SPAWN_DELAY: number;
    BASE_SPEED: number;
    MAX_SPEED: number;
    SPEED_INCREASE: number;
  };
  GAME: {
    POINTS_PER_OBSTACLE: number;
    DINOPOINTS_INTERVAL: number;
    DINOPOINTS_AMOUNT: number;
    SPEED_LEVEL_INTERVAL: number;
    INVULNERABILITY_TIME: number;
  };
  EFFECTS: {
    PARTICLE_COUNT: number;
    SCREEN_SHAKE: number;
    FLASH_DURATION: number;
    TRAIL_ENABLED: boolean;
  };
}
  export default class FlappyScene extends Phaser.Scene {
    private CONFIG: FlappyConfig;
    private isMobile: boolean = false;
    private gameWidth: number = 500;
    private gameHeight: number = 500;
    private score: number = 0;
    private gameOver: boolean = false;
    private gameStarted: boolean = false;
    private packagesGiven: number = 0;
    private currentSpeed: number;
    private currentSpawnDelay: number;
    private isInvulnerable: boolean = false;
    private combo: number = 0;
    private perfectPasses: number = 0;
    
    // Game objects
    private ptero!: Phaser.Physics.Arcade.Sprite;
    private pipes!: Phaser.Physics.Arcade.Group;
    private powerUps!: Phaser.Physics.Arcade.Group;
    private particles!: Phaser.GameObjects.Group;
    private trail?: Phaser.GameObjects.Group;
    private clouds: Phaser.GameObjects.Text[] = [];
    private sun!: Phaser.GameObjects.Text;
    private sunRays!: Phaser.GameObjects.Graphics;
    private comboText!: Phaser.GameObjects.Text;
    private perfectText!: Phaser.GameObjects.Text;
    
    // Timers
    private obstacleTimer!: Phaser.Time.TimerEvent;
    private powerUpTimer!: Phaser.Time.TimerEvent;
    private trailTimer: number = 0;
    
    // Input
    private spaceKey!: Phaser.Input.Keyboard.Key;
    private wKey!: Phaser.Input.Keyboard.Key;
    private upKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
  
    constructor() {
      super({ key: 'FlappyScene' });
  
      // Detectar tipo de dispositivo y tamaño de pantalla
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isPortrait = screenHeight > screenWidth;
      
      // Mejorar detección de móvil
      this.isMobile = screenWidth < 640 || 
                     (isPortrait && screenWidth < 800) ||
                     /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Calcular tamaño del juego basado en la pantalla disponible
      const maxGameSize = Math.min(screenWidth * 0.95, screenHeight * 0.7);
      const gameSize = this.isMobile ? 
                       Math.min(maxGameSize, 380) : 
                       Math.min(maxGameSize, 480);
      
      this.gameWidth = gameSize;
      this.gameHeight = gameSize;
      
      // Logging para debug (puedes quitarlo después)
      console.log(`Pantalla: ${screenWidth}x${screenHeight}, Juego: ${this.gameWidth}x${this.gameHeight}, Móvil: ${this.isMobile}`);
      
      this.CONFIG = {
        PTERO: {
          JUMP_STRENGTH: this.isMobile ? -200 : -200,
          GRAVITY: this.isMobile ? 550 : 600,
          MAX_VELOCITY: 400,
          ROTATION_FACTOR: 0.15,
          SIZE: this.isMobile ? 28 : 35,
          FLAP_ANIMATION_SPEED: 0.01,
        },
        
        OBSTACLES: {
          WIDTH: this.isMobile ? 50 : 60,
          GAP: this.isMobile ? Math.floor(this.gameHeight * 0.5) : 180,
          MIN_HEIGHT: this.isMobile ? Math.floor(this.gameHeight * 0.15) : 80,
          MAX_HEIGHT: this.isMobile ? Math.floor(this.gameHeight * 0.7) : 350,
          SPAWN_DELAY: this.isMobile ? 2200 : 1800,
          MIN_SPAWN_DELAY: this.isMobile ? 1600 : 1200,
          BASE_SPEED: this.isMobile ? 140 : 180,
          MAX_SPEED: this.isMobile ? 280 : 350,
          SPEED_INCREASE: this.isMobile ? 10 : 15,
        },
        
        GAME: {
          POINTS_PER_OBSTACLE: 1,
          DINOPOINTS_INTERVAL: 10,
          DINOPOINTS_AMOUNT: 20,
          SPEED_LEVEL_INTERVAL: this.isMobile ? 8 : 5,
          INVULNERABILITY_TIME: 1000,
        },
        
        EFFECTS: {
          PARTICLE_COUNT: this.isMobile ? 5 : 8,
          SCREEN_SHAKE: this.isMobile ? 3 : 5,
          FLASH_DURATION: 100,
          TRAIL_ENABLED: !this.isMobile,
        }
      };
      
      this.currentSpeed = this.CONFIG.OBSTACLES.BASE_SPEED;
      this.currentSpawnDelay = this.CONFIG.OBSTACLES.SPAWN_DELAY;
    }
  
    preload(): void {
      this.createPteroTexture();
      this.createObstacleTexture();
      this.createParticleTextures();
      this.createPowerUpTextures();
    }
  
    create(): void {
      this.createBackground();
      
      // Posición inicial del pterosaurio
      const pteroX = this.isMobile ? 80 : 100;
      const pteroY = this.gameHeight / 2;
      
      // CREAR EL PTEROSAURIO CON CONFIGURACIÓN VISIBLE
      this.ptero = this.physics.add.sprite(pteroX, pteroY, 'ptero');
      this.ptero.setCollideWorldBounds(true);
      
      // Corregir tipo de body
      const pteroBody = this.ptero.body as Phaser.Physics.Arcade.Body;
      if (pteroBody) {
        pteroBody.setGravityY(this.CONFIG.PTERO.GRAVITY);
        pteroBody.setMaxVelocity(400, this.CONFIG.PTERO.MAX_VELOCITY);
        pteroBody.setSize(25, 20);
      }
      
      // Establecer escala visible
      this.ptero.setScale(1);
      
      // Hacer visible explícitamente
      this.ptero.setVisible(true);
      this.ptero.setActive(true);
      this.ptero.setAlpha(1);
      
      // Profundidad para asegurar que esté al frente
      this.ptero.setDepth(100);
      
      this.pipes = this.physics.add.group();
      this.powerUps = this.physics.add.group();
      this.particles = this.add.group();
      
      if (this.CONFIG.EFFECTS.TRAIL_ENABLED) {
        this.trail = this.add.group();
        this.trailTimer = 0;
      }
      
      this.setupInput();
      
      this.physics.add.overlap(this.ptero, this.pipes, (ptero, pipe) => 
        this.handleCollision(ptero as Phaser.Physics.Arcade.Sprite, pipe as Phaser.Physics.Arcade.Sprite)
      );
      this.physics.add.overlap(this.ptero, this.powerUps, (ptero, powerUp) => 
        this.collectPowerUp(ptero as Phaser.Physics.Arcade.Sprite, powerUp as Phaser.Physics.Arcade.Sprite)
      );
      
      this.createGameUI();
      this.setupTimers();
    }
  
    private createPteroTexture(): void {
      const graphics = this.add.graphics();
      
      // Limpiar cualquier contenido previo
      graphics.clear();
      
      // Cuerpo principal - NARANJA SÓLIDO
      graphics.fillStyle(0xFF8C00);
      graphics.fillEllipse(20, 20, 32, 18);
      
      // Borde del cuerpo
      graphics.lineStyle(2, 0xFF4500);
      graphics.strokeEllipse(20, 20, 32, 18);
      
      // Ala - AMARILLO DORADO
      graphics.fillStyle(0xFFD700);
      graphics.fillEllipse(12, 17, 12, 8);
      
      // Ojo - NEGRO
      graphics.fillStyle(0x000000);
      graphics.fillCircle(26, 18, 3);
      
      // Brillo del ojo - BLANCO
      graphics.fillStyle(0xFFFFFF);
      graphics.fillCircle(27, 17, 1);
      
      // Pico - NARANJA OSCURO
      graphics.fillStyle(0xFF4500);
      graphics.fillTriangle(32, 19, 28, 17, 28, 21);
      
      // Generar textura con tamaño fijo
      graphics.generateTexture('ptero', 40, 40);
      graphics.destroy();
    }
  
    private createObstacleTexture(): void {
      const graphics = this.add.graphics();
      
      // Fondo sólido verde oscuro
      graphics.fillStyle(0x2F4F2F);
      graphics.fillRect(0, 0, this.CONFIG.OBSTACLES.WIDTH, 300);
      
      // Capa intermedia verde
      graphics.fillStyle(0x228B22);
      graphics.fillRect(4, 4, this.CONFIG.OBSTACLES.WIDTH - 8, 300 - 8);
      
      // Highlight superior para efecto 3D
      graphics.fillStyle(0x32CD32);
      graphics.fillRect(6, 6, this.CONFIG.OBSTACLES.WIDTH - 12, 30);
      
      // Sombra inferior para efecto 3D
      graphics.fillStyle(0x006400);
      graphics.fillRect(6, 270, this.CONFIG.OBSTACLES.WIDTH - 12, 24);
      
      // Líneas verticales para textura de madera/bambú
      for (let x = 10; x < this.CONFIG.OBSTACLES.WIDTH - 10; x += 8) {
        graphics.lineStyle(2, 0x90EE90, 0.8);
        graphics.lineBetween(x, 8, x, 292);
      }
      
      // Líneas horizontales para segmentos
      for (let y = 20; y < 280; y += 40) {
        graphics.lineStyle(3, 0x006400, 0.9);
        graphics.lineBetween(6, y, this.CONFIG.OBSTACLES.WIDTH - 6, y);
      }
      
      // Borde exterior muy grueso y negro
      graphics.lineStyle(6, 0x000000);
      graphics.strokeRect(0, 0, this.CONFIG.OBSTACLES.WIDTH, 300);
      
      // Borde interior para efecto biselado
      graphics.lineStyle(2, 0x90EE90);
      graphics.strokeRect(3, 3, this.CONFIG.OBSTACLES.WIDTH - 6, 300 - 6);
      
      graphics.generateTexture('pipe', this.CONFIG.OBSTACLES.WIDTH, 300);
      graphics.destroy();
    }
  
    private createParticleTextures(): void {
      const colors = [0xFFD700, 0xFF6347, 0xFFA500, 0xFF4500];
      colors.forEach((color, index) => {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillCircle(4, 4, 3);
        graphics.generateTexture(`particle${index}`, 8, 8);
        graphics.destroy();
      });
      
      const trailGraphics = this.add.graphics();
      trailGraphics.fillStyle(0xFFFFFF);
      trailGraphics.fillCircle(2, 2, 2);
      trailGraphics.generateTexture('trail', 4, 4);
      trailGraphics.destroy();
    }
  
    private createPowerUpTextures(): void {
      // Power-up de velocidad lenta
      const slowGraphics = this.add.graphics();
      slowGraphics.fillStyle(0x00BFFF);
      slowGraphics.fillCircle(10, 10, 10);
      slowGraphics.fillStyle(0xFFFFFF);
      slowGraphics.fillTriangle(10, 6, 6, 14, 14, 14);
      slowGraphics.generateTexture('powerup_slow', 20, 20);
      slowGraphics.destroy();
      
      // Power-up de puntos extra
      const pointsGraphics = this.add.graphics();
      pointsGraphics.fillStyle(0xFFD700);
      pointsGraphics.fillCircle(10, 10, 8);
      pointsGraphics.fillStyle(0x000000);
      pointsGraphics.fillRect(8, 6, 4, 8);
      pointsGraphics.fillRect(6, 8, 8, 4);
      pointsGraphics.generateTexture('powerup_points', 20, 20);
      pointsGraphics.destroy();
    }
  
    private setupInput(): void {
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.jump();
        this.createJumpEffect(pointer.x, pointer.y);
      });
      
      this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.upKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      
      this.spaceKey.on('down', () => this.jump());
      this.wKey.on('down', () => this.jump());
      this.upKey.on('down', () => this.jump());
      this.enterKey.on('down', () => this.jump());
    }
  
    private createBackground(): void {
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x228B22);
      graphics.fillRect(0, 0, this.gameWidth, this.gameHeight);
      
      // Nubes
      this.clouds = [];
      const cloudCount = this.isMobile ? 3 : 6;
      for (let i = 0; i < cloudCount; i++) {
        const cloud = this.add.text(
          Phaser.Math.Between(0, this.gameWidth), 
          Phaser.Math.Between(20, 100), 
          '☁️', 
          { 
            fontSize: `${this.isMobile ? Phaser.Math.Between(8, 14) : Phaser.Math.Between(12, 20)}px`,
            color: '#ffffff'
          }
        );
        cloud.setAlpha(Phaser.Math.FloatBetween(0.6, 0.9));
        (cloud as any).speed = Phaser.Math.FloatBetween(0.2, 0.8);
        this.clouds.push(cloud);
      }
      
      // Sol
      const sunSize = this.isMobile ? '20px' : '24px';
      const sunX = this.isMobile ? this.gameWidth - 50 : 420;
      this.sun = this.add.text(sunX, 30, '☀️', { fontSize: sunSize });
      this.sunRays = this.add.graphics();
      this.updateSunRays();
    }
  
    private createGameUI(): void {
      const fontSize = this.isMobile ? '12px' : '14px';
      const strokeThickness = this.isMobile ? 1 : 2;
      
      this.comboText = this.add.text(this.isMobile ? 8 : 16, this.isMobile ? 40 : 50, '', {
        fontSize: fontSize,
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: strokeThickness
      });
      
      this.perfectText = this.add.text(this.gameWidth / 2, this.isMobile ? 40 : 50, '', {
        fontSize: this.isMobile ? '10px' : '12px',
        color: '#00FF00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 1
      }).setOrigin(0.5);
    }
  
    private setupTimers(): void {
      this.obstacleTimer = this.time.addEvent({
        delay: this.currentSpawnDelay,
        callback: this.addPipes,
        callbackScope: this,
        loop: true,
        paused: true
      });
      
      this.powerUpTimer = this.time.addEvent({
        delay: 15000,
        callback: this.spawnPowerUp,
        callbackScope: this,
        loop: true,
        paused: true
      });
    }
  
    private jump(): void {
      if (this.gameOver) {
        this.resetGame();
        return;
      }
      
      if (!this.gameStarted) {
        this.startGame();
      }
      
      this.ptero.setVelocityY(this.CONFIG.PTERO.JUMP_STRENGTH);
      this.createJumpParticles();
      this.checkPerfectTiming();
    }
  
    private createJumpParticles(): void {
      for (let i = 0; i < 3; i++) {
        const particle = this.add.image(
          this.ptero.x - 10,
          this.ptero.y + Phaser.Math.Between(-5, 5),
          `particle${Phaser.Math.Between(0, 3)}`
        );
        particle.setScale(0.5);
        particle.setAlpha(0.8);
        
        this.tweens.add({
          targets: particle,
          x: particle.x - Phaser.Math.Between(20, 40),
          y: particle.y + Phaser.Math.Between(-10, 10),
          alpha: 0,
          scale: 0,
          duration: 500,
          onComplete: () => particle.destroy()
        });
      }
    }
  
    private createJumpEffect(x: number, y: number): void {
      const ripple = this.add.circle(x, y, 5, 0xFFFFFF, 0.5);
      this.tweens.add({
        targets: ripple,
        radius: 30,
        alpha: 0,
        duration: 300,
        onComplete: () => ripple.destroy()
      });
    }
  
    private checkPerfectTiming(): void {
      let nearObstacle = false;
      
      this.pipes.children.entries.forEach(pipe => {
        const pipeSprite = pipe as Phaser.Physics.Arcade.Sprite & { 
          pipeType?: string; 
          body: Phaser.Physics.Arcade.Body 
        };
        const distance = Math.abs(pipeSprite.x - this.ptero.x);
        
        if (distance < 30 && pipeSprite.pipeType === 'top') {
          const gapY = pipeSprite.body.height + (this.CONFIG.OBSTACLES.GAP / 2);
          const pteroDistanceFromCenter = Math.abs(this.ptero.y - gapY);
          
          if (pteroDistanceFromCenter < 50) {
            nearObstacle = true;
          }
        }
      });
      
      if (nearObstacle) {
        this.combo++;
        this.perfectPasses++;
        this.showPerfectText();
      }
    }
  
    private showPerfectText(): void {
      this.perfectText.setText('PERFECT!');
      this.perfectText.setAlpha(1);
      this.tweens.add({
        targets: this.perfectText,
        alpha: 0,
        duration: 1000
      });
    }
  
    private startGame(): void {
      this.gameStarted = true;
      this.obstacleTimer.paused = false;
      this.powerUpTimer.paused = false;
      
      window.dispatchEvent(new CustomEvent('flappyGameStarted'));
    }
  
    private addPipes(): void {
      if (!this.gameStarted || this.gameOver) return;
      
      const gap = this.CONFIG.OBSTACLES.GAP;
      const topHeight = Phaser.Math.Between(
        this.CONFIG.OBSTACLES.MIN_HEIGHT, 
        this.CONFIG.OBSTACLES.MAX_HEIGHT
      );
      
      const spawnX = this.gameWidth + 20;
      
      const topPipe = this.pipes.create(spawnX, 0, 'pipe') as Phaser.Physics.Arcade.Sprite & { 
        scored?: boolean; 
        pipeType?: string; 
        pairId?: number 
      };
      topPipe.setOrigin(0, 0);
      topPipe.setScale(1, topHeight / 300);
      topPipe.setVelocityX(-this.currentSpeed);
      
      const topBody = topPipe.body as Phaser.Physics.Arcade.Body;
      if (topBody) {
        topBody.setSize(this.CONFIG.OBSTACLES.WIDTH, topHeight);
      }
      
      topPipe.scored = false;
      topPipe.pipeType = 'top';
      topPipe.pairId = Date.now();
      
      const bottomY = topHeight + gap;
      const bottomHeight = this.gameHeight - bottomY;
      const bottomPipe = this.pipes.create(spawnX, bottomY, 'pipe') as Phaser.Physics.Arcade.Sprite & { 
        scored?: boolean; 
        pipeType?: string; 
        pairId?: number 
      };
      bottomPipe.setOrigin(0, 0);
      bottomPipe.setScale(1, bottomHeight / 300);
      bottomPipe.setVelocityX(-this.currentSpeed);
      
      const bottomBody = bottomPipe.body as Phaser.Physics.Arcade.Body;
      if (bottomBody) {
        bottomBody.setSize(this.CONFIG.OBSTACLES.WIDTH, bottomHeight);
      }
      
      bottomPipe.scored = false;
      bottomPipe.pipeType = 'bottom';
      bottomPipe.pairId = topPipe.pairId;
      
      this.updateDifficulty();
    }
  
    private spawnPowerUp(): void {
      if (!this.gameStarted || this.gameOver) return;
      
      const types = ['powerup_slow', 'powerup_points'];
      const type = Phaser.Utils.Array.GetRandom(types);
      const y = Phaser.Math.Between(100, this.gameHeight - 100);
      
      const powerUp = this.powerUps.create(this.gameWidth + 20, y, type) as Phaser.Physics.Arcade.Sprite & {
        powerType?: string;
      };
      powerUp.setVelocityX(-this.currentSpeed * 0.7);
      powerUp.powerType = type;
      
      this.tweens.add({
        targets: powerUp,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      this.time.delayedCall(8000, () => {
        if (powerUp.active) powerUp.destroy();
      });
    }
  
    private collectPowerUp(_ptero: Phaser.Physics.Arcade.Sprite, powerUp: Phaser.Physics.Arcade.Sprite): void {
      this.createCollectEffect(powerUp.x, powerUp.y);
      
      const typedPowerUp = powerUp as Phaser.Physics.Arcade.Sprite & { powerType?: string };
      
      switch (typedPowerUp.powerType) {
        case 'powerup_slow':
          this.activateSlowMotion();
          break;
        case 'powerup_points':
          { this.score += 3;
          
          const currentPackage = Math.floor(this.score / this.CONFIG.GAME.DINOPOINTS_INTERVAL);
          if (currentPackage > this.packagesGiven) {
            this.packagesGiven = currentPackage;
            
            window.dispatchEvent(new CustomEvent('flappyPointsEarned', {
              detail: { 
                points: this.CONFIG.GAME.DINOPOINTS_AMOUNT,
                score: this.score 
              }
            }));
          }
          
          window.dispatchEvent(new CustomEvent('flappyScoreUpdate', {
            detail: { score: this.score }
          }));
          break; }
      }
      
      powerUp.destroy();
    }
  
    private createCollectEffect(x: number, y: number): void {
      for (let i = 0; i < this.CONFIG.EFFECTS.PARTICLE_COUNT; i++) {
        const particle = this.add.image(x, y, `particle${Phaser.Math.Between(0, 3)}`);
        const angle = (i / this.CONFIG.EFFECTS.PARTICLE_COUNT) * Math.PI * 2;
        const distance = Phaser.Math.Between(20, 50);
        
        this.tweens.add({
          targets: particle,
          x: x + Math.cos(angle) * distance,
          y: y + Math.sin(angle) * distance,
          alpha: 0,
          scale: 0,
          duration: 800,
          onComplete: () => particle.destroy()
        });
      }
    }
  
    private activateSlowMotion(): void {
      (this.physics.world as any).timeScale = 0.5;
      this.time.delayedCall(3000, () => {
        (this.physics.world as any).timeScale = 1;
      });
    }
  
    private updateDifficulty(): void {
      const level = Math.floor(this.score / this.CONFIG.GAME.SPEED_LEVEL_INTERVAL);
      
      const newSpeed = Math.min(
        this.CONFIG.OBSTACLES.BASE_SPEED + (level * this.CONFIG.OBSTACLES.SPEED_INCREASE),
        this.CONFIG.OBSTACLES.MAX_SPEED
      );
      
      if (newSpeed !== this.currentSpeed) {
        this.currentSpeed = newSpeed;
        
        this.currentSpawnDelay = Math.max(
          this.CONFIG.OBSTACLES.SPAWN_DELAY - (level * 100),
          this.CONFIG.OBSTACLES.MIN_SPAWN_DELAY
        );
        
        // Recrear timer en lugar de modificar delay
        this.obstacleTimer.destroy();
        this.obstacleTimer = this.time.addEvent({
          delay: this.currentSpawnDelay,
          callback: this.addPipes,
          callbackScope: this,
          loop: true,
          paused: false
        });
        
        window.dispatchEvent(new CustomEvent('flappySpeedUpdate', {
          detail: { speed: this.currentSpeed / 50 }
        }));
      }
    }
  
    private checkScoring(): void {
      const processedPairs = new Set<number>();
      
      this.pipes.children.entries.forEach(_pipe => {
        const pipeSprite = _pipe as Phaser.Physics.Arcade.Sprite & { 
          scored?: boolean; 
          pipeType?: string; 
          pairId?: number 
        };
        
        if (pipeSprite.pipeType === 'top' && 
            !pipeSprite.scored && 
            pipeSprite.pairId &&
            !processedPairs.has(pipeSprite.pairId) &&
            pipeSprite.x + this.CONFIG.OBSTACLES.WIDTH < this.ptero.x) {
          
          processedPairs.add(pipeSprite.pairId);
          
          this.pipes.children.entries.forEach(otherPipe => {
            const otherSprite = otherPipe as Phaser.Physics.Arcade.Sprite & { 
              scored?: boolean; 
              pairId?: number 
            };
            if (otherSprite.pairId === pipeSprite.pairId) {
              otherSprite.scored = true;
            }
          });
          
          this.score += this.CONFIG.GAME.POINTS_PER_OBSTACLE;
          
          window.dispatchEvent(new CustomEvent('flappyScoreUpdate', {
            detail: { score: this.score }
          }));
          
          const currentPackage = Math.floor(this.score / this.CONFIG.GAME.DINOPOINTS_INTERVAL);
          if (currentPackage > this.packagesGiven) {
            this.packagesGiven = currentPackage;
            
            window.dispatchEvent(new CustomEvent('flappyPointsEarned', {
              detail: { 
                points: this.CONFIG.GAME.DINOPOINTS_AMOUNT, 
                score: this.score 
              }
            }));
          }
        }
      });
    }
  
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handleCollision(_ptero: Phaser.Physics.Arcade.Sprite, _pipe: Phaser.Physics.Arcade.Sprite): void {
      if (this.isInvulnerable || this.gameOver) return;
      
      this.combo = 0;
      
      this.createExplosion(_ptero.x, _ptero.y);
      this.cameras.main.shake(this.CONFIG.EFFECTS.SCREEN_SHAKE, 200);
      this.cameras.main.flash(this.CONFIG.EFFECTS.FLASH_DURATION, 255, 0, 0);
      
      this.gameOverFn();
    }
  
    private createExplosion(x: number, y: number): void {
      for (let i = 0; i < this.CONFIG.EFFECTS.PARTICLE_COUNT * 2; i++) {
        const particle = this.add.image(x, y, `particle${Phaser.Math.Between(0, 3)}`);
        const velocity = Phaser.Math.Between(50, 150);
        const angle = Math.random() * Math.PI * 2;
        
        this.tweens.add({
          targets: particle,
          x: particle.x + Math.cos(angle) * velocity,
          y: particle.y + Math.sin(angle) * velocity,
          alpha: 0,
          scale: 0,
          duration: 1000,
          onComplete: () => particle.destroy()
        });
      }
    }
  
    private gameOverFn(): void {
      if (this.gameOver) return;
      
      this.gameOver = true;
      this.physics.pause();
      this.obstacleTimer.paused = true;
      this.powerUpTimer.paused = true;
      
      const finalStats = {
        score: this.score,
        maxSpeed: this.currentSpeed / 50,
        pointsEarned: Math.floor(this.score / this.CONFIG.GAME.DINOPOINTS_INTERVAL) * this.CONFIG.GAME.DINOPOINTS_AMOUNT,
        perfectPasses: this.perfectPasses,
        maxCombo: this.combo
      };
      
      window.dispatchEvent(new CustomEvent('flappyGameOver', {
        detail: finalStats
      }));
    }
  
    public resetGame(): void {
      this.score = 0;
      this.gameOver = false;
      this.gameStarted = false;
      this.packagesGiven = 0;
      this.currentSpeed = this.CONFIG.OBSTACLES.BASE_SPEED;
      this.currentSpawnDelay = this.CONFIG.OBSTACLES.SPAWN_DELAY;
      this.isInvulnerable = false;
      this.combo = 0;
      this.perfectPasses = 0;
      
      const pteroX = this.isMobile ? 80 : 100;
      const pteroY = this.gameHeight / 2;
      
      this.ptero.setPosition(pteroX, pteroY);
      this.ptero.setVelocity(0, 0);
      this.ptero.setRotation(0);
      this.ptero.setScale(1);
      this.ptero.setVisible(true);
      this.ptero.setAlpha(1);
      
      this.pipes.clear(true, true);
      this.powerUps.clear(true, true);
      
      this.obstacleTimer.paused = true;
      this.powerUpTimer.paused = true;
      
      // Recrear timer
      this.obstacleTimer.destroy();
      this.obstacleTimer = this.time.addEvent({
        delay: this.CONFIG.OBSTACLES.SPAWN_DELAY,
        callback: this.addPipes,
        callbackScope: this,
        loop: true,
        paused: true
      });
      
      this.comboText.setText('');
      this.perfectText.setText('');
      
      this.physics.resume();
      (this.physics.world as any).timeScale = 1;
      
      window.dispatchEvent(new CustomEvent('flappyGameReset'));
    }
  
    update(): void {
      if (!this.gameStarted || this.gameOver) return;
      
      // Corregir tipo de body
      const pteroBody = this.ptero.body as Phaser.Physics.Arcade.Body;
      if (pteroBody) {
        const angle = Phaser.Math.Clamp(
          pteroBody.velocity.y * this.CONFIG.PTERO.ROTATION_FACTOR, 
          -30, 
          30
        );
        this.ptero.setRotation(angle * Math.PI / 180);
      }
      
      // Animación de aleteo
      const flapScale = 1 + Math.sin(this.time.now * this.CONFIG.PTERO.FLAP_ANIMATION_SPEED) * 0.1;
      this.ptero.setScale(flapScale);
      
      if (this.CONFIG.EFFECTS.TRAIL_ENABLED) {
        this.updateTrail();
      }
      
      this.updateClouds();
      this.updateSunRays();
      this.checkScoring();
      this.updateComboUI();
      
      if (this.ptero.y <= 0 || this.ptero.y >= this.gameHeight - 30) {
        this.handleCollision(this.ptero, this.ptero);
      }
    }
  
    private updateSunRays(): void {
      this.sunRays.clear();
      this.sunRays.lineStyle(2, 0xFFD700, 0.3);
      const time = this.time.now * 0.001;
      const rayCount = this.isMobile ? 6 : 8;
      const sunX = this.isMobile ? this.gameWidth - 38 : 432;
      const sunY = 42;
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i * Math.PI * 2 / rayCount) + time;
        const x1 = sunX + Math.cos(angle) * 15;
        const y1 = sunY + Math.sin(angle) * 15;
        const x2 = sunX + Math.cos(angle) * (this.isMobile ? 25 : 35);
        const y2 = sunY + Math.sin(angle) * (this.isMobile ? 25 : 35);
        this.sunRays.lineBetween(x1, y1, x2, y2);
      }
    }
  
    private updateClouds(): void {
      this.clouds.forEach(cloud => {
        const typedCloud = cloud as Phaser.GameObjects.Text & { speed?: number };
        cloud.x -= typedCloud.speed || 1;
        if (cloud.x < -50) {
          cloud.x = this.gameWidth + 50;
          cloud.y = Phaser.Math.Between(20, 100);
        }
      });
    }
  
    private updateTrail(): void {
      this.trailTimer++;
      if (this.trailTimer % 3 === 0) {
        const trail = this.add.image(this.ptero.x - 15, this.ptero.y, 'trail');
        trail.setAlpha(0.6);
        trail.setScale(0.5);
        
        this.tweens.add({
          targets: trail,
          alpha: 0,
          scale: 0,
          duration: 500,
          onComplete: () => trail.destroy()
        });
      }
    }
  
    private updateComboUI(): void {
      if (this.combo > 0) {
        this.comboText.setText(`PERFECT x${this.combo}`);
        this.comboText.setScale(1 + Math.sin(this.time.now * 0.01) * 0.1);
      } else {
        this.comboText.setText('');
      }
    }

  private updateEffects(): void {
    // Reset del combo después de un tiempo sin perfect timing
    if (this.combo > 0) {
      // Si no hay obstáculos cerca, resetear combo gradualmente
      let hasNearbyObstacle = false;
      this.pipes.children.entries.forEach(pipe => {
        const distance = Math.abs((pipe as any).x - this.ptero.x);
        if (distance < 100) {
          hasNearbyObstacle = true;
        }
      });
      
      if (!hasNearbyObstacle) {
        this.time.delayedCall(1000, () => {
          this.combo = Math.max(0, this.combo - 1);
        });
      }
    }
  }
}
