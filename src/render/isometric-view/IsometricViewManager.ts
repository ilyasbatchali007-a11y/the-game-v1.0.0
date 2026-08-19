/**
 * Manages isometric view transformation parameters
 * Handles camera angle, scale, and offset for isometric rendering
 */

export interface IsometricViewState {
  angleRadians: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Creates default isometric view state (45° angle, 0.5 Y scale)
 */
export function createDefaultIsometricView(): IsometricViewState {
  return {
    angleRadians: Math.PI / 4,  // 45 degrees
    scaleY: 0.5,                // Y compression for isometric projection
    offsetX: 0,
    offsetY: 0,
  };
}

/**
 * Updates isometric view parameters
 */
export function setIsometricView(
  state: IsometricViewState,
  angleRadians: number,
  scaleY: number
): void {
  state.angleRadians = angleRadians;
  state.scaleY = scaleY;
}

/**
 * Updates camera offset for scrolling
 */
export function setCameraOffset(
  state: IsometricViewState,
  offsetX: number,
  offsetY: number
): void {
  state.offsetX = offsetX;
  state.offsetY = offsetY;
}
