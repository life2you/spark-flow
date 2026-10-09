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
  onColorChange?: (newColor: string) => void;
}

export const BezierWire: React.FC<BezierWireProps> = ({
  p1,
  p2,
  color = '#ffffff',
  glow = 'rgba(255, 255, 255, 0.4)',
  isActive = true,
  isDragging = false,
  onDisconnect,
  onColorChange,
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
        strokeWidth="20"
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
        strokeWidth={isDragging ? '3.5' : '3'}
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

      {/* 悬停在中点时显示的交互控制面板 (断开与快速调色) */}
      {!isDragging && (onDisconnect || onColorChange) && (
        <g
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          transform={`translate(${midX}, ${midY})`}
        >
          <rect
            x="-24"
            y="-12"
            width="48"
            height="24"
            rx="12"
            fill="#18191e"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            filter="drop-shadow(0 4px 10px rgba(0,0,0,0.6))"
          />

          {onColorChange && (
            <g transform="translate(-11, 0)">
              <title>自定义线条色彩</title>
              <circle r="6" fill={color} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <input
                  type="color"
                  value={color.startsWith('#') ? color : '#f59e0b'}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer"
                  title="点击自定义线条颜色"
                />
              </foreignObject>
            </g>
          )}

          {onDisconnect && (
            <g
              transform="translate(11, 0)"
              className="cursor-pointer hover:scale-115 transition-transform"
              onClick={(e) => {
                e.stopPropagation();
                onDisconnect();
              }}
            >
              <title>断开此连接</title>
              <circle r="6" fill="rgba(239,68,68,0.2)" stroke="rgba(239,68,68,0.6)" strokeWidth="1" />
              <path
                d="M -2.5 -2.5 L 2.5 2.5 M 2.5 -2.5 L -2.5 2.5"
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          )}
        </g>
      )}
    </g>
  );
};
