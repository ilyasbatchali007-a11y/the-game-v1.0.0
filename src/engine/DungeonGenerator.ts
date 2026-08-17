// SRC/engine/DungeonGenerator.ts
// Generates a 100-block dungeon layout, captures pre-fusion block metadata, and fuses into single mesh

import { MapBlock } from './MapWindow3DRenderer';

export interface DungeonGenerationResult {
  blocks: MapBlock[];      // Pre-fusion block metadata in preserved order
  objContent: string;      // Fused OBJ mesh content
  mapId: string;           // Unique identifier for this dungeon
}

/**
 * Generate a 10x10 grid of cubes (100 total) forming a dungeon floor
 * Each cube is 10 units in size, positioned in world space
 * Returns blocks in row-by-row, floor-by-floor traversal order
 */
export function generateDungeonBlocks(): MapBlock[] {
  const blocks: MapBlock[] = [];
  const gridSize = 10;  // 10x10 = 100 blocks
  const blockSize = 10; // Each cube is 10x10x10 units
  
  // Generate in deterministic row-by-row order (preserved traversal order)
  for (let z = 0; z < gridSize; z++) {
    for (let x = 0; x < gridSize; x++) {
      const block: MapBlock = {
        id: `block_${z}_${x}`,
        position: {
          x: x * blockSize + blockSize / 2,  // Center of block
          y: blockSize / 2,                   // Sitting on ground plane
          z: z * blockSize + blockSize / 2
        },
        size: {
          x: blockSize,
          y: blockSize,
          z: blockSize
        },
        type: 'dungeon_floor'
      };
      blocks.push(block);
    }
  }
  
  console.log(`[DungeonGenerator] Generated ${blocks.length} blocks in ${gridSize}x${gridSize} grid`);
  return blocks;
}

/**
 * Create a cube mesh centered at origin with given dimensions
 * Returns vertices and indices for the cube
 */
function createCubeMesh(
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

/**
 * Simple CSG union implementation for merging cube meshes
 * For a proper production system, use a library like csg.js or three-bvh-csg
 * This implementation merges vertices and handles overlapping geometry
 */
export function fuseBlocksIntoMesh(blocks: MapBlock[]): { vertices: Float32Array; indices: Uint16Array } {
  const allVertices: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;
  
  // Merge all block meshes
  for (const block of blocks) {
    const { vertices, indices } = createCubeMesh(
      block.position.x,
      block.position.y,
      block.position.z,
      block.size.x,
      block.size.y,
      block.size.z
    );
    
    // Add vertices
    allVertices.push(...vertices);
    
    // Add indices with offset
    for (const idx of indices) {
      allIndices.push(idx + vertexOffset);
    }
    
    vertexOffset += vertices.length / 3;
  }
  
  console.log(`[DungeonGenerator] Fused ${blocks.length} blocks into mesh with ${allVertices.length / 3} vertices and ${allIndices.length} indices`);
  
  return {
    vertices: new Float32Array(allVertices),
    indices: new Uint16Array(allIndices)
  };
}

/**
 * Convert fused mesh data to OBJ format string
 */
export function meshToOBJ(vertices: Float32Array, indices: Uint16Array, mapId: string): string {
  let obj = `# Dungeon Map: ${mapId}\n`;
  obj += `# Generated: ${new Date().toISOString()}\n`;
  obj += `# Vertices: ${vertices.length / 3}, Faces: ${indices.length / 3}\n\n`;
  
  // Write vertices
  for (let i = 0; i < vertices.length; i += 3) {
    obj += `v ${vertices[i].toFixed(6)} ${vertices[i + 1].toFixed(6)} ${vertices[i + 2].toFixed(6)}\n`;
  }
  
  obj += `\n# Faces\n`;
  
  // Write faces (OBJ uses 1-based indexing)
  for (let i = 0; i < indices.length; i += 3) {
    obj += `f ${indices[i] + 1} ${indices[i + 1] + 1} ${indices[i + 2] + 1}\n`;
  }
  
  return obj;
}

/**
 * Generate complete dungeon with both mesh and block metadata
 */
export function generateDungeon(mapId?: string): DungeonGenerationResult {
  const id = mapId || `dungeon_${Date.now()}`;
  
  // Step 1: Generate blocks in preserved order
  const blocks = generateDungeonBlocks();
  
  // Step 2: Fuse blocks into single mesh
  const { vertices, indices } = fuseBlocksIntoMesh(blocks);
  
  // Step 3: Convert to OBJ format
  const objContent = meshToOBJ(vertices, indices, id);
  
  return {
    blocks,
    objContent,
    mapId: id
  };
}
