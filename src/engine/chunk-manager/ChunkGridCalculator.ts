// SRC/engine/chunk-manager/ChunkGridCalculator.ts
// Math utilities for converting world coordinates to chunk keys and ranges

import { TILE_SIZE } from '../../config/MapData';
import { CHUNK_SIZE } from './ChunkTypes';

/**
 * Generate unique key for chunk lookup
 */
export function getChunkKey(chunkX: number, chunkY: number): string {
  return `${chunkX},${chunkY}`;
}

/**
 * Calculate chunk coordinates from tile coordinates
 */
export function getChunkCoordsFromTile(col: number, row: number): { chunkX: number; chunkY: number } {
  return {
    chunkX: Math.floor(col / CHUNK_SIZE),
    chunkY: Math.floor(row / CHUNK_SIZE)
  };
}

/**
 * Calculate visible chunk range from camera position
 */
export function calculateVisibleChunkRange(
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number,
  mapWidth: number,
  mapHeight: number
): {
  minChunkX: number;
  minChunkY: number;
  maxChunkX: number;
  maxChunkY: number;
} {
  // Calculate visible tile range from camera position with 1-chunk padding border
  const padding = TILE_SIZE * 2 + CHUNK_SIZE;
  const minTileX = Math.floor((cameraX - padding) / TILE_SIZE);
  const minTileY = Math.floor((cameraY - padding) / TILE_SIZE);
  const maxTileX = Math.ceil((cameraX + viewportWidth + padding) / TILE_SIZE);
  const maxTileY = Math.ceil((cameraY + viewportHeight + padding) / TILE_SIZE);

  // Convert to chunk coordinates
  const minChunkX = Math.max(0, Math.floor(minTileX / CHUNK_SIZE));
  const minChunkY = Math.max(0, Math.floor(minTileY / CHUNK_SIZE));
  const maxChunkX = Math.min(
    Math.ceil(mapWidth / CHUNK_SIZE) - 1,
    Math.floor(maxTileX / CHUNK_SIZE)
  );
  const maxChunkY = Math.min(
    Math.ceil(mapHeight / CHUNK_SIZE) - 1,
    Math.floor(maxTileY / CHUNK_SIZE)
  );

  return { minChunkX, minChunkY, maxChunkX, maxChunkY };
}

/**
 * Calculate how many chunks fit in viewport
 */
export function calculateVisibleChunkCount(
  viewportWidth: number,
  viewportHeight: number
): number {
  const tilesWide = Math.ceil(viewportWidth / TILE_SIZE);
  const tilesHigh = Math.ceil(viewportHeight / TILE_SIZE);
  const chunksWide = Math.ceil(tilesWide / CHUNK_SIZE) + 2;
  const chunksHigh = Math.ceil(tilesHigh / CHUNK_SIZE) + 2;
  
  return chunksWide * chunksHigh;
}
