export type PortType = 'conditioning' | 'noise' | 'sampler' | string;

export interface PortTheme {
  color: string;
  glow: string;
  name: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Connection {
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
  color: string;
  glow: string;
}

export interface DraggingState {
  fromNodeId: string;
  fromPort: string;
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
