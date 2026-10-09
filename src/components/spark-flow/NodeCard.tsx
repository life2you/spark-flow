import React, { useRef } from 'react';
import { MoreVertical } from 'lucide-react';

interface NodeCardProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  position: { x: number; y: number };
  onPositionChange: (newPos: { x: number; y: number }) => void;
  className?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  id,
  title,
  icon,
  position,
  onPositionChange,
  className = '',
  children,
  headerAction,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 忽略端口或可交互内嵌容器
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...position };

    const onPointerMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      onPositionChange({
        x: initialPos.x + dx,
        y: initialPos.y + dy,
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onPointerDown={handlePointerDown}
      className={`absolute rounded-[18px] bg-[rgba(22,23,27,0.92)] border border-[rgba(255,255,255,0.08)] backdrop-blur-xl p-[18px] shadow-[0_18px_38px_-12px_rgba(0,0,0,0.65)] cursor-grab active:cursor-grabbing select-none transition-shadow hover:shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8)] ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-3 text-sm font-semibold tracking-tight text-neutral-200">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors" data-no-drag>
          {headerAction || <MoreVertical size={14} className="cursor-pointer" />}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="relative z-10" data-no-drag>
        {children}
      </div>
    </div>
  );
};
