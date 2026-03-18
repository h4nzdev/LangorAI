'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface WaveVisualizerProps {
  isActive: boolean;
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: 'sm' | 'md' | 'lg';
}

interface Particle3D {
  x: number;
  y: number;
  z: number; // Depth: 0 (back) to 1 (front)
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  phase: number;
  speed: number;
  ringIndex: number;
  angle: number;
}

interface BinaryChar {
  x: number;
  y: number;
  char: string;
  speed: number;
  opacity: number;
  size: number;
}

export default function WaveVisualizer({ 
  isActive, 
  state = 'idle',
  size = 'md' 
}: WaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle3D[]>([]);
  const binaryCharsRef = useRef<BinaryChar[]>([]);
  const timeRef = useRef(0);
  const fpsRef = useRef({ frames: 0, lastTime: performance.now(), fps: 60 });

  // Configuration based on size
  const baseConfig = {
    sm: { width: 160, height: 160, rings: 4, particlesPerRing: 10, particleSize: 2, waveAmplitude: 12, waveSpeed: 0.02 },
    md: { width: 240, height: 240, rings: 5, particlesPerRing: 14, particleSize: 2.5, waveAmplitude: 16, waveSpeed: 0.015 },
    lg: { width: 320, height: 320, rings: 6, particlesPerRing: 18, particleSize: 3, waveAmplitude: 20, waveSpeed: 0.01 },
  };

  // State-based intensity multipliers
  const intensityMultipliers = {
    idle: { speed: 0.2, opacity: 0.3, connections: 0.2, waveAmplitude: 0.5 },
    listening: { speed: 0.8, opacity: 1.0, connections: 1.0, waveAmplitude: 1.0 },
    thinking: { speed: 0.6, opacity: 0.7, connections: 0.6, waveAmplitude: 0.7 },
    speaking: { speed: 0.7, opacity: 0.85, connections: 0.8, waveAmplitude: 0.9 },
  };

  const currentConfig = baseConfig[size];
  const intensity = intensityMultipliers[state];
  const isActiveState = isActive && state !== 'idle';

  // Color palette - cyan/teal matrix aesthetic
  const colorPalette = {
    primary: { r: 0, g: 255, b: 200 },    // #00FFC8 - cyan/teal
    secondary: { r: 0, g: 200, b: 255 },  // #00C8FF - light cyan
    accent: { r: 0, g: 255, b: 150 },     // #00FF96 - green-cyan
    dark: { r: 0, g: 100, b: 100 },       // Dark teal for depth
  };

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle3D[] = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const minRadius = 45;
    const maxRadius = Math.min(width, height) / 2 - 12;
    const ringSpacing = (maxRadius - minRadius) / (currentConfig.rings - 1);

    for (let ring = 0; ring < currentConfig.rings; ring++) {
      const baseRadius = minRadius + ring * ringSpacing;
      
      for (let i = 0; i < currentConfig.particlesPerRing; i++) {
        const angle = (i / currentConfig.particlesPerRing) * Math.PI * 2;
        const baseX = centerX + Math.cos(angle) * baseRadius;
        const baseY = centerY + Math.sin(angle) * baseRadius;
        const baseZ = Math.random(); // Depth for 3D effect

        particles.push({
          x: baseX,
          y: baseY,
          z: baseZ,
          baseX,
          baseY,
          baseZ,
          size: currentConfig.particleSize * (0.8 + Math.random() * 0.4),
          phase: Math.random() * Math.PI * 2,
          speed: currentConfig.waveSpeed * (0.7 + Math.random() * 0.3),
          ringIndex: ring,
          angle,
        });
      }
    }

    particlesRef.current = particles;
  }, [currentConfig]);

  const initBinaryChars = useCallback((width: number, height: number) => {
    const chars: BinaryChar[] = [];
    const charCount = Math.floor((width * height) / 800); // Density-based count
    
    for (let i = 0; i < charCount; i++) {
      chars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        char: Math.random() > 0.5 ? '1' : '0',
        speed: 0.2 + Math.random() * 0.3,
        opacity: 0.02 + Math.random() * 0.04,
        size: 8 + Math.random() * 6,
      });
    }
    
    binaryCharsRef.current = chars;
  }, []);

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const time = timeRef.current;
    const intensityMult = isActiveState ? intensity.waveAmplitude : 0.3;

    // Draw concentric grid rings with wave distortion
    const rings = currentConfig.rings + 2;
    const minRadius = 40;
    const maxRadius = Math.min(width, height) / 2 - 8;
    const ringSpacing = (maxRadius - minRadius) / rings;

    for (let ring = 0; ring < rings; ring++) {
      const baseRadius = minRadius + ring * ringSpacing;
      
      // Wave distortion
      const wave1 = Math.sin(time * currentConfig.waveSpeed * 3 + ring * 0.8) * currentConfig.waveAmplitude * intensityMult;
      const wave2 = Math.cos(time * currentConfig.waveSpeed * 2 + ring * 0.5) * currentConfig.waveAmplitude * intensityMult * 0.5;
      const radius = baseRadius + wave1 + wave2;

      // Opacity varies with wave position and depth
      const baseOpacity = 0.03 + (ring / rings) * 0.02;
      const opacity = baseOpacity * (isActiveState ? 1.5 : 0.5);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colorPalette.primary.r}, ${colorPalette.primary.g}, ${colorPalette.primary.b}, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw radial grid lines
    const radialLines = 12;
    for (let i = 0; i < radialLines; i++) {
      const angle = (i / radialLines) * Math.PI * 2;
      const waveOffset = Math.sin(time * currentConfig.waveSpeed * 2 + i) * 10 * intensityMult;
      
      ctx.beginPath();
      const startRadius = 35;
      const endRadius = maxRadius;
      
      const startX = centerX + Math.cos(angle + waveOffset * 0.01) * startRadius;
      const startY = centerY + Math.sin(angle + waveOffset * 0.01) * startRadius;
      const endX = centerX + Math.cos(angle + waveOffset * 0.01) * endRadius;
      const endY = centerY + Math.sin(angle + waveOffset * 0.01) * endRadius;

      ctx.moveTo(startX, startY);
      
      // Curved line with wave distortion
      for (let t = 0; t <= 1; t += 0.1) {
        const r = startRadius + t * (endRadius - startRadius);
        const wave = Math.sin(angle * 3 + time * currentConfig.waveSpeed + r * 0.05) * 5 * intensityMult;
        const x = centerX + Math.cos(angle + wave * 0.01) * r;
        const y = centerY + Math.sin(angle + wave * 0.01) * r;
        ctx.lineTo(x, y);
      }

      const opacity = 0.02 * (isActiveState ? 2 : 0.5);
      ctx.strokeStyle = `rgba(${colorPalette.secondary.r}, ${colorPalette.secondary.g}, ${colorPalette.secondary.b}, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [currentConfig, isActiveState, intensity]);

  const drawBinaryRain = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!isActiveState) return;
    
    const time = timeRef.current;
    const chars = binaryCharsRef.current;

    chars.forEach((char) => {
      // Update position
      char.y += char.speed * (isActiveState ? 1.5 : 0.3);
      
      // Reset when off screen
      if (char.y > height) {
        char.y = -10;
        char.x = Math.random() * width;
        char.char = Math.random() > 0.5 ? '1' : '0';
      }

      // Flicker effect
      char.opacity = 0.02 + Math.random() * 0.03 * intensity.opacity;

      ctx.fillStyle = `rgba(${colorPalette.primary.r}, ${colorPalette.primary.g}, ${colorPalette.primary.b}, ${char.opacity})`;
      ctx.font = `${char.size}px monospace`;
      ctx.fillText(char.char, char.x, char.y);
    });
  }, [isActiveState, intensity]);

  const drawParticles = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const time = timeRef.current;
    const particles = particlesRef.current;
    const centerX = width / 2;
    const centerY = height / 2;

    // Update and draw particles with 3D depth
    particles.forEach((particle) => {
      // Wave motion with intensity
      const ringWave = Math.sin(particle.phase + time * particle.speed * 50 * intensity.speed) * currentConfig.waveAmplitude * intensity.waveAmplitude;
      const radialOffset = ringWave * (particle.ringIndex + 1) / currentConfig.rings;
      
      // Angular wave
      const angularWave = Math.cos(particle.angle * 3 + time * currentConfig.waveSpeed * 30 * intensity.speed) * (currentConfig.waveAmplitude * 0.3 * intensity.waveAmplitude);
      
      // Breathing effect
      const breathe = Math.sin(time * 0.015 * intensity.speed + particle.phase) * 2 * intensity.waveAmplitude;
      
      // Calculate position with depth
      const targetRadius = 45 + particle.ringIndex * ((Math.min(width, height) / 2 - 12) - 45) / (currentConfig.rings - 1);
      const newRadius = targetRadius + radialOffset + breathe;
      
      particle.x = centerX + Math.cos(particle.angle + angularWave * 0.01) * newRadius;
      particle.y = centerY + Math.sin(particle.angle + angularWave * 0.01) * newRadius;

      // 3D depth scaling
      const depthScale = 0.5 + particle.z * 0.5; // 0.5 to 1.0
      const size = particle.size * depthScale * (isActiveState ? 1.2 : 1.0);
      
      // Opacity based on depth and state
      const baseOpacity = 0.3 + particle.z * 0.5; // Back particles more transparent
      const opacity = baseOpacity * intensity.opacity;

      // Draw glow with radial gradient
      const glowSize = size * 3;
      const glowGradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, glowSize
      );
      
      // Color selection based on depth
      const color = particle.z > 0.7 ? colorPalette.primary : 
                    particle.z > 0.4 ? colorPalette.secondary : colorPalette.dark;
      
      glowGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.4})`);
      glowGradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.15})`);
      glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // Core dot - solid color
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${colorPalette.primary.r}, ${colorPalette.primary.g}, ${colorPalette.primary.b}, ${opacity})`;
      ctx.fill();
    });

    // Draw connections between nearby particles (neural network effect)
    if (isActiveState && intensity.connections > 0.3) {
      const connectionDistance = 50 * intensity.connections;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            // Average z for depth-based connection opacity
            const avgZ = (particles[i].z + particles[j].z) / 2;
            const alpha = (1 - distance / connectionDistance) * 0.15 * intensity.connections * (0.3 + avgZ * 0.7);
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${colorPalette.accent.r}, ${colorPalette.accent.g}, ${colorPalette.accent.b}, ${alpha})`;
            ctx.lineWidth = 0.5 + avgZ * 0.5;
            ctx.stroke();
          }
        }
      }
    }
  }, [currentConfig, isActiveState, intensity]);

  const drawCenterPulse = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!isActiveState) return;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const time = timeRef.current;

    // Radial pulse waves from center
    const pulses = 3;
    for (let i = 0; i < pulses; i++) {
      const pulseTime = (time * 0.02 + i * 0.3) % 1;
      const radius = pulseTime * (Math.min(width, height) / 3);
      const opacity = (1 - pulseTime) * 0.1 * intensity.opacity;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${colorPalette.primary.r}, ${colorPalette.primary.g}, ${colorPalette.primary.b}, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [isActiveState, intensity]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas completely
    ctx.clearRect(0, 0, width, height);

    // Update time
    timeRef.current += 1;

    // FPS tracking for performance optimization
    const currentTime = performance.now();
    fpsRef.current.frames++;
    if (currentTime - fpsRef.current.lastTime >= 1000) {
      fpsRef.current.fps = fpsRef.current.frames;
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = currentTime;
    }

    // Draw layers in order
    drawBinaryRain(ctx, width, height);
    drawGrid(ctx, width, height);
    drawCenterPulse(ctx, width, height);
    drawParticles(ctx, width, height);

    animationRef.current = requestAnimationFrame(animate);
  }, [drawBinaryRain, drawGrid, drawCenterPulse, drawParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    canvas.width = currentConfig.width * dpr;
    canvas.height = currentConfig.height * dpr;
    canvas.style.width = `${currentConfig.width}px`;
    canvas.style.height = `${currentConfig.height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Initialize particles and binary characters
    initParticles(currentConfig.width, currentConfig.height);
    initBinaryChars(currentConfig.width, currentConfig.height);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentConfig.width, currentConfig.height, currentConfig.rings, currentConfig.particlesPerRing, initParticles, initBinaryChars, animate]);

  // Performance-based particle reduction
  const effectiveOpacity = fpsRef.current.fps < 30 ? 0.5 : 1.0;

  return (
    <div className={cn(
      "relative flex items-center justify-center transition-all duration-500",
      isActive && state !== 'idle' ? "scale-105" : "scale-100"
    )}
    style={{
      width: currentConfig.width,
      height: currentConfig.height,
    }}
    >
      {/* Canvas with will-change optimization */}
      <canvas
        ref={canvasRef}
        className={cn(
          "rounded-full transition-opacity duration-500",
          isActive ? "opacity-100" : "opacity-40"
        )}
        style={{
          willChange: 'transform',
          opacity: effectiveOpacity,
        }}
      />
    </div>
  );
}
