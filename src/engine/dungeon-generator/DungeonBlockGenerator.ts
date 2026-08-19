// SRC/engine/dungeon-generator/DungeonBlockGenerator.ts
// Orchestrates the generation of dungeon blocks using multi-vine algorithm

import { MapBlock } from '../MapWindow3DRenderer';
import { DungeonShapeConfig, DEFAULT_DUNGEON_CONFIG } from './DungeonTypes';
import { createDungeonRNG } from './DungeonRNG';
import { VineBlockPlacer } from './VineBlockPlacer';
import { growMultiVineDungeon } from './MultiVineGrowthEngine';

/**
 * Generate a multi-vine branching dungeon layout
 * Starts from a core block, then grows multiple vines with random walks and branching
 * Returns exactly totalBlocks MapBlock entries in generation order (core first, then vines)
 */
export function generateDungeonBlocks(config: DungeonShapeConfig = DEFAULT_DUNGEON_CONFIG): MapBlock[] {
  const rng = createDungeonRNG(config.seed);
  const totalBlocks = config.totalBlocks;
  const blockSize = 10;
  
  // Create block placer
  const placer = new VineBlockPlacer(blockSize);
  
  // Grow dungeon using multi-vine algorithm
  const blocks = growMultiVineDungeon(config, rng, placer);
  
  // Ensure exactly totalBlocks by truncating if we somehow exceeded
  while (blocks.length > totalBlocks) {
    const removed = blocks.pop()!;
    const gx = Math.round((removed.position.x - blockSize / 2) / blockSize);
    const gy = Math.round((removed.position.y - blockSize / 2) / blockSize);
    const gz = Math.round((removed.position.z - blockSize / 2) / blockSize);
    placer.removeBlockAt(gx, gy, gz);
  }
  
  const finalBlocks = placer.getBlocks();
  console.log(`[DungeonBlockGenerator] Generated ${finalBlocks.length} blocks using multi-vine algorithm (seed: ${config.seed}, vines: ${config.vineCount})`);
  return finalBlocks;
}
