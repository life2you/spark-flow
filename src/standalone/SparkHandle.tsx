import React from 'react';
import type { PortTheme } from '../core/types';

export interface SparkHandleProps {
  id: string;
  type: 'source' | 'target';
  portType: string;
  theme?: PortTheme;
  isConnected?: boolean;
  isSnapping?: boolean;
  showRipple?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}

export const SparkHandle: React.FC<SparkHandleProps> = ({
  id,
  type,
  portType: _portType,
  theme,
  isConnected = false,
  isSnapping = false,
  showRipple = false,
  onPointerDown,
  onClick,
  className = '',
}) => {
  const isSource = type === 'source';
  const color = isConnected && theme ? theme.color : '#ffffff';
  const glow = isConnected && theme ? theme.glow : 'transparent';

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center ${
        isSource ? '-right-3' : '-left-3'
      } ${className}`}
    >
      {/* 磁吸锁定环 (Snap Ring) */}
      {!isSource && (
        <div
          className={`absolute w-7 h-7 rounded-full border-[1.5px] pointer-events-none transition-all duration-200 ${
            isSnapping ? 'opacity-100 scale-105' : 'opacity-0 scale-75'
          }`}
          style={{
            borderColor: theme?.color || '#f59e0b',
            boxShadow: `0 0 12px ${theme?.glow || 'rgba(245, 158, 11, 0.6)'}`,
          }}
        />
      )}

      {/* 同心圆涟漪扩散 (Pulse Shockwave) */}
      {showRipple && (
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none animate-shockwave"
          style={{
            borderColor: theme?.color || '#ffffff',
            color: theme?.color || '#ffffff',
          }}
        />
      )}

      {/* 端口圆点 Handle */}
      <div
        id={id}
        onPointerDown={onPointerDown}
        onClick={onClick}
        className="w-3 h-3 rounded-full cursor-pointer transition-transform duration-150 hover:scale-135 active:scale-95 shadow-sm"
        style={{
          backgroundColor: color,
          boxShadow: isConnected ? `0 0 10px ${glow}` : '0 1px 3px rgba(0,0,0,0.5)',
        }}
        title={isConnected ? '点击断开连接 / 拖拽重新连线' : '拖拽拉出连线'}
      />
    </div>
  );
};
