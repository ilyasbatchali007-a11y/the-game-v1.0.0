// SRC/engine/dungeon-generator/CubeMeshBuilder.ts
// Creates cube mesh geometry centered at given position with specified dimensions

/**
 * Create a cube mesh centered at origin with given dimensions
 * Returns vertices and indices for the cube
 */
export function createCubeMesh(
  centerX: number,
  centerY: number,
  centerZ: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number
): { vertices: number[]; indices: number[] } {
  const hx = sizeX / 2;
  const hy = sizeY / 2;
  const hz = sizeZ / 2;

  // 8 vertices of the cube
  const vertices = [
    // Front face (counter-clockwise when viewed from outside)
    centerX - hx, centerY - hy, centerZ + hz,  // 0
    centerX + hx, centerY - hy, centerZ + hz,  // 1
    centerX + hx, centerY + hy, centerZ + hz,  // 2
    centerX - hx, centerY + hy, centerZ + hz,  // 3
    // Back face
    centerX - hx, centerY - hy, centerZ - hz,  // 4
    centerX - hx, centerY + hy, centerZ - hz,  // 5
    centerX + hx, centerY + hy, centerZ - hz,  // 6
    centerX + hx, centerY - hy, centerZ - hz,  // 7
  ];

  // 12 triangles (36 indices) - all faces counter-clockwise from outside
  const indices = [
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
  ];

  return { vertices, indices };
}
