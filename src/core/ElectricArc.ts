import type { Point } from './types';

export interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  life: number;
  color: string;
}

/**
 * 物理电火花算法核心渲染器
 */
export class ElectricArcRenderer {
  public particles: EmberParticle[] = [];

  /**
   * 生成带正弦包络与法向量抖动的折线点集
   */
  public generateJitterPoints(
    p1: Point,
    p2: Point,
    amplitude: number,
    segmentsCount?: number
  ): Point[] {
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (dist < 4) return [p1, p2];

    const segments = segmentsCount || Math.max(5, Math.floor(dist / 9));
    const nx = -(p2.y - p1.y) / dist;
    const ny = (p2.x - p1.x) / dist;

    const points: Point[] = [{ x: p1.x, y: p1.y }];

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const envelope = Math.sin(t * Math.PI);
      const jitter = (Math.random() - 0.5) * amplitude * envelope;
      points.push({
        x: p1.x + (p2.x - p1.x) * t + nx * jitter,
        y: p1.y + (p2.y - p1.y) * t + ny * jitter,
      });
    }

    points.push({ x: p2.x, y: p2.y });
    return points;
  }

  /**
   * 在给定 Canvas 上绘制闪电与次级分叉
   */
  public renderArc(
    ctx: CanvasRenderingContext2D,
    p1: Point,
    p2: Point,
    color: string,
    glow: string,
    amplitude: number = 14,
    scale: number = 1
  ) {
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (dist < 3) return;

    const mainPoints = this.generateJitterPoints(p1, p2, amplitude * scale);

    ctx.save();
    ctx.globalAlpha = 0.85 + Math.random() * 0.15;

    // 1. 彩色发光底层
    ctx.shadowColor = glow;
    ctx.shadowBlur = 12 * scale;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.8 * Math.min(Math.max(scale, 0.75), 1.25);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
    for (let i = 1; i < mainPoints.length; i++) {
      ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
    }
    ctx.stroke();

    // 2. 随机次级分叉 (Forked sub-arc)
    if (Math.random() > 0.45 && mainPoints.length > 4) {
      const forkIdx = Math.floor(1 + Math.random() * (mainPoints.length - 3));
      const fStart = mainPoints[forkIdx];
      const angle = Math.random() * Math.PI * 2;
      const fLen = (12 + Math.random() * 16) * scale;
      const fEnd = {
        x: fStart.x + Math.cos(angle) * fLen,
        y: fStart.y + Math.sin(angle) * fLen,
      };

      ctx.lineWidth = 1.6 * scale;
      ctx.beginPath();
      ctx.moveTo(fStart.x, fStart.y);
      ctx.lineTo(
        (fStart.x + fEnd.x) / 2 + (Math.random() - 0.5) * 8 * scale,
        (fStart.y + fEnd.y) / 2 + (Math.random() - 0.5) * 8 * scale
      );
      ctx.lineTo(fEnd.x, fEnd.y);
      ctx.stroke();
    }

    // 3. 内层高能白芯
    ctx.shadowBlur = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2 * scale;
    ctx.beginPath();
    ctx.moveTo(mainPoints[0].x, mainPoints[0].y);
    for (let i = 1; i < mainPoints.length; i++) {
      ctx.lineTo(mainPoints[i].x, mainPoints[i].y);
    }
    ctx.stroke();

    ctx.restore();

    // 4. 产生微粒子
    if (Math.random() > 0.3) {
      for (let i = 0; i < 2; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = (1.5 + Math.random() * 3.5) * scale;
        this.particles.push({
          x: p2.x,
          y: p2.y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          alpha: 1.0,
          size: (1 + Math.random() * 2) * scale,
          life: 18 + Math.random() * 14,
          color,
        });
      }
    }
  }

  /**
   * 更新并渲染微粒子
   */
  public updateAndRenderParticles(ctx: CanvasRenderingContext2D) {
    if (this.particles.length === 0) return;

    ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.alpha -= 1 / p.life;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
