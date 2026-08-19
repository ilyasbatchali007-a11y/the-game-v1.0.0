// SRC/engine/map-renderer/MapRendererTypes.ts
// Shared type definitions for map rendering subsystem

export interface RenderState {
  rotationX: number;
  rotationY: number;
  zoom: number;
  focusPoint: { x: number; y: number; z: number };
}

export interface BlockVisibilityState {
  visibility: boolean[];
  revealedCount: number;
}

export interface XRayMarkerState {
  position: { x: number; y: number; z: number };
  color: [number, number, number, number];
  visible: boolean;
  blockSizeVector: { x: number; y: number; z: number };
}

export const RENDER_CONSTANTS = {
  MIN_ZOOM: -20.0,
  MAX_ZOOM: 5.0,
  DEFAULT_ROTATION_X: 0.3,
  DEFAULT_ROTATION_Y: 0,
  DEFAULT_ZOOM: -1.80,
  GRID_MOVE_INTERVAL: 1000,
  XRAY_DEFAULT_ALPHA: 0.8
} as const;
