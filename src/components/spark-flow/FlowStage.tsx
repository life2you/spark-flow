import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Cpu, Sliders, Check } from 'lucide-react';
import type { PortType, PortTheme, Point, Connection, DraggingState, FlowConfig } from '../../types';
import { ElectricSparkCanvas } from './ElectricSparkCanvas';
import { BezierWire } from './BezierWire';
import { BorderBeam } from './BorderBeam';
import { Handle } from './Handle';
import { NodeCard } from './NodeCard';
import { soundFX } from '../../utils/audio';

interface FlowStageProps {
  portThemes: Record<string, PortTheme>;
  config: FlowConfig;
}

export const FlowStage: React.FC<FlowStageProps> = ({ portThemes, config }) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 节点位置状态
  const [positions, setPositions] = useState({
    prompt: { x: 130, y: 100 },
    noise: { x: 70, y: 360 },
    sampler: { x: 210, y: 500 },
    processing: { x: 740, y: 130 },
  });

  // 连线集合
  const [connections, setConnections] = useState<Connection[]>([]);

  // 正在拖拽中的连线
  const [dragging, setDragging] = useState<DraggingState | null>(null);

  // 当前电火花信息
  const [activeSpark, setActiveSpark] = useState<{
    p1: Point;
    p2: Point;
    color: string;
    glow: string;
  } | null>(null);

  // 触发涟漪的端口标识: { [portKey]: timestamp }
  const [ripples, setRipples] = useState<Record<string, number>>({});

  // 流光激活与最后连上的端口
  const [beamActive, setBeamActive] = useState(false);
  const [lastConnectedPort, setLastConnectedPort] = useState<string | null>(null);

  // 同步音效开关
  useEffect(() => {
    soundFX.enabled = config.enableAudio;
  }, [config.enableAudio]);

  // 工具函数：获取元素相对 stage 的中心坐标
  const getPortCenter = useCallback((portId: string): Point | null => {
    const el = document.getElementById(portId);
    const stage = stageRef.current;
    if (!el || !stage) return null;
    const eRect = el.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    return {
      x: eRect.left - sRect.left + eRect.width / 2,
      y: eRect.top - sRect.top + eRect.height / 2,
    };
  }, []);

  // 触发特定端口的涟漪
  const triggerRipple = (portKey: string) => {
    setRipples((prev) => ({ ...prev, [portKey]: Date.now() }));
    setTimeout(() => {
      setRipples((prev) => {
        const next = { ...prev };
        delete next[portKey];
        return next;
      });
    }, 800);
  };

  // 建立连接
  const createConnection = useCallback(
    (fromNodeId: string, fromPort: string, toNodeId: string, toPort: string) => {
      const theme = portThemes[fromPort] || { color: '#ffffff', glow: 'rgba(255,255,255,0.4)', name: fromPort };
      
      // 检查是否已连
      setConnections((prev) => {
        const filtered = prev.filter((c) => !(c.toNodeId === toNodeId && c.toPort === toPort));
        return [
          ...filtered,
          {
            fromNodeId,
            fromPort,
            toNodeId,
            toPort,
            color: theme.color,
            glow: theme.glow,
          },
        ];
      });

      // 视觉与音效反馈
      soundFX.playSnapLock();
      triggerRipple(`${toNodeId}-${toPort}`);
      setLastConnectedPort(toPort);
      setBeamActive(true);
    },
    [portThemes]
  );

  // 断开指定连接
  const removeConnection = (toNodeId: string, toPort: string) => {
    soundFX.playDisconnect();
    setConnections((prev) => prev.filter((c) => !(c.toNodeId === toNodeId && c.toPort === toPort)));
  };

  // 开始从输出端口拖拽拉线
  const handleSourcePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    port: PortType
  ) => {
    e.stopPropagation();
    const center = getPortCenter(`out-${nodeId}-${port}`);
    if (!center) return;

    const theme = portThemes[port] || { color: '#ffffff', glow: 'rgba(255,255,255,0.4)', name: port };

    // 如果该输出口已连入其他端口，先移除旧连线
    setConnections((prev) => prev.filter((c) => !(c.fromNodeId === nodeId && c.fromPort === port)));

    setDragging({
      fromNodeId: nodeId,
      fromPort: port,
      fromPoint: center,
      currentPoint: center,
      theme,
      snappedTarget: null,
    });
  };

  // 从输入端“反向拔出”已有的线，或者点击断开
  const handleTargetClickOrPull = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    port: string
  ) => {
    e.stopPropagation();
    const existing = connections.find((c) => c.toNodeId === nodeId && c.toPort === port);
    if (!existing) return;

    // 拔下连线，变成拖拽状态
    soundFX.playDisconnect();
    removeConnection(nodeId, port);

    const fromCenter = getPortCenter(`out-${existing.fromNodeId}-${existing.fromPort}`);
    if (!fromCenter) return;

    const stage = stageRef.current;
    if (!stage) return;
    const sRect = stage.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - sRect.left,
      y: e.clientY - sRect.top,
    };

    setDragging({
      fromNodeId: existing.fromNodeId,
      fromPort: existing.fromPort,
      fromPoint: fromCenter,
      currentPoint,
      theme: portThemes[existing.fromPort],
      snappedTarget: null,
    });
  };

  // 全局指针移动，处理磁吸判定与电弧
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !stageRef.current) return;

    const sRect = stageRef.current.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - sRect.left,
      y: e.clientY - sRect.top,
    };

    // 检查所有潜在输入端口与当前鼠标的距离
    const targetPorts = [
      { nodeId: 'processing', port: 'conditioning', id: 'in-processing-conditioning' },
      { nodeId: 'processing', port: 'noise', id: 'in-processing-noise' },
      { nodeId: 'processing', port: 'sampler', id: 'in-processing-sampler' },
    ];

    let foundSnap: { nodeId: string; port: string; point: Point } | null = null;

    for (const target of targetPorts) {
      // 只有类型相同才能吸附
      if (target.port === dragging.fromPort) {
        const center = getPortCenter(target.id);
        if (center) {
          const dist = Math.hypot(center.x - currentPoint.x, center.y - currentPoint.y);
          if (dist < config.snapDistance) {
            foundSnap = {
              nodeId: target.nodeId,
              port: target.port,
              point: center,
            };
            break;
          }
        }
      }
    }

    if (foundSnap) {
      if (!dragging.snappedTarget) {
        soundFX.playSparkZap();
      }
      setDragging({
        ...dragging,
        currentPoint,
        snappedTarget: foundSnap,
      });
      setActiveSpark({
        p1: currentPoint,
        p2: foundSnap.point,
        color: dragging.theme.color,
        glow: dragging.theme.glow,
      });
    } else {
      setDragging({
        ...dragging,
        currentPoint,
        snappedTarget: null,
      });
      setActiveSpark(null);
    }
  };

  // 全局松开指针，完成吸附连接或放弃
  const handlePointerUp = () => {
    if (!dragging) return;

    if (dragging.snappedTarget) {
      createConnection(
        dragging.fromNodeId,
        dragging.fromPort,
        dragging.snappedTarget.nodeId,
        dragging.snappedTarget.port
      );
    }

    setDragging(null);
    setActiveSpark(null);
  };

  // 全部连上的状态
  const isAllReady = connections.length >= 3;

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-screen overflow-hidden bg-[#0c0d10] canvas-dot-grid"
    >
      {/* 1. 闪电电弧渲染层 */}
      <ElectricSparkCanvas
        activeSpark={activeSpark}
        jitterAmplitude={config.jitterAmplitude}
        enableEmberParticles={config.enableEmberParticles}
      />

      {/* 2. SVG 平滑贝塞尔连线层 */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {/* 已确立的连线 */}
        {connections.map((conn) => {
          const p1 = getPortCenter(`out-${conn.fromNodeId}-${conn.fromPort}`);
          const p2 = getPortCenter(`in-${conn.toNodeId}-${conn.toPort}`);
          if (!p1 || !p2) return null;

          return (
            <BezierWire
              key={`${conn.fromNodeId}-${conn.fromPort}-${conn.toPort}`}
              p1={p1}
              p2={p2}
              color={conn.color}
              glow={conn.glow}
              isActive={true}
              onDisconnect={() => removeConnection(conn.toNodeId, conn.toPort)}
            />
          );
        })}

        {/* 正在拉伸的连线 */}
        {dragging && (
          <BezierWire
            p1={dragging.fromPoint}
            p2={dragging.currentPoint}
            color={dragging.snappedTarget ? dragging.theme.color : '#ffffff'}
            glow={dragging.snappedTarget ? dragging.theme.glow : 'rgba(255, 255, 255, 0.4)'}
            isActive={!!dragging.snappedTarget}
            isDragging={true}
          />
        )}
      </svg>

      {/* 3. 节点卡片 1: Prompt */}
      <NodeCard
        id="node-prompt"
        title="Prompt"
        icon={<Sparkles size={15} className="text-amber-400" />}
        position={positions.prompt}
        onPositionChange={(pos) => setPositions((p) => ({ ...p, prompt: pos }))}
        className="w-[290px]"
      >
        <div className="bg-[rgba(13,14,17,0.85)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 text-xs leading-relaxed text-neutral-300 font-sans mb-3">
          A quiet world,<br />
          in vivid color. Soft light, subtle<br />
          textures, a little unexpected magic.
        </div>
        <div className="relative flex items-center justify-end h-8 pr-1">
          <span className="text-xs font-medium text-neutral-400 mr-2">conditioning</span>
          <Handle
            id="out-prompt-conditioning"
            type="source"
            port="conditioning"
            theme={portThemes.conditioning}
            isConnected={connections.some((c) => c.fromPort === 'conditioning')}
            onPointerDown={(e) => handleSourcePointerDown(e, 'prompt', 'conditioning')}
          />
        </div>
      </NodeCard>

      {/* 4. 节点卡片 2: Random noise */}
      <NodeCard
        id="node-noise"
        title="Random noise"
        position={positions.noise}
        onPositionChange={(pos) => setPositions((p) => ({ ...p, noise: pos }))}
        className="w-[230px]"
      >
        <div className="text-xs font-mono text-neutral-400 py-1">432512</div>
        <div className="relative flex items-center justify-end h-8 pr-1 mt-1">
          <span className="text-xs font-medium text-neutral-400 mr-2">noise</span>
          <Handle
            id="out-noise-noise"
            type="source"
            port="noise"
            theme={portThemes.noise}
            isConnected={connections.some((c) => c.fromPort === 'noise')}
            onPointerDown={(e) => handleSourcePointerDown(e, 'noise', 'noise')}
          />
        </div>
      </NodeCard>

      {/* 5. 节点卡片 3: Sampler */}
      <NodeCard
        id="node-sampler"
        title="Sampler"
        icon={<Sliders size={14} className="text-purple-400" />}
        position={positions.sampler}
        onPositionChange={(pos) => setPositions((p) => ({ ...p, sampler: pos }))}
        className="w-[230px]"
      >
        <div className="text-xs font-mono text-neutral-400 py-1">euler · 24 steps</div>
        <div className="relative flex items-center justify-end h-8 pr-1 mt-1">
          <span className="text-xs font-medium text-neutral-400 mr-2">sampler</span>
          <Handle
            id="out-sampler-sampler"
            type="source"
            port="sampler"
            theme={portThemes.sampler}
            isConnected={connections.some((c) => c.fromPort === 'sampler')}
            onPointerDown={(e) => handleSourcePointerDown(e, 'sampler', 'sampler')}
          />
        </div>
      </NodeCard>

      {/* 6. 核心聚合节点: Processing */}
      <NodeCard
        id="node-processing"
        title="Processing"
        icon={<Cpu size={15} className="text-emerald-400" />}
        position={positions.processing}
        onPositionChange={(pos) => setPositions((p) => ({ ...p, processing: pos }))}
        className="w-[290px] relative overflow-hidden"
      >
        {/* 卡片边框流光跑道 & 侧边发光 */}
        <BorderBeam
          active={beamActive || isAllReady}
          color={portThemes[lastConnectedPort || 'conditioning']?.color || '#f59e0b'}
          activePort={lastConnectedPort}
        />

        {/* 端口行 1: conditioning */}
        <div className="relative flex items-center justify-between h-9 pl-4 my-1">
          <Handle
            id="in-processing-conditioning"
            type="target"
            port="conditioning"
            theme={portThemes.conditioning}
            isConnected={connections.some((c) => c.toPort === 'conditioning')}
            isSnapping={dragging?.snappedTarget?.port === 'conditioning'}
            showRipple={!!ripples['processing-conditioning']}
            onPointerDown={(e) => handleTargetClickOrPull(e, 'processing', 'conditioning')}
          />
          <span className="text-xs font-medium text-neutral-300">conditioning</span>
          <span
            className={`transition-all duration-200 ${
              connections.some((c) => c.toPort === 'conditioning') ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ color: portThemes.conditioning?.color }}
          >
            <Check size={14} strokeWidth={2.5} />
          </span>
        </div>

        {/* 端口行 2: noise */}
        <div className="relative flex items-center justify-between h-9 pl-4 my-1">
          <Handle
            id="in-processing-noise"
            type="target"
            port="noise"
            theme={portThemes.noise}
            isConnected={connections.some((c) => c.toPort === 'noise')}
            isSnapping={dragging?.snappedTarget?.port === 'noise'}
            showRipple={!!ripples['processing-noise']}
            onPointerDown={(e) => handleTargetClickOrPull(e, 'processing', 'noise')}
          />
          <span className="text-xs font-medium text-neutral-300">noise</span>
          <span
            className={`transition-all duration-200 ${
              connections.some((c) => c.toPort === 'noise') ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ color: portThemes.noise?.color }}
          >
            <Check size={14} strokeWidth={2.5} />
          </span>
        </div>

        {/* 端口行 3: sampler */}
        <div className="relative flex items-center justify-between h-9 pl-4 my-1">
          <Handle
            id="in-processing-sampler"
            type="target"
            port="sampler"
            theme={portThemes.sampler}
            isConnected={connections.some((c) => c.toPort === 'sampler')}
            isSnapping={dragging?.snappedTarget?.port === 'sampler'}
            showRipple={!!ripples['processing-sampler']}
            onPointerDown={(e) => handleTargetClickOrPull(e, 'processing', 'sampler')}
          />
          <span className="text-xs font-medium text-neutral-300">sampler</span>
          <span
            className={`transition-all duration-200 ${
              connections.some((c) => c.toPort === 'sampler') ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ color: portThemes.sampler?.color }}
          >
            <Check size={14} strokeWidth={2.5} />
          </span>
        </div>

        {/* 底部状态指示 */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-xs">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              isAllReady ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-neutral-600'
            }`}
          />
          <span className={`transition-colors duration-300 ${isAllReady ? 'text-neutral-200 font-medium' : 'text-neutral-500'}`}>
            {isAllReady ? 'All inputs ready' : 'Awaiting inputs'}
          </span>
        </div>
      </NodeCard>
    </div>
  );
};
