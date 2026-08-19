// SRC/engine/dungeon-generator/DungeonMeshFuser.ts
// Merges multiple cube meshes into a single fused mesh with triangle range tracking

import { MapBlock } from '../MapWindow3DRenderer';
import { createCubeMesh } from './CubeMeshBuilder';

/**
 * Simple CSG union implementation for merging cube meshes
 * Merges vertices and tracks triangle ranges per block for fog of war
 */
export function fuseBlocksIntoMesh(blocks: MapBlock[]): { 
  vertices: Float32Array; 
  indices: Uint16Array; 
  blockTriangleRanges: { start: number; count: number }[] 
} {
  const allVertices: number[] = [];
  const allIndices: number[] = [];
  const blockTriangleRanges: { start: number; count: number }[] = [];
  let vertexOffset = 0;

  // Merge all block meshes
  for (let blockIdx = 0; blockIdx < blocks.length; blockIdx++) {
    const block = blocks[blockIdx];
    const { vertices, indices } = createCubeMesh(
      block.position.x,
      block.position.y,
      block.position.z,
      block.size.x,
      block.size.y,
      block.size.z
    );

    // Record the triangle range for this block (each block has 12 triangles = 36 indices)
    blockTriangleRanges.push({
      start: allIndices.length,
      count: indices.length
    });

    // Add vertices
    allVertices.push(...vertices);

    // Add indices with offset
    for (const idx of indices) {
      allIndices.push(idx + vertexOffset);
    }

    vertexOffset += vertices.length / 3;
  }

  console.log(`[DungeonMeshFuser] Fused ${blocks.length} blocks into mesh with ${allVertices.length / 3} vertices and ${allIndices.length} indices`);

  return {
    vertices: new Float32Array(allVertices),
    indices: new Uint16Array(allIndices),
    blockTriangleRanges
  };
}
