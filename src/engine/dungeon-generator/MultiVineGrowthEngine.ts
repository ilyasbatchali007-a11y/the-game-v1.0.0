// SRC/engine/dungeon-generator/MultiVineGrowthEngine.ts
// Implements the multi-vine branching algorithm for dungeon layout generation

import { MapBlock } from '../types/MapBlockTypes';
import { DungeonShapeConfig } from './DungeonTypes';
import { VineBlockPlacer } from './VineBlockPlacer';
import { shuffleArrayWithRNG } from './DungeonRNG';

interface Direction3D {
  x: number;
  y: number;
  z: number;
}

interface VineSegment {
  gx: number;
  gy: number;
  gz: number;
  dir: Direction3D;
  budget: number;
}

/**
 * Grows a multi-vine dungeon structure using random walk and branching
 */
export function growMultiVineDungeon(
  config: DungeonShapeConfig,
  rng: () => number,
  placer: VineBlockPlacer
): MapBlock[] {
  const totalBlocks = config.totalBlocks;
  
  // Define 6 axis directions
  const directions: Direction3D[] = [
    { x: 1, y: 0, z: 0 },   // +x
    { x: -1, y: 0, z: 0 },  // -x
    { x: 0, y: 1, z: 0 },   // +y
    { x: 0, y: -1, z: 0 },  // -y
    { x: 0, y: 0, z: 1 },   // +z
    { x: 0, y: 0, z: -1 }   // -z
  ];

  // Start with core block at origin
  placer.tryPlaceBlock(0, 0, 0);

  // Select vineCount distinct starting directions
  const shuffledDirs = shuffleArrayWithRNG(directions, rng);
  const startDirections = shuffledDirs.slice(0, Math.min(config.vineCount, 6));

  // Calculate budget per vine (excluding core which is already placed)
  const remainingBlocks = totalBlocks - 1;
  const baseBudgetPerVine = Math.floor(remainingBlocks / startDirections.length);

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
  while (vineQueue.length > 0 && placer.getBlockCount() < totalBlocks) {
    const segment = vineQueue.shift()!;

    if (segment.budget <= 0) continue;

    let { gx, gy, gz, dir, budget } = segment;
    let stepsTaken = 0;
    const maxSteps = budget;

    while (stepsTaken < maxSteps && placer.getBlockCount() < totalBlocks) {
      // Try to place block in current direction
      let placed = false;
      const testDirs = [dir, ...shuffleArrayWithRNG([...directions], rng)];

      for (const testDir of testDirs) {
        const nx = gx + testDir.x;
        const ny = gy + testDir.y;
        const nz = gz + testDir.z;

        if (!placer.isOccupied(nx, ny, nz)) {
          // Place block
          if (placer.tryPlaceBlock(nx, ny, nz)) {
            gx = nx;
            gy = ny;
            gz = nz;

            // Chance to spawn a branch tendril
            if (rng() < config.branchChance && placer.getBlockCount() < totalBlocks) {
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

            placed = true;
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

  return placer.getBlocks();
}
