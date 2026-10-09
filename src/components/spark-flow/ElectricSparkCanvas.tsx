import React, { useEffect, useRef } from 'react';
import type { Point } from '../../types';

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
}

interface ElectricSparkCanvasProps {
  activeSpark: {
    p1: Point;
    p2: Point;
    color: string;
    glow: string;
  } | null;
  jitterAmplitude?: number;
  enableEmberParticles?: boolean;
}

export const ElectricSparkCanvas: React.FC<ElectricSparkCanvasProps> = ({
  activeSpark,
  jitterAmplitude = 14,
  enableEmberParticles = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<EmberParticle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // 绘制单条带噪波折线
    const drawJitterPath = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      amplitude: number,
      segmentsCount?: number
    ): Point[] => {
      const dist = Math.hypot(x2 - x1, y2 - y1);
      const segments = segmentsCount || Math.max(5, Math.floor(dist / 9));
      const nx = -(y2 - y1) / (dist || 1);
      const ny = (x2 - x1) / (dist || 1);

      const points: Point[] = [{ x: x1, y: y1 }];

      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const envelope = Math.sin(t * Math.PI);
        const jitter = (Math.random() - 0.5) * amplitude * envelope;
        points.push({
          x: x1 + (x2 - x1) * t + nx * jitter,
          y: y1 + (y2 - y1) * t + ny * jitter,
        });
      }
      points.push({ x: x2, y: y2 });
      return points;
    };

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, width, height);

      // 1. 绘制电火花电弧
      if (activeSpark) {
        const { p1, p2, color, glow } = activeSpark;
        const mainPoints = drawJitterPath(p1.x, p1.y, p2.x, p2.y, jitterAmplitude);

        // 动态闪烁透明度
        const flicker = 0.8 + Math.random() * 0.2;

        ctx.save();
        ctx.globalAlpha = flicker;

        // 外层彩光晕层
        ctx.shadowColor = glow;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
        for (let i = 1; i < mainPoints.length; i++) {
          ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
        }
        ctx.stroke();

        // 随机分裂出 1 根微小的次级分叉电火花 (Forked sub-arc)
        if (Math.random() > 0.4 && mainPoints.length > 4) {
          const forkIndex = Math.floor(1 + Math.random() * (mainPoints.length - 3));
          const forkStart = mainPoints[forkIndex];
          const angle = Math.random() * Math.PI * 2;
          const forkLen = 12 + Math.random() * 16;
          const forkEnd = {
            x: forkStart.x + Math.cos(angle) * forkLen,
            y: forkStart.y + Math.sin(angle) * forkLen,
          };
          const forkPoints = drawJitterPath(forkStart.x, forkStart.y, forkEnd.x, forkEnd.y, jitterAmplitude * 0.5, 4);

          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(forkPoints[0].x, forkPoints[0].y);
          for (let i = 1; i < forkPoints.length; i++) {
            ctx.lineTo(forkPoints[i].x, forkPoints[i].y);
          }
          ctx.stroke();
        }

        // 内层高能纯白芯
        ctx.shadowBlur = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
        for (let i = 1; i < mainPoints.length; i++) {
          ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
        }
        ctx.stroke();

        ctx.restore();

        // 产生击中目标处的微光粒子 (Embers)
        if (enableEmberParticles && Math.random() > 0.3) {
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            particlesRef.current.push({
              x: p2.x,
              y: p2.y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              alpha: 1.0,
              size: 1 + Math.random() * 2,
              life: 18 + Math.random() * 14,
            });
          }
        }
      }

      // 2. 渲染并更新粒子飞溅 (Ember Particles)
      if (particlesRef.current.length > 0) {
        ctx.save();
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.94;
          p.vy *= 0.94;
          p.alpha -= 1 / p.life;

          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }

          ctx.fillStyle = activeSpark ? activeSpark.color : '#ffffff';
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activeSpark, jitterAmplitude, enableEmberParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
};
