// SRC/engine/chunk-manager/ChunkGPUUploader.ts
// Handles uploading chunk data to WebGL GPU buffers

import { IChunk } from './ChunkTypes';

/**
 * Upload chunk data to GPU buffer
 */
export function uploadChunkToGPU(gl: WebGL2RenderingContext, chunk: IChunk): void {
  if (!chunk.gpuBuffer) {
    chunk.gpuBuffer = gl.createBuffer()!;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, chunk.gpuBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    chunk.instanceData.byteLength,
    gl.DYNAMIC_DRAW
  );
  
  // Initial upload
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    0,
    chunk.instanceData.subarray(0, chunk.instanceCount * 4)
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Partial update of chunk GPU buffer (only changed instances)
 */
export function updateChunkGPU(
  gl: WebGL2RenderingContext,
  chunk: IChunk,
  startInstance: number,
  count: number
): void {
  if (!chunk.gpuBuffer) return;

  gl.bindBuffer(gl.ARRAY_BUFFER, chunk.gpuBuffer);
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    startInstance * 16, // 4 floats * 4 bytes
    chunk.instanceData.subarray(startInstance * 4, (startInstance + count) * 4)
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

/**
 * Cleanup GPU resources for a chunk
 */
export function disposeChunkGPU(gl: WebGL2RenderingContext, chunk: IChunk): void {
  if (chunk.gpuBuffer) {
    gl.deleteBuffer(chunk.gpuBuffer);
    chunk.gpuBuffer = undefined;
  }
}
