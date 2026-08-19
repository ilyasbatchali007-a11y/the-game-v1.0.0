// SRC/engine/CubeBufferFactory.ts
// Creates WebGL vertex and index buffers for cube geometry

/**
 * Generate cube vertex data with anisotropic dimensions
 */
export function createCubeVertices(
  halfX: number,
  halfY: number,
  halfZ: number
): Float32Array {
  return new Float32Array([
    // Front face
    -halfX, -halfY,  halfZ,
     halfX, -halfY,  halfZ,
     halfX,  halfY,  halfZ,
    -halfX,  halfY,  halfZ,
    // Back face
    -halfX, -halfY, -halfZ,
    -halfX,  halfY, -halfZ,
     halfX,  halfY, -halfZ,
     halfX, -halfY, -halfZ,
  ]);
}

/**
 * Generate cube index data (12 triangles = 36 indices)
 */
export function createCubeIndices(): Uint16Array {
  return new Uint16Array([
    // Front
    0, 1, 2, 0, 2, 3,
    // Back
    4, 5, 6, 4, 6, 7,
    // Top
    3, 2, 6, 3, 6, 5,
    // Bottom
    0, 7, 1, 0, 4, 7,
    // Right
    1, 7, 6, 1, 6, 2,
    // Left
    0, 5, 4, 0, 3, 5,
  ]);
}

/**
 * Cube geometry data ready for buffer creation
 */
export interface CubeGeometry {
  vertices: Float32Array;
  indices: Uint16Array;
  vertexCount: number;
  indexCount: number;
}

/**
 * Create complete cube geometry with specified dimensions
 */
export function createCubeGeometry(
  halfX: number,
  halfY: number,
  halfZ: number
): CubeGeometry {
  const vertices = createCubeVertices(halfX, halfY, halfZ);
  const indices = createCubeIndices();
  
  return {
    vertices,
    indices,
    vertexCount: 8,
    indexCount: 36
  };
}

/**
 * Default unit cube (0.5 x 0.5 x 0.5)
 */
export function createUnitCubeGeometry(): CubeGeometry {
  return createCubeGeometry(0.5, 0.5, 0.5);
}
