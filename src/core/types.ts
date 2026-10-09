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

export interface SparkOptions {
  color: string;
  glow: string;
  jitterAmplitude?: number;
  subArcs?: boolean;
  embers?: boolean;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  type: PortType;
  color?: string;
  glow?: string;
}

export interface FlowConfig {
  snapDistance: number;
  jitterAmplitude: number;
  enableAudio: boolean;
  enableEmbers: boolean;
  borderBeamDuration: number;
}
