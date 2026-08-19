// SRC/engine/types/MapBlockTypes.ts
// Type definitions for map block data structures

export interface BlockPosition {
  x: number;
  y: number;
  z: number;
}

export interface MapBlock {
  id: string;
  position: { x: number; y: number; z: number }; // world-space center
  size: { x: number; y: number; z: number };
  type?: string;
}

export interface BlockTriangleRange {
  start: number;
  count: number;
}

export interface ModelBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}
