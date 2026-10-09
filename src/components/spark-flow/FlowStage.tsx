import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Dices,
  Sliders,
  Cpu,
  Layers,
  Image as ImageIcon,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
} from 'lucide-react';
import type {
  PortType,
  PortTheme,
  Point,
  Viewport,
  FlowNode,
  Connection,
  DraggingState,
  FlowConfig,
} from '../../types';
import { INITIAL_NODES, NODE_TEMPLATES, DEFAULT_PORT_THEMES } from '../../constants/presets';
import { ElectricSparkCanvas } from './ElectricSparkCanvas';
import { BezierWire } from './BezierWire';
import { BorderBeam } from './BorderBeam';
import { Handle } from './Handle';
import { NodeCard } from './NodeCard';
import { NodeMenuModal } from './NodeMenuModal';
import { soundFX } from '../../utils/audio';

interface FlowStageProps {
  portThemes: Record<string, PortTheme>;
  config: FlowConfig;
}

export const FlowStage: React.FC<FlowStageProps> = ({ portThemes, config }) => {
  const stageRef = useRef<HTMLDivElement | null>(null);

  // 1. 无限画布视口 (Pan & Zoom)
  const [viewport, setViewport] = useState<Viewport>({ x: 40, y: 30, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; initX: number; initY: number } | null>(null);
  const spacePressedRef = useRef(false);

  // 2. 动态节点拓扑列表
  const [nodes, setNodes] = useState<FlowNode[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 3. 添加节点弹窗
  const [menuModal, setMenuModal] = useState<{ isOpen: boolean; clientPos: Point | null; worldPos: Point }>({
    isOpen: false,
    clientPos: null,
    worldPos: { x: 300, y: 200 },
  });

  // 4. 连线与交互状态
  const [connections, setConnections] = useState<Connection[]>([]);
  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [activeSpark, setActiveSpark] = useState<{
    p1: Point;
    p2: Point;
    color: string;
    glow: string;
  } | null>(null);
  const [ripples, setRipples] = useState<Record<string, number>>({});
  const [beamActive, setBeamActive] = useState(false);
  const [lastConnectedPort, setLastConnectedPort] = useState<string | null>(null);

  // 同步音效设置
  useEffect(() => {
    soundFX.enabled = config.enableAudio;
  }, [config.enableAudio]);

  // 屏幕坐标转画布世界坐标
  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Point => {
      const stage = stageRef.current;
      if (!stage) return { x: 0, y: 0 };
      const sRect = stage.getBoundingClientRect();
      return {
        x: (clientX - sRect.left - viewport.x) / viewport.zoom,
        y: (clientY - sRect.top - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // 获取端口的世界坐标
  const getPortWorldCenter = useCallback(
    (portElId: string): Point | null => {
      const el = document.getElementById(portElId);
      const stage = stageRef.current;
      if (!el || !stage) return null;
      const eRect = el.getBoundingClientRect();
      const sRect = stage.getBoundingClientRect();
      return {
        x: (eRect.left - sRect.left + eRect.width / 2 - viewport.x) / viewport.zoom,
        y: (eRect.top - sRect.top + eRect.height / 2 - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  // 滚轮缩放处理（以鼠标焦点为中心平滑缩放）
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const sRect = stage.getBoundingClientRect();
    const mouseX = e.clientX - sRect.left;
    const mouseY = e.clientY - sRect.top;

    const zoomFactor = e.deltaY < 0 ? 1.09 : 0.91;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.35), 2.4);

    // 维持鼠标指针下的世界坐标稳定
    const worldX = (mouseX - viewport.x) / viewport.zoom;
    const worldY = (mouseY - viewport.y) / viewport.zoom;

    setViewport({
      zoom: newZoom,
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom,
    });
  };

  // 监听键盘快捷键（空格平移、Delete/Backspace 删除节点）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressedRef.current) {
        spacePressedRef.current = true;
      }
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedNodeId) {
        // 防止误删输入框文字
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;

        deleteNode(selectedNodeId);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressedRef.current = false;
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [selectedNodeId]);

  // 画布平移交互
  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // 只有在点中背景或按住空格/中键时启动平移
    const isMiddleButton = e.button === 1;
    const isBackground = e.target === stageRef.current || (e.target as HTMLElement).classList.contains('canvas-transform-layer');

    if (isMiddleButton || spacePressedRef.current || isBackground) {
      e.preventDefault();
      setSelectedNodeId(null);
      setMenuModal((m) => ({ ...m, isOpen: false }));
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initX: viewport.x,
        initY: viewport.y,
      };
    }
  };

  // 双击空白处弹出创建节点菜单
  const handleStageDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const isBackground = e.target === stageRef.current || (e.target as HTMLElement).classList.contains('canvas-transform-layer');
    if (!isBackground) return;

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    setMenuModal({
      isOpen: true,
      clientPos: { x: e.clientX, y: e.clientY },
      worldPos: worldPoint,
    });
  };

  // 添加新节点
  const handleAddNodeFromTemplate = (templateType: string) => {
    const tmpl = NODE_TEMPLATES.find((t) => t.type === templateType);
    if (!tmpl) return;

    const newId = `node-${templateType}-${Date.now().toString().slice(-4)}`;
    const newNode: FlowNode = {
      id: newId,
      type: tmpl.type,
      title: tmpl.title,
      iconType: tmpl.iconType,
      position: {
        x: Math.round(menuModal.worldPos.x - tmpl.width / 2),
        y: Math.round(menuModal.worldPos.y - 40),
      },
      width: tmpl.width,
      inputs: tmpl.inputs.map((inp) => ({ ...inp, id: `in-${newId}-${inp.type}` })),
      outputs: tmpl.outputs.map((out) => ({ ...out, id: `out-${newId}-${out.type}` })),
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newId);
    setMenuModal((m) => ({ ...m, isOpen: false }));
    soundFX.playSnapLock();
  };

  // 删除节点并级联移除相关连线
  const deleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) => prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    soundFX.playDisconnect();
  };

  // 连线与磁吸逻辑
  const createConnection = useCallback(
    (fromNodeId: string, fromPort: string, toNodeId: string, toPort: string, portType: PortType) => {
      const theme =
        portThemes[portType] ||
        DEFAULT_PORT_THEMES[portType] || {
          color: '#ffffff',
          glow: 'rgba(255,255,255,0.4)',
          name: portType,
        };

      setConnections((prev) => {
        const filtered = prev.filter((c) => !(c.toNodeId === toNodeId && c.toPort === toPort));
        return [
          ...filtered,
          {
            id: `conn-${Date.now()}`,
            fromNodeId,
            fromPort,
            toNodeId,
            toPort,
            type: portType,
            color: theme.color,
            glow: theme.glow,
          },
        ];
      });

      soundFX.playSnapLock();
      const rippleKey = `${toNodeId}-${toPort}`;
      setRipples((prev) => ({ ...prev, [rippleKey]: Date.now() }));
      setTimeout(() => {
        setRipples((prev) => {
          const next = { ...prev };
          delete next[rippleKey];
          return next;
        });
      }, 800);

      setLastConnectedPort(portType);
      setBeamActive(true);
    },
    [portThemes]
  );

  const removeConnection = (toNodeId: string, toPort: string) => {
    soundFX.playDisconnect();
    setConnections((prev) => prev.filter((c) => !(c.toNodeId === toNodeId && c.toPort === toPort)));
  };

  // 从输出端拖线
  const handleSourcePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    portId: string,
    portType: PortType
  ) => {
    e.stopPropagation();
    const center = getPortWorldCenter(portId);
    if (!center) return;

    const theme = portThemes[portType] || { color: '#ffffff', glow: 'rgba(255,255,255,0.4)', name: portType };

    // 移除已存在的该输出线
    setConnections((prev) => prev.filter((c) => !(c.fromNodeId === nodeId && c.fromPort === portId)));

    setDragging({
      fromNodeId: nodeId,
      fromPort: portId,
      fromPortType: portType,
      fromPoint: center,
      currentPoint: center,
      theme,
      snappedTarget: null,
    });
  };

  // 从输入端反向拔线
  const handleTargetPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    nodeId: string,
    portId: string,
    portType: PortType
  ) => {
    const existing = connections.find((c) => c.toNodeId === nodeId && c.toPort === portId);
    if (!existing) return;

    e.stopPropagation();
    soundFX.playDisconnect();
    removeConnection(nodeId, portId);

    const fromCenter = getPortWorldCenter(existing.fromPort);
    if (!fromCenter) return;

    const worldPoint = screenToWorld(e.clientX, e.clientY);

    setDragging({
      fromNodeId: existing.fromNodeId,
      fromPort: existing.fromPort,
      fromPortType: portType,
      fromPoint: fromCenter,
      currentPoint: worldPoint,
      theme: portThemes[portType] || { color: '#ffffff', glow: 'rgba(255,255,255,0.4)', name: portType },
      snappedTarget: null,
    });
  };

  // 全局指针移动：处理平移或拖拽连线
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. 画布平移
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      setViewport((v) => ({
        ...v,
        x: panStartRef.current!.initX + dx,
        y: panStartRef.current!.initY + dy,
      }));
      return;
    }

    // 2. 连线拖拽与磁吸判定
    if (!dragging) return;

    const worldMouse = screenToWorld(e.clientX, e.clientY);

    // 遍历所有节点的输入端口查找相同类型的目标端口
    let foundSnap: { nodeId: string; port: string; point: Point } | null = null;

    for (const node of nodes) {
      if (node.id === dragging.fromNodeId) continue; // 不连自己
      for (const input of node.inputs) {
        if (input.type === dragging.fromPortType) {
          const center = getPortWorldCenter(input.id);
          if (center) {
            const dist = Math.hypot(center.x - worldMouse.x, center.y - worldMouse.y);
            // 考虑缩放对屏幕像素距离的映射
            if (dist < config.snapDistance / viewport.zoom) {
              foundSnap = {
                nodeId: node.id,
                port: input.id,
                point: center,
              };
              break;
            }
          }
        }
      }
      if (foundSnap) break;
    }

    if (foundSnap) {
      if (!dragging.snappedTarget) {
        soundFX.playSparkZap();
      }
      setDragging({
        ...dragging,
        currentPoint: worldMouse,
        snappedTarget: foundSnap,
      });
      setActiveSpark({
        p1: worldMouse,
        p2: foundSnap.point,
        color: dragging.theme.color,
        glow: dragging.theme.glow,
      });
    } else {
      setDragging({
        ...dragging,
        currentPoint: worldMouse,
        snappedTarget: null,
      });
      setActiveSpark(null);
    }
  };

  // 全局松开
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }

    if (dragging) {
      if (dragging.snappedTarget) {
        createConnection(
          dragging.fromNodeId,
          dragging.fromPort,
          dragging.snappedTarget.nodeId,
          dragging.snappedTarget.port,
          dragging.fromPortType
        );
      }
      setDragging(null);
      setActiveSpark(null);
    }
  };

  // 渲染节点图标
  const renderNodeIcon = (iconType: string) => {
    switch (iconType) {
      case 'sparkles':
        return <Sparkles size={15} className="text-amber-400" />;
      case 'dice':
        return <Dices size={15} className="text-pink-400" />;
      case 'sliders':
        return <Sliders size={14} className="text-purple-400" />;
      case 'cpu':
        return <Cpu size={15} className="text-emerald-400" />;
      case 'layers':
        return <Layers size={15} className="text-blue-400" />;
      case 'image':
        return <ImageIcon size={15} className="text-emerald-400" />;
      default:
        return <Sparkles size={15} className="text-amber-400" />;
    }
  };

  return (
    <div
      ref={stageRef}
      onWheel={handleWheel}
      onPointerDown={handleStagePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleStageDoubleClick}
      className={`relative w-full h-screen overflow-hidden bg-[#0c0d10] select-none ${
        isPanning ? 'cursor-grabbing' : spacePressedRef.current ? 'cursor-grab' : 'cursor-default'
      }`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: `${24 * viewport.zoom}px ${24 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      {/* 1. 物理电火花 Canvas 层 (以全屏 Retina 视口绘制，传入 viewport 保持极致清晰) */}
      <ElectricSparkCanvas
        activeSpark={activeSpark}
        viewport={viewport}
        jitterAmplitude={config.jitterAmplitude}
        enableEmberParticles={config.enableEmberParticles}
      />

      {/* 2. 变换舞台容器 (所有节点和 SVG 连线在统一世界坐标系下) */}
      <div
        className="canvas-transform-layer absolute inset-0 pointer-events-none origin-top-left"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          width: '100%',
          height: '100%',
        }}
      >
        {/* SVG 连线层 */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-10">
          {/* 已建立的连线 */}
          {connections.map((conn) => {
            const p1 = getPortWorldCenter(conn.fromPort);
            const p2 = getPortWorldCenter(conn.toPort);
            if (!p1 || !p2) return null;

            return (
              <BezierWire
                key={conn.id}
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

        {/* 动态节点列表渲染 */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isProcessingNode = node.type === 'processing';

          // 检查该节点连入的输入连线与最后接入的通道类型
          const inConns = connections.filter((c) => c.toNodeId === node.id);
          const hasInConn = inConns.length > 0;
          const lastInConn = inConns[inConns.length - 1];
          const activeTheme = lastInConn
            ? portThemes[lastInConn.type] || DEFAULT_PORT_THEMES[lastInConn.type]
            : null;

          return (
            <NodeCard
              key={node.id}
              id={node.id}
              title={node.title}
              icon={renderNodeIcon(node.iconType)}
              position={node.position}
              width={node.width}
              zoom={viewport.zoom}
              isSelected={isSelected}
              onPositionChange={(newPos) => {
                setNodes((prev) =>
                  prev.map((n) => (n.id === node.id ? { ...n, position: newPos } : n))
                );
              }}
              onSelect={() => setSelectedNodeId(node.id)}
              onDelete={() => deleteNode(node.id)}
              className="pointer-events-auto"
            >
              {/* 为所有被接入的节点（以及核心聚合卡片）赋予对应的激光流光与侧边通电晕染 */}
              <BorderBeam
                active={isProcessingNode ? (beamActive || inConns.length >= 3) : hasInConn}
                color={
                  activeTheme?.color ||
                  (isProcessingNode
                    ? portThemes[lastConnectedPort || 'conditioning']?.color || '#f59e0b'
                    : '#10b981')
                }
                activePort={lastInConn?.type || lastConnectedPort}
              />

              {/* 特殊节点内部主体内容 */}
              {node.type === 'prompt' && (
                <div className="bg-[rgba(13,14,17,0.85)] border border-[rgba(255,255,255,0.05)] rounded-xl p-3 text-xs leading-relaxed text-neutral-300 font-sans mb-3">
                  {(node.data?.text as string) || 'Prompt text container...'}
                </div>
              )}
              {node.type === 'noise' && (
                <div className="text-xs font-mono text-neutral-400 py-1">
                  {(node.data?.seed as string) || '432512'}
                </div>
              )}
              {node.type === 'sampler' && (
                <div className="text-xs font-mono text-neutral-400 py-1">
                  {(node.data?.params as string) || 'euler · 24 steps'}
                </div>
              )}
              {node.type === 'vae-decode' && (
                <div className="bg-[rgba(13,14,17,0.85)] border border-[rgba(255,255,255,0.05)] rounded-xl p-2.5 text-xs text-neutral-400 font-mono mb-2 flex items-center justify-between">
                  <span>SDXL VAE · fp16</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-sans transition-colors ${
                      hasInConn ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {hasInConn ? 'Active' : 'Idle'}
                  </span>
                </div>
              )}
              {node.type === 'image-preview' && (
                <div className="h-36 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-xs text-neutral-400 mb-2 overflow-hidden relative group">
                  {hasInConn ? (
                    <div className="w-full h-full relative animate-in fade-in duration-300">
                      <img
                        src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80"
                        alt="AI Generated"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          1024x1024 · 24 steps · 3.2s
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 opacity-50 font-mono text-[11px]">
                      <ImageIcon size={14} /> 等待输入生成图像...
                    </span>
                  )}
                </div>
              )}

              {/* 输入端口列表 */}
              {node.inputs.map((inp) => {
                const isConn = connections.some((c) => c.toNodeId === node.id && c.toPort === inp.id);
                const isSnapping = dragging?.snappedTarget?.port === inp.id;
                const showRipple = !!ripples[`${node.id}-${inp.id}`];

                return (
                  <div key={inp.id} className="relative flex items-center justify-between h-9 pl-4 my-1">
                    <Handle
                      id={inp.id}
                      type="target"
                      port={inp.type}
                      theme={portThemes[inp.type] || DEFAULT_PORT_THEMES[inp.type]}
                      isConnected={isConn}
                      isSnapping={isSnapping}
                      showRipple={showRipple}
                      onPointerDown={(e) => handleTargetPointerDown(e, node.id, inp.id, inp.type)}
                    />
                    <span className="text-xs font-medium text-neutral-300">{inp.label}</span>
                    <span
                      className={`transition-all duration-200 ${
                        isConn ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                      }`}
                      style={{ color: (portThemes[inp.type] || DEFAULT_PORT_THEMES[inp.type])?.color }}
                    >
                      <Check size={14} strokeWidth={2.5} />
                    </span>
                  </div>
                );
              })}

              {/* 输出端口列表 */}
              {node.outputs.map((out) => {
                const isConn = connections.some((c) => c.fromNodeId === node.id && c.fromPort === out.id);

                return (
                  <div key={out.id} className="relative flex items-center justify-end h-8 pr-1 mt-1">
                    <span className="text-xs font-medium text-neutral-400 mr-2">{out.label}</span>
                    <Handle
                      id={out.id}
                      type="source"
                      port={out.type}
                      theme={portThemes[out.type] || DEFAULT_PORT_THEMES[out.type]}
                      isConnected={isConn}
                      onPointerDown={(e) => handleSourcePointerDown(e, node.id, out.id, out.type)}
                    />
                  </div>
                );
              })}

              {/* 聚合节点底部状态栏 */}
              {isProcessingNode && (
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2 text-xs">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      connections.filter((c) => c.toNodeId === node.id).length >= 3
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : 'bg-neutral-600'
                    }`}
                  />
                  <span
                    className={`transition-colors duration-300 ${
                      connections.filter((c) => c.toNodeId === node.id).length >= 3
                        ? 'text-neutral-200 font-medium'
                        : 'text-neutral-500'
                    }`}
                  >
                    {connections.filter((c) => c.toNodeId === node.id).length >= 3
                      ? 'All inputs ready'
                      : 'Awaiting inputs'}
                  </span>
                </div>
              )}
            </NodeCard>
          );
        })}
      </div>

      {/* 3. 添加节点弹窗菜单 */}
      <NodeMenuModal
        isOpen={menuModal.isOpen}
        position={menuModal.clientPos}
        onClose={() => setMenuModal((m) => ({ ...m, isOpen: false }))}
        onSelectTemplate={handleAddNodeFromTemplate}
      />

      {/* 4. 右下角视口控制器挂件 (Pan & Zoom Widget) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 bg-[rgba(20,21,26,0.88)] border border-white/10 px-2.5 py-1.5 rounded-full backdrop-blur-xl shadow-xl text-neutral-300">
        <button
          onClick={() =>
            setViewport((v) => ({ ...v, zoom: Math.min(v.zoom * 1.15, 2.4) }))
          }
          className="p-1 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="放大视口"
        >
          <ZoomIn size={14} />
        </button>
        <span
          onClick={() => setViewport({ x: 40, y: 30, zoom: 1 })}
          className="font-mono text-xs px-1 cursor-pointer hover:text-amber-400 transition-colors"
          title="点击复位 100%"
        >
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          onClick={() =>
            setViewport((v) => ({ ...v, zoom: Math.max(v.zoom * 0.85, 0.35) }))
          }
          className="p-1 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="缩小视口"
        >
          <ZoomOut size={14} />
        </button>
        <div className="w-px h-3.5 bg-white/15 mx-0.5" />
        <button
          onClick={() => setViewport({ x: 40, y: 30, zoom: 1 })}
          className="p-1 hover:text-white hover:bg-white/10 rounded-full transition-all"
          title="居中重置"
        >
          <Maximize2 size={13} />
        </button>
        <div className="w-px h-3.5 bg-white/15 mx-0.5" />
        <button
          onClick={() => {
            const stage = stageRef.current;
            if (!stage) return;
            const sRect = stage.getBoundingClientRect();
            setMenuModal({
              isOpen: true,
              clientPos: { x: sRect.width / 2 - 150, y: sRect.height / 2 - 120 },
              worldPos: screenToWorld(sRect.width / 2, sRect.height / 2),
            });
          }}
          className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-full text-xs font-medium transition-all"
          title="添加新节点 (快捷方式)"
        >
          <Plus size={13} />
          <span>添加节点</span>
        </button>
      </div>
    </div>
  );
};
