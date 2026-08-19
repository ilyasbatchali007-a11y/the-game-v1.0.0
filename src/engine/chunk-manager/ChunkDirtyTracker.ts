// SRC/engine/chunk-manager/ChunkDirtyTracker.ts
// Manages dirty state tracking for chunks needing GPU updates

import { IChunk } from './ChunkTypes';
import { getChunkCoordsFromTile } from './ChunkGridCalculator';

function getChunk(chunks: Map<string, IChunk>, chunkX: number, chunkY: number): IChunk | undefined {
  const key = `${chunkX},${chunkY}`;
  return chunks.get(key);
}

/**
 * Mark a specific tile region as needing update (for dynamic terrain)
 */
export function markTileRangeDirty(
  chunks: Map<string, IChunk>,
  minCol: number,
  minRow: number,
  maxCol: number,
  maxRow: number
): void {
  const { chunkX: minChunkX, chunkY: minChunkY } = getChunkCoordsFromTile(minCol, minRow);
  const { chunkX: maxChunkX, chunkY: maxChunkY } = getChunkCoordsFromTile(maxCol, maxRow);

  for (let cy = minChunkY; cy <= maxChunkY; cy++) {
    for (let cx = minChunkX; cx <= maxChunkX; cx++) {
      const chunk = getChunk(chunks, cx, cy);
      if (chunk) {
        chunk.needsUpdate = true;
      }
    }
  }
}

/**
 * Mark single tile as dirty
 */
export function markTileDirty(
  chunks: Map<string, IChunk>,
  col: number,
  row: number
): void {
  const { chunkX, chunkY } = getChunkCoordsFromTile(col, row);
  const chunk = getChunk(chunks, chunkX, chunkY);
  if (chunk) {
    chunk.needsUpdate = true;
  }
}

/**
 * Mark entire chunk as dirty
 */
export function markChunkDirty(
  chunks: Map<string, IChunk>,
  chunkX: number,
  chunkY: number
): void {
  const chunk = getChunk(chunks, chunkX, chunkY);
  if (chunk) {
    chunk.needsUpdate = true;
  }
}

/**
 * Clear dirty flag for a chunk
 */
export function clearChunkDirty(chunk: IChunk): void {
  chunk.needsUpdate = false;
}
