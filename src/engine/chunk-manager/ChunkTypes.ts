// SRC/engine/chunk-manager/ChunkTypes.ts
// Type definitions for chunk management system

export const CHUNK_SIZE = 32;
export const CHUNK_WIDTH = CHUNK_SIZE;
export const CHUNK_HEIGHT = CHUNK_SIZE;

export interface IChunk {
  chunkX: number;
  chunkY: number;
  tileStartX: number;
  tileStartY: number;
  tileEndX: number;
  tileEndY: number;
  isVisible: boolean;
  needsUpdate: boolean;
  instanceCount: number;
  gpuBuffer?: WebGLBuffer;
  instanceData: Float32Array;
}

export interface ChunkStats {
  totalChunks: number;
  visibleChunks: number;
  totalInstances: number;
  visibleInstances: number;
}
