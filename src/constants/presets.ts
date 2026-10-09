import type { FlowNode, PortTheme } from '../types';

export const DEFAULT_PORT_THEMES: Record<string, PortTheme> = {
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
  latent: {
    color: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.65)',
    name: 'latent',
  },
  image: {
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.65)',
    name: 'image',
  },
};

export const INITIAL_NODES: FlowNode[] = [
  {
    id: 'node-prompt',
    type: 'prompt',
    title: 'Prompt',
    iconType: 'sparkles',
    position: { x: 100, y: 120 },
    width: 290,
    inputs: [],
    outputs: [{ id: 'out-conditioning', label: 'conditioning', type: 'conditioning' }],
    data: {
      text: 'A quiet world,\nin vivid color. Soft light, subtle\ntextures, a little unexpected magic.',
    },
  },
  {
    id: 'node-noise',
    type: 'noise',
    title: 'Random noise',
    iconType: 'dice',
    position: { x: 50, y: 380 },
    width: 230,
    inputs: [],
    outputs: [{ id: 'out-noise', label: 'noise', type: 'noise' }],
    data: { seed: '432512' },
  },
  {
    id: 'node-sampler',
    type: 'sampler',
    title: 'Sampler',
    iconType: 'sliders',
    position: { x: 190, y: 520 },
    width: 230,
    inputs: [],
    outputs: [{ id: 'out-sampler', label: 'sampler', type: 'sampler' }],
    data: { params: 'euler · 24 steps' },
  },
  {
    id: 'node-processing',
    type: 'processing',
    title: 'Processing',
    iconType: 'cpu',
    position: { x: 680, y: 140 },
    width: 290,
    inputs: [
      { id: 'in-conditioning', label: 'conditioning', type: 'conditioning' },
      { id: 'in-noise', label: 'noise', type: 'noise' },
      { id: 'in-sampler', label: 'sampler', type: 'sampler' },
    ],
    outputs: [{ id: 'out-latent', label: 'latent', type: 'latent' }],
  },
];

export const NODE_TEMPLATES: {
  type: string;
  title: string;
  iconType: string;
  description: string;
  inputs: { id: string; label: string; type: string }[];
  outputs: { id: string; label: string; type: string }[];
  width: number;
}[] = [
  {
    type: 'prompt',
    title: 'Prompt',
    iconType: 'sparkles',
    description: '文本正向提示词向量编码',
    inputs: [],
    outputs: [{ id: 'out-conditioning', label: 'conditioning', type: 'conditioning' }],
    width: 290,
  },
  {
    type: 'noise',
    title: 'Random noise',
    iconType: 'dice',
    description: '随机高斯噪声种子发生器',
    inputs: [],
    outputs: [{ id: 'out-noise', label: 'noise', type: 'noise' }],
    width: 230,
  },
  {
    type: 'sampler',
    title: 'Sampler Settings',
    iconType: 'sliders',
    description: '步数与去噪调度算法配置',
    inputs: [],
    outputs: [{ id: 'out-sampler', label: 'sampler', type: 'sampler' }],
    width: 230,
  },
  {
    type: 'vae-decode',
    title: 'VAE Decode',
    iconType: 'layers',
    description: '潜空间图像向量转像素RGB',
    inputs: [{ id: 'in-latent', label: 'latent', type: 'latent' }],
    outputs: [{ id: 'out-image', label: 'image', type: 'image' }],
    width: 240,
  },
  {
    type: 'image-preview',
    title: 'Image Preview',
    iconType: 'image',
    description: 'AI 最终生成结果图监视器',
    inputs: [{ id: 'in-image', label: 'image', type: 'image' }],
    outputs: [],
    width: 280,
  },
];
