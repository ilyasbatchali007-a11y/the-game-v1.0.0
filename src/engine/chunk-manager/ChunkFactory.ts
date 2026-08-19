// SRC/engine/chunk-manager/ChunkFactory.ts
// Factory for creating and initializing chunk data structures

import { TILE_SIZE, getCurrentMapCols, getCurrentMapRows } from '../../config/MapData';
import { CHUNK_SIZE, IChunk } from './ChunkTypes';
import { getChunkKey } from './ChunkGridCalculator';

/**
 * Initialize all chunks for the map
 */
export function initializeChunks(
  mapWidth: number = getCurrentMapCols(),
  mapHeight: number = getCurrentMapRows(),
  chunkSize: number = CHUNK_SIZE
): Map<string, IChunk> {
  const chunks = new Map<string, IChunk>();
  const numChunksX = Math.ceil(mapWidth / chunkSize);
  const numChunksY = Math.ceil(mapHeight / chunkSize);
  const maxInstancesPerChunk = chunkSize * chunkSize;

  for (let cy = 0; cy < numChunksY; cy++) {
    for (let cx = 0; cx < numChunksX; cx++) {
      const tileStartX = cx * chunkSize;
      const tileStartY = cy * chunkSize;
      const tileEndX = Math.min(tileStartX + chunkSize, mapWidth);
      const tileEndY = Math.min(tileStartY + chunkSize, mapHeight);

      const chunkKey = getChunkKey(cx, cy);
      
      const chunk: IChunk = {
        chunkX: cx,
        chunkY: cy,
        tileStartX,
        tileStartY,
        tileEndX,
        tileEndY,
        isVisible: false,
        needsUpdate: true,
        instanceCount: 0,
        instanceData: new Float32Array(maxInstancesPerChunk * 4) // x, y, sizeX, sizeY
      };

      chunks.set(chunkKey, chunk);
    }
  }

  return chunks;
}

/**
 * Create a single chunk instance
 */
export function createChunk(
  chunkX: number,
  chunkY: number,
  mapWidth: number,
  mapHeight: number,
  chunkSize: number = CHUNK_SIZE
): IChunk {
  const tileStartX = chunkX * chunkSize;
  const tileStartY = chunkY * chunkSize;
  const tileEndX = Math.min(tileStartX + chunkSize, mapWidth);
  const tileEndY = Math.min(tileStartY + chunkSize, mapHeight);
  const maxInstancesPerChunk = chunkSize * chunkSize;

  return {
    chunkX,
    chunkY,
    tileStartX,
    tileStartY,
    tileEndX,
    tileEndY,
    isVisible: false,
    needsUpdate: true,
    instanceCount: 0,
    instanceData: new Float32Array(maxInstancesPerChunk * 4)
  };
}
