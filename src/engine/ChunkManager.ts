// SRC/engine/ChunkManager.ts
// GPU chunk management for isometric tilemap rendering
// 
// Orchestrator that delegates to specialized modules:
// - ChunkFactory: Creates and initializes chunks
// - ChunkGridCalculator: Coordinate math and visibility ranges
// - ChunkDataUpdater: Updates chunk data from tiles
// - ChunkGPUUploader: WebGL buffer management
// - ChunkVisibilityCuller: Frustum culling
// - ChunkDirtyTracker: Dirty state management
// - ChunkStatistics: Profiling and debugging

import { TILE_SIZE, getCurrentMapCols, getCurrentMapRows } from '../../config/MapData';
import { CHUNK_SIZE, IChunk, ChunkStats } from './chunk-manager/ChunkTypes';
import { initializeChunks } from './chunk-manager/ChunkFactory';
import { calculateVisibleChunkCount } from './chunk-manager/ChunkGridCalculator';
import { updateChunk } from './chunk-manager/ChunkDataUpdater';
import { uploadChunkToGPU, updateChunkGPU, disposeChunkGPU } from './chunk-manager/ChunkGPUUploader';
import { cullVisibleChunks, getVisibleChunks, getChunk } from './chunk-manager/ChunkVisibilityCuller';
import { markTileRangeDirty, markTileDirty } from './chunk-manager/ChunkDirtyTracker';
import { getChunkStats } from './chunk-manager/ChunkStatistics';

export class ChunkManager {
  private chunks: Map<string, IChunk>;
  private gl: WebGL2RenderingContext;
  private mapWidth: number;
  private mapHeight: number;
  private chunkSize: number;
  
  constructor(
    gl: WebGL2RenderingContext,
    mapWidth: number = getCurrentMapCols(),
    mapHeight: number = getCurrentMapRows(),
    chunkSize: number = CHUNK_SIZE
  ) {
    this.gl = gl;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.chunkSize = chunkSize;
    
    this.chunks = initializeChunks(mapWidth, mapHeight, chunkSize);
  }

  public getChunk(chunkX: number, chunkY: number): IChunk | undefined {
    return getChunk(this.chunks, chunkX, chunkY);
  }

  public updateChunk(
    chunk: IChunk,
    tileDataGetter: (col: number, row: number) => { tileId: number; passable: boolean } | null
  ): void {
    updateChunk(chunk, tileDataGetter);
  }

  public uploadChunkToGPU(chunk: IChunk): void {
    uploadChunkToGPU(this.gl, chunk);
  }

  public updateChunkGPU(chunk: IChunk, startInstance: number, count: number): void {
    updateChunkGPU(this.gl, chunk, startInstance, count);
  }

  public cullVisibleChunks(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IChunk[] {
    return cullVisibleChunks(
      this.chunks,
      cameraX,
      cameraY,
      viewportWidth,
      viewportHeight,
      this.mapWidth,
      this.mapHeight
    );
  }

  public getVisibleChunks(): IChunk[] {
    return getVisibleChunks(this.chunks);
  }

  public markTileRangeDirty(minCol: number, minRow: number, maxCol: number, maxRow: number): void {
    markTileRangeDirty(this.chunks, minCol, minRow, maxCol, maxRow);
  }

  public markTileDirty(col: number, row: number): void {
    markTileDirty(this.chunks, col, row);
  }

  public getStats(): ChunkStats {
    return getChunkStats(this.chunks);
  }

  public dispose(): void {
    for (const chunk of this.chunks.values()) {
      disposeChunkGPU(this.gl, chunk);
    }
    this.chunks.clear();
  }
}

export { CHUNK_SIZE, calculateVisibleChunkCount };
