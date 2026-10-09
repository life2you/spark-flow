import React from 'react';
import { BorderBeam } from '../standalone/BorderBeam';

export interface BorderBeamCardProps {
  title?: string;
  icon?: React.ReactNode;
  active?: boolean;
  beamColor?: string;
  activePort?: string | null;
  className?: string;
  children: React.ReactNode;
}

/**
 * 专为 React Flow 自定义节点设计的深邃毛玻璃与圆角激光卡片
 */
export const BorderBeamCard: React.FC<BorderBeamCardProps> = ({
  title,
  icon,
  active = false,
  beamColor = '#f59e0b',
  activePort,
  className = '',
  children,
}) => {
  return (
    <div
      className={`relative rounded-[18px] bg-[rgba(22,23,27,0.94)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl p-[18px] shadow-[0_18px_38px_-12px_rgba(0,0,0,0.65)] select-none min-w-[220px] ${className}`}
    >
      <BorderBeam active={active} color={beamColor} activePort={activePort} />

      {title && (
        <div className="flex items-center justify-between mb-3 text-sm font-semibold tracking-tight text-neutral-200">
          <div className="flex items-center gap-2">
            {icon && <span className="opacity-80">{icon}</span>}
            <span>{title}</span>
          </div>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
