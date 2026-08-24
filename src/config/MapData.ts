export const TILE_SIZE = 64;
// Default map dimensions (used for Floor 0)
export const DEFAULT_MAP_COLS = 160;
export const DEFAULT_MAP_ROWS = 160;

// Dynamic map dimensions - updated when switching floors
let CURRENT_MAP_COLS = DEFAULT_MAP_COLS;
let CURRENT_MAP_ROWS = DEFAULT_MAP_ROWS;

// Dynamic world dimensions - recalculated when map dimensions change
export function getCurrentWorldWidth(): number {
  return CURRENT_MAP_COLS * TILE_SIZE;
}

export function getCurrentWorldHeight(): number {
  return CURRENT_MAP_ROWS * TILE_SIZE;
}

// Legacy constants for backward compatibility (will be deprecated)
export const WORLD_WIDTH = DEFAULT_MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = DEFAULT_MAP_ROWS * TILE_SIZE;

// Update map dimensions when switching floors
export function setMapDimensions(cols: number, rows: number): void {
  CURRENT_MAP_COLS = cols;
  CURRENT_MAP_ROWS = rows;
}

export function getCurrentMapCols(): number {
  return CURRENT_MAP_COLS;
}

export function getCurrentMapRows(): number {
  return CURRENT_MAP_ROWS;
}

// Tile data structure for atlas rendering
// Each tile stores: tileId (which texture to use from atlas) and isStatic flag
export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

// Tile IDs: 0 = floor (passable), 1 = decoration, 2 = wall (blocking)
// Portal tiles: 2000-2005 for 6-directional portals (up/down/left/right/front/back)
export let MAP_DATA = new Uint8Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS);

// New: Map data with atlas tile information
export let MAP_TILE_DATA = new Float32Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS * 2); 
// Format: [tileId, isStatic, tileId, isStatic, ...] for each tile

export function generateTestMap(floorConfig?: { cols: number; rows: number; useAtlas: boolean }): void {
  const cols = floorConfig?.cols || DEFAULT_MAP_COLS;
  const rows = floorConfig?.rows || DEFAULT_MAP_ROWS;
  const useAtlas = floorConfig?.useAtlas ?? true;
  
  // Update current map dimensions
  setMapDimensions(cols, rows);
  
  // Reinitialize arrays with new dimensions
  MAP_DATA = new Uint8Array(cols * rows);
  MAP_TILE_DATA = new Float32Array(cols * rows * 2);
  
  if (useAtlas) {
    // Floor 0 - Atlas texture, solid floor with no voids
    MAP_DATA.fill(0);
    MAP_TILE_DATA.fill(0);
    
    // Fill entire map with atlas grass tiles (ID 100)
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const dataIdx = idx * 2;
        
        MAP_DATA[idx] = 0; // Floor type
        MAP_TILE_DATA[dataIdx] = 100;    // Atlas tile ID 100 (green grass)
        MAP_TILE_DATA[dataIdx + 1] = 0;  // isStatic = false (use variation)
      }
    }
    
    // Portal tiles are now placed by PortalManager based on JSON data
    // No hardcoded portal placement here anymore
    
  } else {
    // Floors 1-99 - Green chessboard pattern (all tiles are passable floor)
    // Portal tiles are placed by PortalManager based on JSON data
    MAP_DATA.fill(0);
    MAP_TILE_DATA.fill(0);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const dataIdx = idx * 2;
        // All tiles are passable floor with chessboard pattern
        MAP_DATA[idx] = 0; // Floor type (passable)
        MAP_TILE_DATA[dataIdx] = 0;      // Tile ID 0 (will be rendered as chessboard by shader)
        MAP_TILE_DATA[dataIdx + 1] = 1;  // isStatic = true
      }
    }
    
    // Portal tiles are now placed by PortalManager based on JSON data
    // No hardcoded portal placement here anymore
  }
}

export function isTileBlocking(col: number, row: number): boolean {
  if (col < 0 || col >= getCurrentMapCols() || row < 0 || row >= getCurrentMapRows()) {
    return true;
  }
  return MAP_DATA[row * getCurrentMapCols() + col] === 2;
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
  if (col < 0 || col >= getCurrentMapCols() || row < 0 || row >= getCurrentMapRows()) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * getCurrentMapCols() + col) * 2;
  return {
    tileId: MAP_TILE_DATA[idx],
    isStatic: MAP_TILE_DATA[idx + 1]
  };
}
