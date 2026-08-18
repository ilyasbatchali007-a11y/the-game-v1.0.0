// SRC/engine/DungeonGenerator.ts
// Generates a 100-block dungeon layout using multi-vine branching algorithm, captures pre-fusion block metadata, and fuses into single mesh

import { MapBlock } from './MapWindow3DRenderer';

export interface DungeonShapeConfig {
  shape: 'multiVine';
  vineCount: number;      // 2–6
  branchChance: number;   // 0–1
  turnStrength: number;   // 0–1
  seed: number;
  totalBlocks: number;    // 100
}

export const DEFAULT_DUNGEON_CONFIG: DungeonShapeConfig = {
  shape: 'multiVine',
  vineCount: 4,
  branchChance: 0.03,
  turnStrength: 0.60,
  seed: 9531,
  totalBlocks: 100,
};

export interface DungeonGenerationResult {
  blocks: MapBlock[];      // Pre-fusion block metadata in preserved order
  objContent: string;      // Fused OBJ mesh content
  mapId: string;           // Unique identifier for this dungeon
}

/**
 * Seeded PRNG (mulberry32) - deterministic random number generator
 * Same seed always produces the same sequence of random numbers
 */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a multi-vine branching dungeon layout
 * Starts from a core block, then grows multiple vines with random walks and branching
 * Returns exactly totalBlocks MapBlock entries in generation order (core first, then vines)
 */
export function generateDungeonBlocks(config: DungeonShapeConfig = DEFAULT_DUNGEON_CONFIG): MapBlock[] {
  const rng = mulberry32(config.seed);
  const totalBlocks = config.totalBlocks;
  const blockSize = 10;
  
  // Track occupied grid cells to prevent overlaps
  const occupied = new Set<string>();
  const blocks: MapBlock[] = [];
  
  // Helper to create a block at grid position
  function createBlock(gx: number, gy: number, gz: number): MapBlock | null {
    const key = `${gx},${gy},${gz}`;
    if (occupied.has(key)) return null;
    
    occupied.add(key);
    const block: MapBlock = {
      id: `block_${blocks.length}`,
      position: {
        x: gx * blockSize + blockSize / 2,
        y: gy * blockSize + blockSize / 2,
        z: gz * blockSize + blockSize / 2
      },
      size: { x: blockSize, y: blockSize, z: blockSize },
      type: 'dungeon_vine'
    };
    blocks.push(block);
    return block;
  }
  
  // Start with core block at origin
  createBlock(0, 0, 0);
  
  // Define 6 axis directions
  const directions = [
    { x: 1, y: 0, z: 0 },   // +x
    { x: -1, y: 0, z: 0 },  // -x
    { x: 0, y: 1, z: 0 },   // +y
    { x: 0, y: -1, z: 0 },  // -y
    { x: 0, y: 0, z: 1 },   // +z
    { x: 0, y: 0, z: -1 }   // -z
  ];
  
  // Shuffle directions using seeded RNG
  function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  
  // Select vineCount distinct starting directions
  const shuffledDirs = shuffleArray(directions);
  const startDirections = shuffledDirs.slice(0, Math.min(config.vineCount, 6));
  
  // Calculate budget per vine (excluding core which is already placed)
  const remainingBlocks = totalBlocks - 1;
  const baseBudgetPerVine = Math.floor(remainingBlocks / startDirections.length);
  let blocksPlaced = 1; // Core is already placed
  
  // Vine growth state
  interface VineSegment {
    gx: number;
    gy: number;
    gz: number;
    dir: { x: number; y: number; z: number };
    budget: number;
  }
  
  // Queue of active vine segments to grow
  const vineQueue: VineSegment[] = [];
  
  // Initialize starting vines
  for (const dir of startDirections) {
    vineQueue.push({
      gx: 0,
      gy: 0,
      gz: 0,
      dir,
      budget: baseBudgetPerVine
    });
  }
  
  // Grow vines using random walk
  while (vineQueue.length > 0 && blocksPlaced < totalBlocks) {
    const segment = vineQueue.shift()!;
    
    if (segment.budget <= 0) continue;
    
    let { gx, gy, gz, dir, budget } = segment;
    let stepsTaken = 0;
    const maxSteps = budget;
    
    while (stepsTaken < maxSteps && blocksPlaced < totalBlocks) {
      // Try to place block in current direction
      let nx = gx + dir.x;
      let ny = gy + dir.y;
      let nz = gz + dir.z;
      
      // Check if position is occupied, try fallback directions if so
      let placed = false;
      const testDirs = [dir, ...shuffleArray([...directions])];
      
      for (const testDir of testDirs) {
        nx = gx + testDir.x;
        ny = gy + testDir.y;
        nz = gz + testDir.z;
        
        const key = `${nx},${ny},${nz}`;
        if (!occupied.has(key)) {
          // Place block
          if (createBlock(nx, ny, nz)) {
            blocksPlaced++;
            placed = true;
            gx = nx;
            gy = ny;
            gz = nz;
            
            // Chance to spawn a branch tendril
            if (rng() < config.branchChance && blocksPlaced < totalBlocks) {
              // Pick a random direction different from current
              const availableDirs = directions.filter(d => 
                !(d.x === dir.x && d.y === dir.y && d.z === dir.z)
              );
              if (availableDirs.length > 0) {
                const branchDir = availableDirs[Math.floor(rng() * availableDirs.length)];
                const remainingBudget = Math.max(1, Math.floor((maxSteps - stepsTaken) * 0.5));
                vineQueue.push({
                  gx, gy, gz,
                  dir: branchDir,
                  budget: remainingBudget
                });
              }
            }
            
            break;
          }
        }
      }
      
      if (!placed) {
        // Couldn't place, try to change direction
        if (rng() < config.turnStrength) {
          const newDirs = directions.filter(d => 
            !(d.x === dir.x && d.y === dir.y && d.z === dir.z)
          );
          if (newDirs.length > 0) {
            dir = newDirs[Math.floor(rng() * newDirs.length)];
          }
        }
        // If still can't place after several attempts, stop this vine segment
        if (!placed) {
          break;
        }
      } else {
        // Successfully placed, chance to turn
        if (rng() < config.turnStrength) {
          const newDirs = directions.filter(d => 
            !(d.x === dir.x && d.y === dir.y && d.z === dir.z)
          );
          if (newDirs.length > 0) {
            dir = newDirs[Math.floor(rng() * newDirs.length)];
          }
        }
      }
      
      stepsTaken++;
    }
  }
  
  // Ensure exactly totalBlocks by truncating if we somehow exceeded
  while (blocks.length > totalBlocks) {
    const removed = blocks.pop()!;
    const key = `${Math.round((removed.position.x - 5) / 10)},${Math.round((removed.position.y - 5) / 10)},${Math.round((removed.position.z - 5) / 10)}`;
    occupied.delete(key);
  }
  
  console.log(`[DungeonGenerator] Generated ${blocks.length} blocks using multi-vine algorithm (seed: ${config.seed}, vines: ${config.vineCount})`);
  return blocks;
}

/**
 * Simple CSG union implementation for merging cube meshes
 * Removes hidden internal faces (faces touching other blocks) to reduce vertex count
 * This implementation merges vertices and handles overlapping geometry
 */
export function fuseBlocksIntoMesh(blocks: MapBlock[]): { vertices: Float32Array; indices: Uint16Array } {
  // Build a set of occupied grid positions for quick neighbor lookup
  const occupiedGrid = new Set<string>();
  const blockSize = 10;
  
  for (const block of blocks) {
    const gx = Math.round((block.position.x - blockSize / 2) / blockSize);
    const gy = Math.round((block.position.y - blockSize / 2) / blockSize);
    const gz = Math.round((block.position.z - blockSize / 2) / blockSize);
    occupiedGrid.add(`${gx},${gy},${gz}`);
  }
  
  const allVertices: number[] = [];
  const allIndices: number[] = [];
  let vertexOffset = 0;
  
  // Direction vectors for 6 neighbors: +x, -x, +y, -y, +z, -z
  const neighborOffsets = [
    { dx: 1, dy: 0, dz: 0 },   // +x (right face)
    { dx: -1, dy: 0, dz: 0 },  // -x (left face)
    { dx: 0, dy: 1, dz: 0 },   // +y (top face)
    { dx: 0, dy: -1, dz: 0 },  // -y (bottom face)
    { dx: 0, dy: 0, dz: 1 },   // +z (front face)
    { dx: 0, dy: 0, dz: -1 },  // -z (back face)
  ];
  
  // Merge all block meshes, but only include exposed faces
  for (const block of blocks) {
    const gx = Math.round((block.position.x - blockSize / 2) / blockSize);
    const gy = Math.round((block.position.y - blockSize / 2) / blockSize);
    const gz = Math.round((block.position.z - blockSize / 2) / blockSize);
    
    // Check which faces are exposed (not touching another block)
    const exposedFaces: boolean[] = [];
    for (const offset of neighborOffsets) {
      const neighborKey = `${gx + offset.dx},${gy + offset.dy},${gz + offset.dz}`;
      exposedFaces.push(!occupiedGrid.has(neighborKey));
    }
    
    // Create cube mesh with only exposed faces
    const { vertices, indices } = createCubeMeshWithExposedFaces(
      block.position.x,
      block.position.y,
      block.position.z,
      block.size.x,
      block.size.y,
      block.size.z,
      exposedFaces
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
 * Create a cube mesh centered at origin with given dimensions, including only exposed faces
 * exposedFaces: [right, left, top, bottom, front, back] - true if face should be included
 */
function createCubeMeshWithExposedFaces(
  centerX: number,
  centerY: number,
  centerZ: number,
  sizeX: number,
  sizeY: number,
  sizeZ: number,
  exposedFaces: boolean[]
): { vertices: number[]; indices: number[] } {
  const hx = sizeX / 2;
  const hy = sizeY / 2;
  const hz = sizeZ / 2;
  
  // 8 vertices of the cube (same as createCubeMesh)
  const vertices = [
    // Front face vertices (counter-clockwise when viewed from outside)
    centerX - hx, centerY - hy, centerZ + hz,  // 0
    centerX + hx, centerY - hy, centerZ + hz,  // 1
    centerX + hx, centerY + hy, centerZ + hz,  // 2
    centerX - hx, centerY + hy, centerZ + hz,  // 3
    // Back face vertices
    centerX - hx, centerY - hy, centerZ - hz,  // 4
    centerX - hx, centerY + hy, centerZ - hz,  // 5
    centerX + hx, centerY + hy, centerZ - hz,  // 6
    centerX + hx, centerY - hy, centerZ - hz,  // 7
  ];
  
  const indices: number[] = [];
  
  // Face definitions: [vertex indices for triangle 1, vertex indices for triangle 2]
  // Order: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
  // Vertices must be counter-clockwise when viewed from outside the cube
  const faceDefinitions = [
    // Right face (+x): vertices 7,6,2,1 (counter-clockwise when viewed from +x)
    [7, 6, 2, 7, 2, 1],
    // Left face (-x): vertices 0,5,4,3 (counter-clockwise when viewed from -x)
    [0, 5, 4, 0, 3, 5],
    // Top face (+y): vertices 3,2,6,5 (counter-clockwise when viewed from +y)
    [3, 2, 6, 3, 6, 5],
    // Bottom face (-y): vertices 0,7,1,4 (counter-clockwise when viewed from -y)
    [0, 7, 1, 0, 4, 7],
    // Front face (+z): vertices 0,1,2,3 (counter-clockwise when viewed from +z)
    [0, 1, 2, 0, 2, 3],
    // Back face (-z): vertices 4,5,6,7 (counter-clockwise when viewed from -z)
    [4, 5, 6, 4, 6, 7],
  ];
  
  // Only add indices for exposed faces
  for (let faceIdx = 0; faceIdx < 6; faceIdx++) {
    if (exposedFaces[faceIdx]) {
      const faceVerts = faceDefinitions[faceIdx];
      for (const v of faceVerts) {
        indices.push(v);
      }
    }
  }
  
  return { vertices, indices };
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
export function generateDungeon(mapId?: string, config: DungeonShapeConfig = DEFAULT_DUNGEON_CONFIG): DungeonGenerationResult {
  const id = mapId || `dungeon_${Date.now()}`;
  
  // Step 1: Generate blocks in preserved order using multi-vine algorithm
  const blocks = generateDungeonBlocks(config);
  
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
