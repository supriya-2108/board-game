import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ParticleSystem } from '../../logic/particleEngine';
import { ParticleEffects } from '../../logic/particleEffects';
import { Player, Position } from '../../types';

export interface ParticleCanvasHandle {
  emitCaptureEffect: (position: { x: number; y: number }, player: Player) => void;
  emitPromotionEffect: (position: { x: number; y: number }, player: Player) => void;
  emitVictoryEffect: (winner: Player) => void;
  emitValidMoveIndicators: (positions: Array<{ x: number; y: number }>, player: Player) => void;
  clearParticles: () => void;
}

interface ParticleCanvasProps {
  className?: string;
}

const ParticleCanvas = forwardRef<ParticleCanvasHandle, ParticleCanvasProps>(
  ({ className }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particleSystemRef = useRef<ParticleSystem | null>(null);
    const particleEffectsRef = useRef<ParticleEffects | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    useEffect(() => {
      // Check for reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Don't initialize particle system if reduced motion is preferred
      if (prefersReducedMotion) {
        return;
      }

      // Set canvas size to match container
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Initialize particle system
      const particleSystem = new ParticleSystem(canvas);
      const particleEffects = new ParticleEffects(particleSystem);
      
      particleSystemRef.current = particleSystem;
      particleEffectsRef.current = particleEffects;

      // Start animation loop
      particleSystem.start();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        particleSystem.stop();
      };
    }, [prefersReducedMotion]);

    useImperativeHandle(ref, () => ({
      emitCaptureEffect: (position: { x: number; y: number }, player: Player) => {
        // Don't emit particles if reduced motion is preferred
        if (prefersReducedMotion) return;
        particleEffectsRef.current?.createCaptureEffect(position, player);
      },
      emitPromotionEffect: (position: { x: number; y: number }, player: Player) => {
        // Don't emit particles if reduced motion is preferred
        if (prefersReducedMotion) return;
        particleEffectsRef.current?.createPromotionEffect(position, player);
      },
      emitVictoryEffect: (winner: Player) => {
        // Don't emit particles if reduced motion is preferred
        if (prefersReducedMotion) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const boardBounds = {
          x: 0,
          y: 0,
          width: canvas.width,
          height: canvas.height,
        };
        
        particleEffectsRef.current?.createVictoryEffect(boardBounds, winner);
      },
      emitValidMoveIndicators: (positions: Array<{ x: number; y: number }>, player: Player) => {
        // Don't emit particles if reduced motion is preferred
        if (prefersReducedMotion) return;
        particleEffectsRef.current?.createValidMoveIndicators(positions, player);
      },
      clearParticles: () => {
        particleEffectsRef.current?.clear();
      },
    }), [prefersReducedMotion]);

    return (
      <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {!prefersReducedMotion && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>
    );
  }
);

ParticleCanvas.displayName = 'ParticleCanvas';

export default ParticleCanvas;
