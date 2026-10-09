export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type PortType = 'conditioning' | 'noise' | 'sampler' | 'latent' | 'image' | string;

export interface PortTheme {
  color: string;
  glow: string;
  name: string;
}

export interface PortDefinition {
  id: string;
  label: string;
  type: PortType;
}

export interface FlowNode {
  id: string;
  type: string;
  title: string;
  iconType: string;
  position: Point;
  width?: number;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  data?: Record<string, unknown>;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
  type: PortType;
  color: string;
  glow: string;
}

export interface DraggingState {
  fromNodeId: string;
  fromPort: string;
  fromPortType: PortType;
  fromPoint: Point;
  currentPoint: Point;
  theme: PortTheme;
  snappedTarget: {
    nodeId: string;
    port: string;
    point: Point;
  } | null;
}

export interface FlowConfig {
  snapDistance: number;
  jitterAmplitude: number;
  enableAudio: boolean;
  enableEmberParticles: boolean;
  borderBeamDuration: number;
}
