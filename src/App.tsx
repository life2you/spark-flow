import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { FlowStage } from './components/spark-flow/FlowStage';
import { ControlPanel } from './components/ControlPanel';
import { ReactFlowDemo } from './playground/ReactFlowDemo';
import type { PortTheme, FlowConfig } from './types';

const INITIAL_THEMES: Record<string, PortTheme> = {
  conditioning: {
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.65)',
    name: 'conditioning',
  },
  noise: {
    color: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.65)',
    name: 'noise',
  },
  sampler: {
    color: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.65)',
    name: 'sampler',
  },
};

const INITIAL_CONFIG: FlowConfig = {
  snapDistance: 70,
  jitterAmplitude: 14,
  enableAudio: true,
  enableEmberParticles: true,
  borderBeamDuration: 3.2,
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'standalone' | 'react-flow'>('standalone');
  const [portThemes, setPortThemes] = useState<Record<string, PortTheme>>(INITIAL_THEMES);
  const [config, setConfig] = useState<FlowConfig>(INITIAL_CONFIG);

  const handleThemeChange = (port: string, color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 255;
    const glow = `rgba(${r}, ${g}, ${b}, 0.65)`;

    setPortThemes((prev) => ({
      ...prev,
      [port]: {
        ...prev[port],
        color,
        glow,
      },
    }));
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0c0d10] font-sans">
      {/* 顶部状态提示与品牌导航 */}
      <header className="absolute top-5 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold flex items-center justify-center text-sm shadow-lg pointer-events-auto">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              SparkFlow
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                v0.1.0
              </span>
            </span>
            <span className="text-[10px] text-neutral-500">
              Physics Electric Arc & Spline Canvas
            </span>
          </div>
        </div>

        {/* 核心功能：双模一键切换 (Segmented Control) */}
        <div className="pointer-events-auto flex items-center p-1 rounded-full bg-[rgba(20,21,26,0.85)] border border-white/10 backdrop-blur-xl shadow-xl">
          <button
            onClick={() => setActiveTab('standalone')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === 'standalone'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            ⚡ 原生轻量引擎 (Standalone)
          </button>
          <button
            onClick={() => setActiveTab('react-flow')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'react-flow'
                ? 'bg-white text-black shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers size={12} />
            <span>React Flow 插件 (@xyflow)</span>
          </button>
        </div>

        {/* 右侧 GitHub 链接 */}
        <div className="pointer-events-auto flex items-center gap-2">
          <a
            href="https://github.com/life2you/spark-flow"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(20,21,26,0.8)] border border-white/10 hover:border-white/25 text-neutral-300 hover:text-white transition-all text-xs backdrop-blur-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </header>

      {/* 视图主体 */}
      {activeTab === 'standalone' ? (
        <>
          <FlowStage portThemes={portThemes} config={config} />
          <ControlPanel
            config={config}
            onConfigChange={setConfig}
            portThemes={portThemes}
            onThemeChange={handleThemeChange}
            onReset={handleReset}
            onConnectAll={() => {}}
            onAutoPlay={() => {}}
          />
        </>
      ) : (
        <ReactFlowDemo />
      )}
    </div>
  );
};

export default App;
