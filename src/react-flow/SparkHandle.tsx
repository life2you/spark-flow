import React from 'react';
import { Handle, type HandleProps } from '@xyflow/react';

export interface SparkFlowHandleProps extends HandleProps {
  color?: string;
  glow?: string;
  isSnapping?: boolean;
  showRipple?: boolean;
}

/**
 * 专门适配 React Flow (@xyflow/react) 的增强端口手柄
 *
 * @example
 * ```tsx
 * <SparkFlowHandle
 *   type="target"
 *   position={Position.Left}
 *   color="#f59e0b"
 *   glow="rgba(245, 158, 11, 0.65)"
 * />
 * ```
 */
export const SparkFlowHandle: React.FC<SparkFlowHandleProps> = ({
  color = '#ffffff',
  glow = 'transparent',
  isSnapping = false,
  showRipple = false,
  className = '',
  style = {},
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* 磁吸锁定环 */}
      {isSnapping && (
        <div
          className="absolute w-7 h-7 rounded-full border-[1.5px] pointer-events-none transition-all duration-200 opacity-100 scale-105"
          style={{
            borderColor: color,
            boxShadow: `0 0 12px ${glow}`,
          }}
        />
      )}

      {/* 冲击波扩散 */}
      {showRipple && (
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none animate-shockwave"
          style={{
            borderColor: color,
            color,
          }}
        />
      )}

      {/* 原生 React Flow Handle */}
      <Handle
        {...props}
        className={`!w-3 !h-3 !border-0 !rounded-full transition-transform hover:scale-135 shadow-sm ${className}`}
        style={{
          ...style,
          backgroundColor: color,
          boxShadow: glow !== 'transparent' ? `0 0 10px ${glow}` : '0 1px 3px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
};
