import React, { useRef, useState } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { Point } from '../../types';

interface NodeCardProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  position: Point;
  width?: number;
  zoom?: number;
  isSelected?: boolean;
  onPositionChange: (newPos: Point) => void;
  onSelect?: () => void;
  onDelete?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  id,
  title,
  icon,
  position,
  width,
  zoom = 1,
  isSelected = false,
  onPositionChange,
  onSelect,
  onDelete,
  className = '',
  children,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 忽略端口或可交互内嵌容器
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    e.stopPropagation();
    onSelect?.();

    const startX = e.clientX;
    const startY = e.clientY;
    const initialPos = { ...position };

    const onPointerMove = (ev: PointerEvent) => {
      // 根据 zoom 逆运算，保证手感绝对跟手
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
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
      {/* 卡片头部 */}
      <div className="flex items-center justify-between mb-3 text-sm font-semibold tracking-tight text-neutral-200">
        <div className="flex items-center gap-2">
          {icon && <span className="opacity-80">{icon}</span>}
          <span>{title}</span>
        </div>

        {/* 右上角操作菜单 */}
        <div className="relative" data-no-drag>
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="flex items-center justify-center p-1 rounded hover:bg-white/10 text-neutral-500 hover:text-neutral-200 cursor-pointer transition-colors"
          >
            <MoreVertical size={14} />
          </div>

          {showMenu && (
            <div
              className="absolute right-0 top-6 z-50 w-28 bg-[rgba(20,21,26,0.98)] border border-white/10 rounded-xl p-1 shadow-xl animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete?.();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
              >
                <Trash2 size={12} />
                <span>删除节点</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 内容插槽 */}
      <div className="relative z-10" data-no-drag>
        {children}
      </div>
    </div>
  );
};
