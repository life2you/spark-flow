import React from 'react';
import type { Point } from '../../types';

interface BezierWireProps {
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
  // 计算平滑三次贝塞尔曲线
  const dx = Math.max(Math.abs(p2.x - p1.x) * 0.55, 45);
  const pathD = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

  // 连线中点（用于悬停交互按钮）
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;

  return (
    <g className="group pointer-events-auto cursor-pointer">
      {/* 隐藏的加粗点击响应层，便于鼠标点击选中/断开 */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="18"
        onClick={onDisconnect}
      />

      {/* 外层霓虹扩散辉光 */}
      <path
        d={pathD}
        fill="none"
        stroke={glow}
        strokeWidth={isActive ? '7' : '4'}
        strokeLinecap="round"
        style={{
          filter: 'blur(4px)',
          opacity: isActive ? 0.8 : 0.4,
          transition: 'stroke 0.25s, opacity 0.25s',
        }}
      />

      {/* 内层高亮核心连线 */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={isDragging ? '3.5' : '3'}
        strokeLinecap="round"
        style={{
          transition: 'stroke 0.25s',
        }}
      />

      {/* 鼠标悬停在中点时显示微小的断开按钮 */}
      {onDisconnect && (
        <g
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          transform={`translate(${midX}, ${midY})`}
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect();
          }}
        >
          <circle r="10" fill="#1e2025" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
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
