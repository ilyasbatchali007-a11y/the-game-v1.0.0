export const TILE_SIZE = 64;
export const MAP_COLS = 160;
export const MAP_ROWS = 160;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Simple binary map: 0 = empty space, 1 = floor tile
export const MAP_DATA = new Uint8Array(MAP_COLS * MAP_ROWS);

export function generateTestMap(): void {
  // Create a 16x16 floor area in the center of the 160x160 map
  
  const patternSize = 16;
  const offsetX = Math.floor((MAP_COLS - patternSize) / 2);
  const offsetY = Math.floor((MAP_ROWS - patternSize) / 2);
  
  // Initialize all tiles as empty (0) first
  MAP_DATA.fill(0);
  
  // Apply the pattern directly
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const idx = row * MAP_COLS + col;
      
      // Check if within pattern area
      if (row >= offsetY && row < offsetY + patternSize &&
          col >= offsetX && col < offsetX + patternSize) {
        const patternRow = row - offsetY;
        const patternCol = col - offsetX;
        
        // Solid 16x16 floor pattern (all tiles are floor)
        MAP_DATA[idx] = 1; // Floor tile
      }
      // Outside pattern area remains 0 (empty space)
    }
  }
}

export function isTileBlocking(col: number, row: number): boolean {
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return true;
  }
  // Only walls (tile ID 2) are blocking, floor (1) and empty (0) are passable
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
