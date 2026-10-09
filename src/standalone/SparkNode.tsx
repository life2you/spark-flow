import React, { useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import type { Point } from '../core/types';

export interface SparkNodeProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  position: Point;
  width?: number;
  zoom?: number;
  isSelected?: boolean;
  onPositionChange?: (newPos: Point) => void;
  onSelect?: () => void;
  className?: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const SparkNode: React.FC<SparkNodeProps> = ({
  id,
  title,
  icon,
  position,
  width,
  zoom = 1,
  isSelected = false,
  onPositionChange,
  onSelect,
  className = '',
  children,
  headerAction,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    e.stopPropagation();
    onSelect?.();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...position };

    const onPointerMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      onPositionChange?.({
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
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`absolute rounded-[18px] bg-[rgba(22,23,27,0.94)] border backdrop-blur-xl p-[18px] shadow-[0_18px_38px_-12px_rgba(0,0,0,0.65)] cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isSelected
          ? 'border-amber-400/80 shadow-[0_0_24px_rgba(245,158,11,0.25),0_18px_40px_rgba(0,0,0,0.8)] ring-1 ring-amber-400/50'
          : 'border-[rgba(255,255,255,0.08)] hover:border-white/20'
      } ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: width ? `${width}px` : undefined,
      }}
    >
      {/* 头部标题与控制按钮 */}
      <div className="flex items-center justify-between mb-3 text-sm font-semibold tracking-tight text-neutral-200">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
        </div>
        <div
          className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          data-no-drag
        >
          {headerAction || <MoreVertical size={14} />}
        </div>
      </div>

      {/* 节点主体内容 */}
      <div className="relative z-10" data-no-drag>
        {children}
      </div>
    </div>
  );
};
