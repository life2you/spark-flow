import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Position,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ElectricEdge } from '../react-flow/ElectricEdge';
import { SparkFlowHandle } from '../react-flow/SparkHandle';
import { BorderBeamCard } from '../react-flow/BorderBeamCard';
import { Sparkles, Dices, Sliders, Cpu } from 'lucide-react';

const edgeTypes = {
  electric: ElectricEdge,
};

// 自定义节点 1: Prompt
const PromptNode = ({ data }: { data: { text: string } }) => {
  return (
    <BorderBeamCard title="Prompt" icon={<Sparkles size={14} className="text-amber-400" />}>
      <div className="bg-[rgba(13,14,17,0.85)] border border-[rgba(255,255,255,0.05)] rounded-xl p-2.5 text-xs text-neutral-300 font-sans mb-2">
        {data.text}
      </div>
      <div className="relative flex items-center justify-end h-6 pr-1">
        <span className="text-[11px] font-medium text-neutral-400 mr-2">conditioning</span>
        <SparkFlowHandle
          type="source"
          position={Position.Right}
          id="out-cond"
          color="#f59e0b"
          glow="rgba(245, 158, 11, 0.65)"
        />
      </div>
    </BorderBeamCard>
  );
};

// 自定义节点 2: Noise
const NoiseNode = ({ data }: { data: { seed: string } }) => {
  return (
    <BorderBeamCard title="Random noise" icon={<Dices size={14} className="text-pink-400" />}>
      <div className="text-xs font-mono text-neutral-400 py-1">{data.seed}</div>
      <div className="relative flex items-center justify-end h-6 pr-1 mt-1">
        <span className="text-[11px] font-medium text-neutral-400 mr-2">noise</span>
        <SparkFlowHandle
          type="source"
          position={Position.Right}
          id="out-noise"
          color="#ec4899"
          glow="rgba(236, 72, 153, 0.65)"
        />
      </div>
    </BorderBeamCard>
  );
};

// 自定义节点 3: Sampler
const SamplerNode = ({ data }: { data: { params: string } }) => {
  return (
    <BorderBeamCard title="Sampler" icon={<Sliders size={14} className="text-purple-400" />}>
      <div className="text-xs font-mono text-neutral-400 py-1">{data.params}</div>
      <div className="relative flex items-center justify-end h-6 pr-1 mt-1">
        <span className="text-[11px] font-medium text-neutral-400 mr-2">sampler</span>
        <SparkFlowHandle
          type="source"
          position={Position.Right}
          id="out-sampler"
          color="#a855f7"
          glow="rgba(168, 85, 247, 0.65)"
        />
      </div>
    </BorderBeamCard>
  );
};

// 自定义节点 4: Processing (核心聚合卡片)
const ProcessingNode = () => {
  return (
    <BorderBeamCard
      title="Processing"
      icon={<Cpu size={14} className="text-emerald-400" />}
      active={true}
      beamColor="#f59e0b"
      className="w-[260px]"
    >
      <div className="space-y-2 py-1">
        <div className="relative flex items-center justify-between h-7 pl-2">
          <SparkFlowHandle
            type="target"
            position={Position.Left}
            id="in-cond"
            color="#f59e0b"
            glow="rgba(245, 158, 11, 0.65)"
          />
          <span className="text-xs font-medium text-neutral-300">conditioning</span>
        </div>
        <div className="relative flex items-center justify-between h-7 pl-2">
          <SparkFlowHandle
            type="target"
            position={Position.Left}
            id="in-noise"
            color="#ec4899"
            glow="rgba(236, 72, 153, 0.65)"
          />
          <span className="text-xs font-medium text-neutral-300">noise</span>
        </div>
        <div className="relative flex items-center justify-between h-7 pl-2">
          <SparkFlowHandle
            type="target"
            position={Position.Left}
            id="in-sampler"
            color="#a855f7"
            glow="rgba(168, 85, 247, 0.65)"
          />
          <span className="text-xs font-medium text-neutral-300">sampler</span>
        </div>
      </div>
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 text-[11px] text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
        <span>Ready for inference</span>
      </div>
    </BorderBeamCard>
  );
};

const nodeTypes = {
  promptNode: PromptNode,
  noiseNode: NoiseNode,
  samplerNode: SamplerNode,
  processingNode: ProcessingNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'promptNode',
    position: { x: 80, y: 100 },
    data: { text: 'A quiet world, in vivid color...' },
  },
  {
    id: '2',
    type: 'noiseNode',
    position: { x: 50, y: 320 },
    data: { seed: '432512' },
  },
  {
    id: '3',
    type: 'samplerNode',
    position: { x: 180, y: 460 },
    data: { params: 'euler · 24 steps' },
  },
  {
    id: '4',
    type: 'processingNode',
    position: { x: 620, y: 120 },
    data: {},
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    sourceHandle: 'out-cond',
    targetHandle: 'in-cond',
    type: 'electric',
    data: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)' },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    sourceHandle: 'out-noise',
    targetHandle: 'in-noise',
    type: 'electric',
    data: { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.65)' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    sourceHandle: 'out-sampler',
    targetHandle: 'in-sampler',
    type: 'electric',
    data: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.65)' },
  },
];

export const ReactFlowDemo: React.FC = () => {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'electric',
            data: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.65)' },
          },
          eds
        )
      ),
    []
  );

  return (
    <div className="w-full h-screen bg-[#0c0d10]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="rgba(255,255,255,0.08)" gap={24} />
        <Controls className="!bg-[rgba(20,21,26,0.85)] !border-white/10 !fill-white" />
      </ReactFlow>
    </div>
  );
};
