// SRC/engine/chunk-manager/ChunkStatistics.ts
// Statistics gathering for debugging and profiling

import { IChunk, ChunkStats } from './ChunkTypes';

/**
 * Get statistics for debugging/profiling
 */
export function getChunkStats(chunks: Map<string, IChunk>): ChunkStats {
  let visibleChunks = 0;
  let totalInstances = 0;
  let visibleInstances = 0;

  for (const chunk of chunks.values()) {
    totalInstances += chunk.instanceCount;
    if (chunk.isVisible) {
      visibleChunks++;
      visibleInstances += chunk.instanceCount;
    }
  }

  return {
    totalChunks: chunks.size,
    visibleChunks,
    totalInstances,
    visibleInstances
  };
}

/**
 * Get detailed info about a specific chunk
 */
export function getChunkInfo(chunk: IChunk): {
  key: string;
  tileRange: string;
  instanceCount: number;
  isVisible: boolean;
  needsUpdate: boolean;
} {
  return {
    key: `${chunk.chunkX},${chunk.chunkY}`,
    tileRange: `(${chunk.tileStartX},${chunk.tileStartY}) to (${chunk.tileEndX},${chunk.tileEndY})`,
    instanceCount: chunk.instanceCount,
    isVisible: chunk.isVisible,
    needsUpdate: chunk.needsUpdate
  };
}
