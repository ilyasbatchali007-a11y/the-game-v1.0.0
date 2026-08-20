// SRC/engine/map-window-renderer/MapWindowTypes.ts
// Shared type definitions for map window rendering

export interface FocusPoint {
  x: number;
  y: number;
  z: number;
}

export interface BlockTriangleRange {
  start: number;
  count: number;
}

export interface RenderState {
  rotationX: number;
  rotationY: number;
  zoom: number;
  aspect: number;
}
