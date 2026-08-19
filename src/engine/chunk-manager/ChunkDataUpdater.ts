// SRC/engine/chunk-manager/ChunkDataUpdater.ts
// Handles updating chunk instance data from tile data

import { TILE_SIZE } from '../../config/MapData';
import { IChunk } from './ChunkTypes';

/**
 * Update chunk data from tile data
 */
export function updateChunk(
  chunk: IChunk,
  tileDataGetter: (col: number, row: number) => { tileId: number; passable: boolean } | null
): void {
  if (!chunk.needsUpdate) return;

  let offset = 0;
  let instanceCount = 0;

  for (let row = chunk.tileStartY; row < chunk.tileEndY; row++) {
    for (let col = chunk.tileStartX; col < chunk.tileEndX; col++) {
      const tileInfo = tileDataGetter(col, row);
      
      if (!tileInfo || tileInfo.tileId === 0) {
        continue; // Skip empty/blocked tiles
      }

      // Store instance data: x, y, sizeX, sizeY
      chunk.instanceData[offset++] = col * TILE_SIZE;
      chunk.instanceData[offset++] = row * TILE_SIZE;
      chunk.instanceData[offset++] = TILE_SIZE;
      chunk.instanceData[offset++] = TILE_SIZE;
      
      instanceCount++;
    }
  }

  chunk.instanceCount = instanceCount;
  chunk.needsUpdate = false;
}
