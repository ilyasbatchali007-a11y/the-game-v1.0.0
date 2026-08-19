// SRC/engine/dungeon-generator/DungeonTypes.ts
// Type definitions for dungeon generation configuration and results

import { MapBlock } from '../types/MapBlockTypes';

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
  blockTriangleRanges?: { start: number; count: number }[]; // Triangle index ranges per block for fog of war
}
