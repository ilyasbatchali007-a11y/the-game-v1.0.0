// SRC/engine/ModelBoundsCalculator.ts
// Calculates bounding boxes and spatial bounds for 3D models

import { ModelBounds } from './types/MapBlockTypes';

/**
 * Calculate the bounding box of a 3D model from its vertex data
 */
export function calculateModelBounds(vertices: Float32Array | number[]): ModelBounds | null {
  // Guard clause: Check for empty or uninitialized mesh
  if (!vertices || vertices.length === 0) {
    console.error('[ModelBoundsCalculator] Cannot calculate bounds on empty vertex array.');
    return null;
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }

  return { minX, maxX, minY, maxY, minZ, maxZ };
}

/**
 * Get the center point of a model's bounding box
 */
export function getModelCenter(bounds: ModelBounds): { x: number, y: number, z: number } {
  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
    z: (bounds.minZ + bounds.maxZ) / 2
  };
}

/**
 * Get the dimensions of a model's bounding box
 */
export function getModelDimensions(bounds: ModelBounds): { width: number, height: number, depth: number } {
  return {
    width: bounds.maxX - bounds.minX,
    height: bounds.maxY - bounds.minY,
    depth: bounds.maxZ - bounds.minZ
  };
}

/**
 * Get the maximum dimension of a model (for uniform scaling calculations)
 */
export function getMaxDimension(bounds: ModelBounds): number {
  const dims = getModelDimensions(bounds);
  return Math.max(dims.width, Math.max(dims.height, dims.depth));
}

/**
 * Calculate the lowest point of a model (for positioning markers at ground level)
 */
export function getLowestPoint(bounds: ModelBounds): { x: number, y: number, z: number } {
  const center = getModelCenter(bounds);
  return {
    x: center.x,
    y: bounds.minY,
    z: center.z
  };
}

/**
 * Log model bounds to console for debugging
 */
export function logModelBounds(bounds: ModelBounds | null, context: string = 'Model'): void {
  if (!bounds) {
    console.log(`[ModelBoundsCalculator] ${context}: No bounds available`);
    return;
  }
  
  const center = getModelCenter(bounds);
  const dims = getModelDimensions(bounds);
  
  console.log(
    `[ModelBoundsCalculator] ${context} bounds: ` +
    `Y[${bounds.minY.toFixed(2)}, ${bounds.maxY.toFixed(2)}], ` +
    `X[${bounds.minX.toFixed(2)}, ${bounds.maxX.toFixed(2)}], ` +
    `Z[${bounds.minZ.toFixed(2)}, ${bounds.maxZ.toFixed(2)}]`
  );
  console.log(
    `[ModelBoundsCalculator] ${context} center: ` +
    `(${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`
  );
  console.log(
    `[ModelBoundsCalculator] ${context} dimensions: ` +
    `W=${dims.width.toFixed(2)}, H=${dims.height.toFixed(2)}, D=${dims.depth.toFixed(2)}`
  );
}
