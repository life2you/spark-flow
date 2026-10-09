import React from 'react';
import {
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

export interface ElectricEdgeData {
  color?: string;
  glow?: string;
  isActive?: boolean;
}

/**
 * 专门适配 React Flow (@xyflow/react) 的高能发光电弧连线
 *
 * @example
 * ```tsx
 * const edgeTypes = { electric: ElectricEdge };
 * <ReactFlow edgeTypes={edgeTypes} ... />
 * ```
 */
export const ElectricEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const edgeData = (data as ElectricEdgeData) || {};
  const color = edgeData.color || style.stroke || '#f59e0b';
  const glow = edgeData.glow || 'rgba(245, 158, 11, 0.65)';

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* 底层柔和霓虹辉光 */}
      <path
        d={edgePath}
        fill="none"
        stroke={glow}
        strokeWidth={7}
        strokeLinecap="round"
        style={{
          filter: 'blur(4px)',
          opacity: 0.85,
          pointerEvents: 'none',
        }}
      />

      {/* 核心高能连线 */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: color,
          strokeWidth: 3,
          strokeLinecap: 'round',
        }}
      />
    </>
  );
};
