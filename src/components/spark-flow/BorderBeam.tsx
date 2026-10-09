import React, { useEffect, useRef, useState } from 'react';

interface BorderBeamProps {
  active?: boolean;
  color?: string;
  glowColor?: string;
  duration?: number;
  activePort?: string | null;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  active = false,
  color = '#f59e0b',
  activePort,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 280, height: 236 });

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, []);

  const gradientId = `beam-grad-${color.replace('#', '')}`;
  const filterId = `beam-filter-${color.replace('#', '')}`;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 rounded-[18px] pointer-events-none overflow-hidden z-0 transition-opacity duration-300 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* 1. 侧边通电晕染光柱 (Port Aura) */}
      <div
        className="absolute left-0 top-0 w-3 h-full rounded-l-[18px] transition-all duration-300"
        style={{
          opacity: activePort ? 0.9 : 0.3,
          background: activePort === 'conditioning'
            ? 'linear-gradient(180deg, transparent 5%, #f59e0b 25%, #f59e0b 45%, transparent 65%)'
            : activePort === 'noise'
            ? 'linear-gradient(180deg, transparent 30%, #ec4899 45%, #ec4899 65%, transparent 80%)'
            : activePort === 'sampler'
            ? 'linear-gradient(180deg, transparent 50%, #a855f7 70%, #a855f7 90%, transparent 100%)'
            : `linear-gradient(180deg, transparent 10%, ${color} 50%, transparent 90%)`,
          boxShadow: `0 0 24px 6px ${color}`,
          filter: 'blur(6px)',
        }}
      />

      {/* 2. 圆角激光边框 (Border Beam) */}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color={color} stop-opacity="0" />
            <stop offset="50%" stop-color={color} stop-opacity="1" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="1.5"
          y="1.5"
          width={Math.max(size.width - 3, 10)}
          height={Math.max(size.height - 3, 10)}
          rx="17"
          fill="none"
          stroke={`url(#${gradientId})`}
          filter={`url(#${filterId})`}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray="95 450"
          className="animate-beam"
        />
      </svg>
    </div>
  );
};
