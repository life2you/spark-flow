import React, { useState } from 'react';
import { Volume2, VolumeX, Sliders, Play, RotateCcw, Zap } from 'lucide-react';
import type { FlowConfig, PortTheme } from '../types';

interface ControlPanelProps {
  config: FlowConfig;
  onConfigChange: (newConfig: FlowConfig) => void;
  portThemes: Record<string, PortTheme>;
  onThemeChange: (port: string, color: string) => void;
  onReset: () => void;
  onConnectAll: () => void;
  onAutoPlay: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onConfigChange,
  portThemes,
  onThemeChange,
  onReset,
  onConnectAll,
  onAutoPlay,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      {/* 展开的调参抽屉 */}
      {isOpen && (
        <div className="mb-3 w-[420px] bg-[rgba(20,21,26,0.95)] border border-[rgba(255,255,255,0.1)] rounded-2xl p-5 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-xs text-neutral-300 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between font-semibold text-neutral-100 pb-3 mb-3 border-b border-[rgba(255,255,255,0.08)]">
            <span className="flex items-center gap-1.5">
              <Sliders size={14} className="text-amber-400" />
              <span>SparkFlow 参数微调工坊</span>
            </span>
            <span className="text-[11px] text-neutral-500 font-normal">实时生效</span>
          </div>

          <div className="space-y-4">
            {/* 1. 色彩定制 */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-2">通道色彩定制</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(portThemes).map(([port, theme]) => (
                  <div key={port} className="flex items-center justify-between bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                    <span className="capitalize text-[11px] text-neutral-300">{port}</span>
                    <input
                      type="color"
                      value={theme.color}
                      onChange={(e) => onThemeChange(port, e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 闪电振幅抖动 */}
            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>电火花抖动振幅 (Jitter Amplitude)</span>
                <span className="text-amber-400 font-mono">{config.jitterAmplitude}px</span>
              </div>
              <input
                type="range"
                min="6"
                max="28"
                step="1"
                value={config.jitterAmplitude}
                onChange={(e) =>
                  onConfigChange({ ...config, jitterAmplitude: Number(e.target.value) })
                }
                className="w-full accent-amber-400 bg-neutral-800 h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. 磁吸感应距离 */}
            <div>
              <div className="flex justify-between text-[11px] text-neutral-400 mb-1">
                <span>磁吸感应距离阈值 (Snap Distance)</span>
                <span className="text-amber-400 font-mono">{config.snapDistance}px</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={config.snapDistance}
                onChange={(e) =>
                  onConfigChange({ ...config, snapDistance: Number(e.target.value) })
                }
                className="w-full accent-amber-400 bg-neutral-800 h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4. 开关项 */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableEmberParticles}
                  onChange={(e) =>
                    onConfigChange({ ...config, enableEmberParticles: e.target.checked })
                  }
                  className="rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-0"
                />
                <span className="text-[11px] text-neutral-300">电火花撞击飞溅微粒子 (Embers)</span>
              </label>

              <button
                onClick={() => onConfigChange({ ...config, enableAudio: !config.enableAudio })}
                className={`p-1.5 rounded-lg border flex items-center gap-1 transition-colors ${
                  config.enableAudio
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}
              >
                {config.enableAudio ? <Volume2 size={13} /> : <VolumeX size={13} />}
                <span className="text-[10px]">{config.enableAudio ? '音效开启' : '静音'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部悬浮控制条 */}
      <div className="flex items-center gap-2 bg-[rgba(20,21,26,0.85)] border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded-full backdrop-blur-xl shadow-2xl">
        <button
          onClick={onAutoPlay}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 active:scale-95 transition-all shadow-sm"
        >
          <Play size={12} fill="currentColor" />
          <span>原片演示</span>
        </button>

        <button
          onClick={onConnectAll}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs rounded-full active:scale-95 transition-all"
        >
          <Zap size={12} className="text-amber-400" />
          <span>一键通电</span>
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs rounded-full active:scale-95 transition-all"
        >
          <RotateCcw size={12} />
          <span>重置断开</span>
        </button>

        <div className="h-4 w-px bg-white/10 mx-0.5" />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-full transition-all ${
            isOpen ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders size={13} />
          <span>调参</span>
        </button>
      </div>
    </div>
  );
};
