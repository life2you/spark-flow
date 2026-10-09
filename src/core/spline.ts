import type { Point } from './types';

/**
 * 计算 S 型平滑三次贝塞尔曲线 SVG Path 数据
 */
export function getBezierSplinePath(
  p1: Point,
  p2: Point,
  curvature: number = 0.55,
  minOffset: number = 45
): string {
  const dx = Math.max(Math.abs(p2.x - p1.x) * curvature, minOffset);
  return `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;
}
