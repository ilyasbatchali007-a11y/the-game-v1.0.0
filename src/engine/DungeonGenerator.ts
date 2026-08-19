// SRC/engine/DungeonGenerator.ts
// Generates a 100-block dungeon layout using multi-vine branching algorithm, captures pre-fusion block metadata, and fuses into single mesh
// This file now acts as a thin orchestrator that delegates to specialized modules

import { MapBlock } from './types/MapBlockTypes';
import { DungeonShapeConfig, DEFAULT_DUNGEON_CONFIG, DungeonGenerationResult } from './dungeon-generator/DungeonTypes';
import { generateDungeonBlocks } from './dungeon-generator/DungeonBlockGenerator';
import { fuseBlocksIntoMesh } from './dungeon-generator/DungeonMeshFuser';
import { meshToOBJ } from './dungeon-generator/OBJMeshExporter';

/**
 * Generate complete dungeon with both mesh and block metadata
 */
export function generateDungeon(mapId?: string, config: DungeonShapeConfig = DEFAULT_DUNGEON_CONFIG): DungeonGenerationResult {
  const id = mapId || `dungeon_${Date.now()}`;
  
  // Step 1: Generate blocks in preserved order using multi-vine algorithm
  const blocks = generateDungeonBlocks(config);
  
  // Step 2: Fuse blocks into single mesh
  const { vertices, indices, blockTriangleRanges } = fuseBlocksIntoMesh(blocks);
  
  // Step 3: Convert to OBJ format
  const objContent = meshToOBJ(vertices, indices, id);
  
  return {
    blocks,
    objContent,
    mapId: id,
    blockTriangleRanges
  };
}

// Re-export types and constants for backward compatibility
export type { DungeonShapeConfig, DungeonGenerationResult };
export { DEFAULT_DUNGEON_CONFIG, generateDungeonBlocks };
