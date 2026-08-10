// src/config/AtlasConfig.ts
// Configuration for the 2048x2048 texture atlas system

// Atlas image specifications
export const ATLAS_FILENAME = 'atlas floor.png';
export const ATLAS_PATH = '/src/atlas pictures/' + ATLAS_FILENAME;

// Atlas grid layout: 32x32 tiles in the 2048x2048 image
export const ATLAS_GRID_SIZE = 32; // 32x32 grid
export const ATLAS_TILE_PIXELS = 64; // Each tile is 64x64 pixels in the atlas
export const ATLAS_TOTAL_TILES = ATLAS_GRID_SIZE * ATLAS_GRID_SIZE; // 1024 unique tiles

// Tile ID ranges in the atlas
// Static tiles: IDs 0-255 (first 8 rows) - for houses, paths, structures
export const STATIC_TILE_START = 0;
export const STATIC_TILE_END = 255;
export const STATIC_TILE_COUNT = STATIC_TILE_END - STATIC_TILE_START + 1;

// Random variation tiles: IDs 256-1023 (remaining 24 rows) - for grass, dirt, etc.
export const VARIATION_TILE_START = 256;
export const VARIATION_TILE_END = ATLAS_TOTAL_TILES - 1;
export const VARIATION_TILE_COUNT = VARIATION_TILE_END - VARIATION_TILE_START + 1;

// World map dimensions (in tiles)
export const MAP_COLS = 32;
export const MAP_ROWS = 32;
export const TILE_SIZE = 64; // World tile size in pixels
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// UV calculation helpers
export const UV_TILE_SIZE = 1.0 / ATLAS_GRID_SIZE; // UV size of one tile in atlas (0.03125)

/**
 * Convert a tile index (0-1023) to UV coordinates for the atlas
 * Returns the bottom-left UV coordinate of the tile
 */
export function getTileUV(tileIndex: number): { u: number; v: number } {
  const clampedIndex = Math.max(0, Math.min(ATLAS_TOTAL_TILES - 1, tileIndex));
  const col = clampedIndex % ATLAS_GRID_SIZE;
  const row = Math.floor(clampedIndex / ATLAS_GRID_SIZE);
  
  return {
    u: col * UV_TILE_SIZE,
    v: row * UV_TILE_SIZE
  };
}

/**
 * Deterministic hash function for random tile selection
 * Returns a value between 0 and maxRange-1 based on input coordinates
 */
export function hashTileCoord(x: number, y: number, maxRange: number): number {
  // Simple but effective hash using prime numbers
  let hash = x * 73856093 ^ y * 19349663;
  hash = (hash >> 13) ^ hash;
  hash = hash * 81356093;
  
  // Ensure positive result and map to range
  const normalized = ((hash >>> 0) / 4294967296) * maxRange;
  return Math.floor(normalized) % maxRange;
}

/**
 * Get the final tile index for a given world position
 * Uses static override if provided, otherwise uses deterministic random variation
 */
export function getTileIndexForPosition(
  tileX: number,
  tileY: number,
  staticOverrides: Map<string, number> | null = null
): number {
  // Check for static override first
  if (staticOverrides) {
    const key = `${tileX},${tileY}`;
    if (staticOverrides.has(key)) {
      return staticOverrides.get(key)!;
    }
  }
  
  // Use deterministic random variation for natural tiles
  const variationRange = VARIATION_TILE_COUNT;
  const randomOffset = hashTileCoord(tileX, tileY, variationRange);
  return VARIATION_TILE_START + randomOffset;
}
