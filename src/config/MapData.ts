export const TILE_SIZE = 64;
export const MAP_COLS = 160;
export const MAP_ROWS = 160;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Multi-floor system constants
export const NUM_FLOORS = 10;
export const FLOOR_1_ATLAS = 0;      // Floor 1 uses atlas texture
export const FLOOR_2_PLUS_CHESS = 1; // Floors 2-10 use green chessboard pattern

// Tile types for special tiles
export const TILE_NORMAL = 0;
export const TILE_RED_TELEPORT_UP = 1;    // Red tile - teleport up
export const TILE_BLUE_TELEPORT_DOWN = 2; // Blue tile - teleport down
export const TILE_GREEN_CHESS = 3;        // Green chessboard pattern

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

// Current floor level (1-10)
export let currentFloor = 1;

// Special tile positions for teleportation
export interface TeleportTile {
  col: number;
  row: number;
  type: number; // TILE_RED_TELEPORT_UP or TILE_BLUE_TELEPORT_DOWN
}

export const TELEPORT_TILES: TeleportTile[] = [];

export function generateTestMap(floor: number = 1): void {
  // Clear teleport tiles array
  TELEPORT_TILES.length = 0;
  
  // Store current floor
  currentFloor = floor;
  
  const patternSize = 16;
  const offsetX = Math.floor((MAP_COLS - patternSize) / 2);
  const offsetY = Math.floor((MAP_ROWS - patternSize) / 2);
  
  // Fill entire map with Floor 1 atlas texture by default
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const idx = row * MAP_COLS + col;
      const dataIdx = idx * 2;
      
      if (floor === 1) {
        // Floor 1: Atlas texture (green grass from atlas)
        MAP_DATA[idx] = TILE_NORMAL;
        MAP_TILE_DATA[dataIdx] = 100;    // Atlas tile ID 100 (green grass)
        MAP_TILE_DATA[dataIdx + 1] = 0;  // isStatic = false (use variation)
        
        // Place red teleport tile at specific position on floor 1
        const redTileCol = offsetX + 7;
        const redTileRow = offsetY + 7;
        if (col === redTileCol && row === redTileRow) {
          MAP_DATA[idx] = TILE_RED_TELEPORT_UP;
          MAP_TILE_DATA[dataIdx] = 200;   // Special red tile ID
          MAP_TILE_DATA[dataIdx + 1] = 1; // isStatic = true (exact tile)
          TELEPORT_TILES.push({ col: redTileCol, row: redTileRow, type: TILE_RED_TELEPORT_UP });
        }
      } else {
        // Floors 2-10: Green chessboard pattern
        MAP_DATA[idx] = TILE_GREEN_CHESS;
        
        // Create chessboard pattern using tile IDs
        const isEven = ((col + row) % 2) === 0;
        MAP_TILE_DATA[dataIdx] = isEven ? 150 : 151;  // Two different green shades
        MAP_TILE_DATA[dataIdx + 1] = 1;  // isStatic = true (exact tiles for chessboard)
        
        // Place blue teleport tile at specific position on floors 2-10
        const blueTileCol = offsetX + 7;
        const blueTileRow = offsetY + 7;
        if (col === blueTileCol && row === blueTileRow) {
          MAP_DATA[idx] = TILE_BLUE_TELEPORT_DOWN;
          MAP_TILE_DATA[dataIdx] = 201;   // Special blue tile ID
          MAP_TILE_DATA[dataIdx + 1] = 1; // isStatic = true (exact tile)
          TELEPORT_TILES.push({ col: blueTileCol, row: blueTileRow, type: TILE_BLUE_TELEPORT_DOWN });
        }
      }
    }
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
