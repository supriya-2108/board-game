/**
 * Predefined particle effects for game events
 */

import { ParticleEmitterConfig, ParticleSystem } from './particleEngine';
import { Player, Position } from '../types';

export class ParticleEffects {
  private particleSystem: ParticleSystem;

  constructor(particleSystem: ParticleSystem) {
    this.particleSystem = particleSystem;
  }

  /**
   * Create capture particle effect
   * Burst emission from capture location with player color
   */
  createCaptureEffect(position: { x: number; y: number }, player: Player): void {
    const color = player === Player.PLAYER_1 ? '#00f0ff' : '#ff00ff'; // cyan or magenta
    
    const config: ParticleEmitterConfig = {
      position,
      particleCount: 25, // 20-30 particles
      emissionPattern: 'burst',
      duration: 0, // Immediate burst
      velocityRange: { min: 100, max: 200 },
      angleRange: { min: 0, max: Math.PI * 2 },
      sizeRange: { min: 2, max: 4 },
      lifeRange: { min: 500, max: 800 },
      particleConfig: {
        color,
        glow: true,
      },
    };

    this.particleSystem.emit(config);
  }

  /**
   * Create promotion particle effect
   * Burst + upward stream with player color and white sparkles
   */
  createPromotionEffect(position: { x: number; y: number }, player: Player): void {
    const playerColor = player === Player.PLAYER_1 ? '#00f0ff' : '#ff00ff';
    
    // Main burst with player color
    const burstConfig: ParticleEmitterConfig = {
      position,
      particleCount: 30,
      emissionPattern: 'burst',
      duration: 0,
      velocityRange: { min: 150, max: 250 },
      angleRange: { min: 0, max: Math.PI * 2 },
      sizeRange: { min: 3, max: 6 },
      lifeRange: { min: 800, max: 1200 },
      particleConfig: {
        color: playerColor,
        glow: true,
      },
    };

    // Upward stream with white sparkles
    const streamConfig: ParticleEmitterConfig = {
      position,
      particleCount: 20,
      emissionPattern: 'directional',
      duration: 0,
      velocityRange: { min: 150, max: 250 },
      angleRange: { min: -Math.PI * 0.75, max: -Math.PI * 0.25 }, // Upward bias
      sizeRange: { min: 3, max: 5 },
      lifeRange: { min: 900, max: 1200 },
      particleConfig: {
        color: '#ffffff',
        glow: true,
      },
    };

    this.particleSystem.emit(burstConfig);
    this.particleSystem.emit(streamConfig);
  }

  /**
   * Create victory particle effect
   * Continuous emission across board with winner's color and rainbow accents
   */
  createVictoryEffect(boardBounds: { x: number; y: number; width: number; height: number }, winner: Player): void {
    const winnerColor = winner === Player.PLAYER_1 ? '#00f0ff' : '#ff00ff';
    const rainbowColors = ['#ff0055', '#ffaa00', '#00ff88', '#0080ff', '#b000ff'];
    
    // Main winner color particles
    const mainConfig: ParticleEmitterConfig = {
      position: { x: boardBounds.x + boardBounds.width / 2, y: boardBounds.y + boardBounds.height / 2 },
      particleCount: 80,
      emissionPattern: 'continuous',
      duration: 3000,
      velocityRange: { min: 50, max: 200 },
      angleRange: { min: 0, max: Math.PI * 2 },
      sizeRange: { min: 4, max: 8 },
      lifeRange: { min: 1000, max: 2000 },
      particleConfig: {
        color: winnerColor,
        glow: true,
      },
    };

    // Rainbow accent particles
    for (let i = 0; i < 5; i++) {
      const accentConfig: ParticleEmitterConfig = {
        position: { 
          x: boardBounds.x + Math.random() * boardBounds.width, 
          y: boardBounds.y + Math.random() * boardBounds.height 
        },
        particleCount: 20,
        emissionPattern: 'continuous',
        duration: 3000,
        velocityRange: { min: 30, max: 150 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 3, max: 6 },
        lifeRange: { min: 1200, max: 2000 },
        particleConfig: {
          color: rainbowColors[i],
          glow: true,
        },
      };
      
      this.particleSystem.emit(accentConfig);
    }

    this.particleSystem.emit(mainConfig);
  }

  /**
   * Create valid move indicator particles
   * Subtle pulse at valid destination squares
   */
  createValidMoveIndicators(positions: Array<{ x: number; y: number }>, player: Player): void {
    const color = player === Player.PLAYER_1 
      ? 'rgba(0, 240, 255, 0.4)' 
      : 'rgba(255, 0, 255, 0.4)';
    
    for (const position of positions) {
      const config: ParticleEmitterConfig = {
        position,
        particleCount: 7, // 5-10 particles per destination
        emissionPattern: 'pulse',
        duration: 2000, // Continuous while piece selected
        velocityRange: { min: 10, max: 30 },
        angleRange: { min: 0, max: Math.PI * 2 },
        sizeRange: { min: 1, max: 2 },
        lifeRange: { min: 800, max: 1200 },
        particleConfig: {
          color,
          glow: true,
        },
      };

      this.particleSystem.emit(config);
    }
  }

  /**
   * Clear all particle effects
   */
  clear(): void {
    this.particleSystem.clear();
  }
}
