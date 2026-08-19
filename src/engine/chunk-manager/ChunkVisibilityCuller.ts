// SRC/engine/chunk-manager/ChunkVisibilityCuller.ts
// Frustum culling logic for determining visible chunks

import { IChunk } from './ChunkTypes';
import { calculateVisibleChunkRange } from './ChunkGridCalculator';

/**
 * Frustum culling: determine which chunks are visible from camera position
 */
export function cullVisibleChunks(
  chunks: Map<string, IChunk>,
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
  mapWidth: number,
  mapHeight: number
): IChunk[] {
  const { minChunkX, minChunkY, maxChunkX, maxChunkY } = calculateVisibleChunkRange(
    cameraX,
    cameraY,
    viewportWidth,
    viewportHeight,
    mapWidth,
    mapHeight
  );

  const visibleChunks: IChunk[] = [];

  // Mark visible chunks
  for (let cy = minChunkY; cy <= maxChunkY; cy++) {
    for (let cx = minChunkX; cx <= maxChunkX; cx++) {
      const chunk = getChunk(chunks, cx, cy);
      if (chunk) {
        chunk.isVisible = true;
        visibleChunks.push(chunk);
      }
    }
  }

  // Mark non-visible chunks
  for (const chunk of chunks.values()) {
    if (!visibleChunks.includes(chunk)) {
      chunk.isVisible = false;
    }
  }

  return visibleChunks;
}

/**
 * Get all visible chunks from the chunk map
 */
export function getVisibleChunks(chunks: Map<string, IChunk>): IChunk[] {
  const visible: IChunk[] = [];
  for (const chunk of chunks.values()) {
    if (chunk.isVisible) {
      visible.push(chunk);
    }
  }
  return visible;
}

/**
 * Get chunk by coordinates
 */
export function getChunk(chunks: Map<string, IChunk>, chunkX: number, chunkY: number): IChunk | undefined {
  const key = `${chunkX},${chunkY}`;
  return chunks.get(key);
}
