import React from 'react';
import type { Point } from '../core/types';
import { getBezierSplinePath } from '../core/spline';

export interface BezierWireProps {
  p1: Point;
  p2: Point;
  color?: string;
  glow?: string;
  isActive?: boolean;
  isDragging?: boolean;
  onDisconnect?: () => void;
}

export const BezierWire: React.FC<BezierWireProps> = ({
  p1,
  p2,
  color = '#ffffff',
  glow = 'rgba(255, 255, 255, 0.4)',
  isActive = true,
  isDragging = false,
  onDisconnect,
}) => {
  const pathD = getBezierSplinePath(p1, p2);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <g className="group pointer-events-auto cursor-pointer">
      {/* 隐藏的加粗点击响应层 */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="18"
        onClick={onDisconnect}
      />

      {/* 外层柔和霓虹辉光 */}
      <path
        d={pathD}
        fill="none"
        stroke={glow}
        strokeWidth={isActive ? '7' : '4'}
        strokeLinecap="round"
        style={{
          filter: 'blur(4px)',
          opacity: isActive ? 0.85 : 0.4,
          transition: 'stroke 0.25s, opacity 0.25s',
        }}
      />

      {/* 内层高亮核心连线 */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isDragging ? '3.2' : '3'}
        strokeLinecap="round"
        style={{
          transition: 'stroke 0.25s',
        }}
      />

      {/* 拖拽末端白圆点 */}
      {isDragging && (
        <circle
          cx={p2.x}
          cy={p2.y}
          r={6}
          fill="#ffffff"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.85))' }}
        />
      )}

      {/* 悬停断开按钮 */}
      {onDisconnect && (
        <g
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          transform={`translate(${midX}, ${midY})`}
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect();
          }}
        >
          <circle r="10" fill="#18191e" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <path
            d="M -3 -3 L 3 3 M 3 -3 L -3 3"
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};
