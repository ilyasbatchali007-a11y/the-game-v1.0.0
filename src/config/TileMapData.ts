// SRC/config/TileMapData.ts
// Map data structure for defining which tile type goes where when using atlas

/**
 * Represents a tile map using tile indices into an atlas
 * Each number represents which tile from the atlas to use at that position
 */
export interface TileMapData {
  // Width of the tile grid (in tiles, not pixels)
  width: number;
  
  // Height/depth of the tile grid (in tiles)
  height: number;
  
  // Flat array of tile indices (row-major order)
  // Index = y * width + x
  // Value = tile index into the atlas (0 to atlas.totalTiles-1)
  tiles: Uint8Array | number[];
}

/**
 * Create a tile map from a 2D array of tile indices
 */
export function createTileMap(
  tileGrid: number[][],
  atlasTotalTiles: number
): TileMapData {
  const height = tileGrid.length;
  const width = height > 0 ? tileGrid[0].length : 0;
  const tiles = new Uint8Array(width * height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileIndex = tileGrid[y][x] || 0;
      // Clamp to valid atlas range
      tiles[y * width + x] = Math.max(0, Math.min(tileIndex, atlasTotalTiles - 1));
    }
  }
  
  return { width, height, tiles };
}

/**
 * Example: Simple 4x4 test map with different tile types
 * Use this as a reference for creating your own maps
 */
export function createTestTileMap(): TileMapData {
  // 0 = grass, 1 = dirt, 2 = stone, 3 = water (example indices)
  const testGrid = [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 2, 0],
    [0, 0, 0, 0]
  ];
  
  return createTileMap(testGrid, 16); // Assuming 4x4 atlas
}

/**
 * Get tile index at specific grid position
 */
export function getTileAt(map: TileMapData, x: number, y: number): number {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return 0; // Return default tile (usually grass/background)
  }
  return map.tiles[y * map.width + x];
}

/**
 * Set tile index at specific grid position
 */
export function setTileAt(map: TileMapData, x: number, y: number, tileIndex: number): void {
  if (x < 0 || x >= map.width || y < 0 || y >= map.height) {
    return;
  }
  map.tiles[y * map.width + x] = tileIndex;
}
