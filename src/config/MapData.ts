export const TILE_SIZE = 64;
export const MAP_COLS = 32;
export const MAP_ROWS = 32;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Tile data structure for atlas rendering
// Each tile stores: tileId (which texture to use from atlas) and isStatic flag
export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

// Tile IDs: 0 = floor (passable), 1 = decoration, 2 = wall (blocking)
export const MAP_DATA = new Uint8Array(MAP_COLS * MAP_ROWS);

// New: Map data with atlas tile information
export const MAP_TILE_DATA = new Float32Array(MAP_COLS * MAP_ROWS * 2); 
// Format: [tileId, isStatic, tileId, isStatic, ...] for each tile

export function generateTestMap(): void {
  // Fill entire map with floor tiles (0 = passable floor)
  MAP_DATA.fill(0);
  
  // Initialize atlas tile data
  // For variation tiles (grass), we set isStatic=false and use a variation range
  // For static tiles (walls, paths), we set isStatic=true with specific tileId
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const idx = row * MAP_COLS + col;
      const dataIdx = idx * 2;
      
      if (row === 0 || row === MAP_ROWS - 1 || col === 0 || col === MAP_COLS - 1) {
        // Border walls - static tiles with specific ID
        MAP_DATA[idx] = 2; // Wall
        MAP_TILE_DATA[dataIdx] = 5;     // Use tile ID 5 from atlas for walls
        MAP_TILE_DATA[dataIdx + 1] = 1; // isStatic = true
      } else {
        // Floor tiles - use random variations from the new larger range
        // Each tile gets a different base ID in the variation range
        const randomOffset = Math.floor(Math.random() * 130); // 0-129
        MAP_DATA[idx] = 0; // Floor
        MAP_TILE_DATA[dataIdx] = 51 + randomOffset; // Random tile ID between 51-180
        MAP_TILE_DATA[dataIdx + 1] = 0;  // isStatic = false, use hash-based selection
      }
    }
  }
  
  // Add some static path tiles as an example
  const pathY = Math.floor(MAP_ROWS / 2);
  for (let col = 1; col < MAP_COLS - 1; col++) {
    const idx = pathY * MAP_COLS + col;
    const dataIdx = idx * 2;
    MAP_DATA[idx] = 1; // Decoration/path
    MAP_TILE_DATA[dataIdx] = 10;     // Use tile ID 10 from atlas for path
    MAP_TILE_DATA[dataIdx + 1] = 1;  // isStatic = true
  }
}

export function isTileBlocking(col: number, row: number): boolean {
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return true;
  }
  return MAP_DATA[row * MAP_COLS + col] === 2;
}

// New helper for continuous collision detection with floating-point positions
export function getTileAtPosition(worldX: number, worldY: number): { col: number; row: number } {
  return {
    col: Math.floor(worldX / TILE_SIZE),
    row: Math.floor(worldY / TILE_SIZE)
  };
}

export function isPositionBlocking(worldX: number, worldY: number): boolean {
  const { col, row } = getTileAtPosition(worldX, worldY);
  return isTileBlocking(col, row);
}

// Get tile data for atlas rendering
export function getTileData(col: number, row: number): { tileId: number; isStatic: number } {
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * MAP_COLS + col) * 2;
  return {
    tileId: MAP_TILE_DATA[idx],
    isStatic: MAP_TILE_DATA[idx + 1]
  };
}
