// SRC/engine/map-window-renderer/MatrixCalculator.ts
// Dedicated matrix math calculations for 3D rendering

import { FocusPoint } from './MapWindowTypes';

export function createMVPMatrix(
  rotationY: number,
  rotationX: number,
  aspect: number,
  zoom: number,
  focusPoint: FocusPoint
): Float32Array {
  const fov = 45 * Math.PI / 180;
  const zNear = 0.1;
  const zFar = 100.0;
  
  // Projection matrix
  const f = 1.0 / Math.tan(fov / 2);
  const projectionMatrix = new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (zFar + zNear) / (zNear - zFar), -1,
    0, 0, (2 * zFar * zNear) / (zNear - zFar), 0
  ]);
  
  // View matrix (camera transform)
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  
  const viewMatrix = new Float32Array([
    cosY, 0, -sinY, 0,
    sinX * sinY, cosX, sinX * cosY, 0,
    cosX * sinY, -sinX, cosX * cosY, 0,
    0, 0, zoom, 1
  ]);
  
  // Translation matrix to focus point
  const translationMatrix = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    -focusPoint.x, -focusPoint.y, -focusPoint.z, 1
  ]);
  
  // Multiply matrices: MVP = Projection * View * Translation
  return multiplyMatrices(multiplyMatrices(projectionMatrix, viewMatrix), translationMatrix);
}

export function createNormalMatrix(rotationY: number, rotationX: number): Float32Array {
  const cosX = Math.cos(rotationX);
  const sinX = Math.sin(rotationX);
  const cosY = Math.cos(rotationY);
  const sinY = Math.sin(rotationY);
  
  return new Float32Array([
    cosY, 0, -sinY, 0,
    sinX * sinY, cosX, sinX * cosY, 0,
    cosX * sinY, -sinX, cosX * cosY, 0,
    0, 0, 0, 1
  ]);
}

export function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[row * 4 + k] * b[k * 4 + col];
      }
      result[row * 4 + col] = sum;
    }
  }
  return result;
}

export function hasExtremeValues(matrix: Float32Array): boolean {
  for (let i = 0; i < 16; i++) {
    if (!isFinite(matrix[i]) || Math.abs(matrix[i]) > 1e10) {
      return true;
    }
  }
  return false;
}
