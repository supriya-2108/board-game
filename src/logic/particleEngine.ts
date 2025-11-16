/**
 * Particle System for visual effects
 * Implements particle physics and rendering for game events
 */

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;  // Velocity X
  vy: number;  // Velocity Y
  life: number;  // 0-1, decreases over time
  maxLife: number;  // Duration in ms
  size: number;
  color: string;
  glow: boolean;
}

export type EmissionPattern = 'burst' | 'continuous' | 'directional' | 'pulse';

export interface ParticleEmitterConfig {
  position: { x: number; y: number };
  particleCount: number;
  particleConfig: Partial<Particle>;
  emissionPattern: EmissionPattern;
  duration: number;
  velocityRange?: { min: number; max: number };
  angleRange?: { min: number; max: number };
  sizeRange?: { min: number; max: number };
  lifeRange?: { min: number; max: number };
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private emitters: Array<{ config: ParticleEmitterConfig; elapsed: number; active: boolean }> = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastUpdate: number = 0;
  private animationFrameId: number | null = null;
  private maxParticles: number = 200;
  private isMobile: boolean = false;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.setCanvas(canvas);
    }
    // Detect mobile device
    this.isMobile = this.detectMobile();
    // Reduce max particles on mobile
    if (this.isMobile) {
      this.maxParticles = 100;
    }
  }

  private detectMobile(): boolean {
    return window.innerWidth <= 767 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  emit(config: ParticleEmitterConfig): void {
    if (config.emissionPattern === 'continuous' || config.emissionPattern === 'pulse') {
      // Add as continuous emitter
      this.emitters.push({ config, elapsed: 0, active: true });
    } else {
      // Immediate burst emission
      this.createParticles(config);
    }
  }

  private createParticles(config: ParticleEmitterConfig): void {
    // Reduce particle count by 50% on mobile
    const adjustedCount = this.isMobile 
      ? Math.ceil(config.particleCount * 0.5)
      : config.particleCount;
    
    const count = Math.min(adjustedCount, this.maxParticles - this.particles.length);
    
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle(config);
      this.particles.push(particle);
    }
  }

  private createParticle(config: ParticleEmitterConfig): Particle {
    const { position, particleConfig, emissionPattern, velocityRange, angleRange, sizeRange, lifeRange } = config;
    
    // Generate random values within ranges
    const velocity = velocityRange 
      ? velocityRange.min + Math.random() * (velocityRange.max - velocityRange.min)
      : 150;
    
    const angle = angleRange
      ? angleRange.min + Math.random() * (angleRange.max - angleRange.min)
      : Math.random() * Math.PI * 2;
    
    const size = sizeRange
      ? sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min)
      : particleConfig.size || 3;
    
    let maxLife = lifeRange
      ? lifeRange.min + Math.random() * (lifeRange.max - lifeRange.min)
      : particleConfig.maxLife || 1000;
    
    // Reduce particle life by 30% on mobile
    if (this.isMobile) {
      maxLife *= 0.7;
    }

    // Calculate velocity components based on pattern
    let vx = 0;
    let vy = 0;

    switch (emissionPattern) {
      case 'burst':
        // Radial outward
        vx = Math.cos(angle) * velocity;
        vy = Math.sin(angle) * velocity;
        break;
      case 'directional':
        // Upward bias
        vx = Math.cos(angle) * velocity * 0.3;
        vy = -Math.abs(Math.sin(angle) * velocity);
        break;
      case 'pulse':
        // Minimal movement
        vx = Math.cos(angle) * velocity * 0.2;
        vy = Math.sin(angle) * velocity * 0.2;
        break;
      default:
        vx = Math.cos(angle) * velocity;
        vy = Math.sin(angle) * velocity;
    }

    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      x: position.x + (Math.random() - 0.5) * 10,
      y: position.y + (Math.random() - 0.5) * 10,
      vx,
      vy,
      life: 1,
      maxLife,
      size,
      color: particleConfig.color || '#00f0ff',
      glow: particleConfig.glow !== false,
    };
  }

  update(deltaTime: number): void {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += particle.vx * (deltaTime / 1000);
      particle.y += particle.vy * (deltaTime / 1000);
      
      // Apply gravity (slight downward acceleration)
      particle.vy += 50 * (deltaTime / 1000);
      
      // Decay life
      particle.life -= deltaTime / particle.maxLife;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update emitters
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const emitter = this.emitters[i];
      emitter.elapsed += deltaTime;
      
      // Emit particles for continuous emitters
      if (emitter.active && emitter.config.emissionPattern === 'continuous') {
        const particlesPerFrame = Math.ceil(emitter.config.particleCount * (deltaTime / emitter.config.duration));
        const tempConfig = { ...emitter.config, particleCount: particlesPerFrame };
        this.createParticles(tempConfig);
      } else if (emitter.active && emitter.config.emissionPattern === 'pulse') {
        // Pulse emission - emit in intervals
        const pulseInterval = 100; // ms
        if (Math.floor(emitter.elapsed / pulseInterval) > Math.floor((emitter.elapsed - deltaTime) / pulseInterval)) {
          const tempConfig = { ...emitter.config, particleCount: Math.ceil(emitter.config.particleCount / 10) };
          this.createParticles(tempConfig);
        }
      }
      
      // Remove expired emitters
      if (emitter.elapsed >= emitter.config.duration) {
        this.emitters.splice(i, 1);
      }
    }
  }

  render(ctx?: CanvasRenderingContext2D): void {
    const renderCtx = ctx || this.ctx;
    if (!renderCtx) return;

    for (const particle of this.particles) {
      this.renderParticle(renderCtx, particle);
    }
  }

  private renderParticle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    ctx.save();
    
    // Apply glow effect
    if (particle.glow) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = particle.color;
    }
    
    // Set opacity based on life
    ctx.globalAlpha = Math.max(0, Math.min(1, particle.life));
    
    // Draw particle
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  clear(): void {
    this.particles = [];
    this.emitters = [];
  }

  start(): void {
    if (this.animationFrameId !== null) return;
    
    this.lastUpdate = performance.now();
    this.animate();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    const now = performance.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    this.update(deltaTime);
    
    if (this.ctx && this.canvas) {
      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.render();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  getParticleCount(): number {
    return this.particles.length;
  }

  isActive(): boolean {
    return this.particles.length > 0 || this.emitters.length > 0;
  }
}
