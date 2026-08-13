export const TILE_SIZE = 64;
// Floor configuration - each floor can have different dimensions
export interface FloorConfig {
  cols: number;      // Width in tiles
  rows: number;      // Height in tiles  
  id: number;        // Unique floor ID
  tileBaseId: number; // Base tile ID for texture variation
}

// Customizable floor definitions - different sizes and IDs
export const FLOORS: FloorConfig[] = [
  { cols: 32, rows: 32, id: 0, tileBaseId: 100 },   // Ground floor - 32x32
  { cols: 24, rows: 28, id: 1, tileBaseId: 200 },   // Floor 1 - 24x28 (green chessboard)
  { cols: 20, rows: 24, id: 2, tileBaseId: 300 },   // Floor 2 - 20x24 (green chessboard)
  { cols: 16, rows: 20, id: 3, tileBaseId: 400 },   // Floor 3 - 16x20 (green chessboard)
  { cols: 12, rows: 16, id: 4, tileBaseId: 500 },   // Floor 4 - 12x16 (green chessboard)
];

export const NUM_FLOORS = FLOORS.length;
export const FLOOR_HEIGHT = 64;

// Get max dimensions needed for array allocation
const MAX_COLS = Math.max(...FLOORS.map(f => f.cols));
const MAX_ROWS = Math.max(...FLOORS.map(f => f.rows));

// Tile data structure for atlas rendering
export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

// Multi-floor map data - each floor has its own tile data with custom dimensions
export const FLOOR_MAP_DATA: Uint8Array[] = [];
export const FLOOR_TILE_DATA: Float32Array[] = [];

// Initialize floor arrays with custom dimensions per floor
for (let i = 0; i < NUM_FLOORS; i++) {
  const floor = FLOORS[i];
  FLOOR_MAP_DATA.push(new Uint8Array(floor.cols * floor.rows));
  FLOOR_TILE_DATA.push(new Float32Array(floor.cols * floor.rows * 2));
}

// Current active floor level (0 = ground floor)
export let currentFloor: number = 0;

export function setCurrentFloor(floor: number): void {
  currentFloor = Math.max(0, Math.min(NUM_FLOORS - 1, floor));
}

export function getCurrentFloor(): number {
  return currentFloor;
}

export function getFloorDimensions(floor: number): { cols: number; rows: number } {
  const f = FLOORS[Math.max(0, Math.min(NUM_FLOORS - 1, floor))];
  return { cols: f.cols, rows: f.rows };
}

export function generateTestMap(): void {
  // Generate each floor level with custom dimensions and solid tiles (no voids)
  for (let floor = 0; floor < NUM_FLOORS; floor++) {
    const floorConfig = FLOORS[floor];
    const floorMapData = FLOOR_MAP_DATA[floor];
    const floorTileData = FLOOR_TILE_DATA[floor];
    
    const cols = floorConfig.cols;
    const rows = floorConfig.rows;
    const baseTileId = floorConfig.tileBaseId;
    
    // Fill entire floor with solid tiles - no voids
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const dataIdx = idx * 2;
        
        // Floor tile - use different texture IDs for different floors
        // Ground floor (0) uses original texture, other floors use green chessboard pattern
        if (floor === 0) {
          // Original floor - use base tile ID with variation
          floorMapData[idx] = 0; // Floor type (passable)
          floorTileData[dataIdx] = baseTileId;    // Atlas tile ID
          floorTileData[dataIdx + 1] = 0;  // isStatic = false (use variation)
        } else {
          // Additional floors - green chessboard pattern (different tile range)
          floorMapData[idx] = 0; // Floor type (passable)
          floorTileData[dataIdx] = baseTileId;    // Green chessboard tile ID
          floorTileData[dataIdx + 1] = 0;  // isStatic = false (use variation)
        }
      }
    }
  }
  
  // Set current floor to ground (0)
  currentFloor = 0;
}

export function isTileBlocking(col: number, row: number, floor?: number): boolean {
  const f = floor !== undefined ? floor : currentFloor;
  if (f < 0 || f >= NUM_FLOORS) return true;
  
  const dims = getFloorDimensions(f);
  if (col < 0 || col >= dims.cols || row < 0 || row >= dims.rows) {
    return true;
  }
  return FLOOR_MAP_DATA[f][row * dims.cols + col] === 2;
}

// New helper for continuous collision detection with floating-point positions
export function getTileAtPosition(worldX: number, worldY: number, floor?: number): { col: number; row: number } {
  const f = floor !== undefined ? floor : currentFloor;
  const dims = getFloorDimensions(f);
  return {
    col: Math.floor(worldX / TILE_SIZE),
    row: Math.floor(worldY / TILE_SIZE)
  };
}

export function isPositionBlocking(worldX: number, worldY: number, floor?: number): boolean {
  const { col, row } = getTileAtPosition(worldX, worldY, floor);
  return isTileBlocking(col, row, floor);
}

// Get tile data for atlas rendering from current floor
export function getTileData(col: number, row: number): { tileId: number; isStatic: number } {
  const f = currentFloor;
  const dims = getFloorDimensions(f);
  if (col < 0 || col >= dims.cols || row < 0 || row >= dims.rows) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * dims.cols + col) * 2;
  return {
    tileId: FLOOR_TILE_DATA[f][idx],
    isStatic: FLOOR_TILE_DATA[f][idx + 1]
  };
}

// Get floor-specific tile data
export function getFloorTileData(floor: number, col: number, row: number): { tileId: number; isStatic: number } {
  if (floor < 0 || floor >= NUM_FLOORS) {
    return { tileId: 0, isStatic: 1 };
  }
  const dims = getFloorDimensions(floor);
  if (col < 0 || col >= dims.cols || row < 0 || row >= dims.rows) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * dims.cols + col) * 2;
  return {
    tileId: FLOOR_TILE_DATA[floor][idx],
    isStatic: FLOOR_TILE_DATA[floor][idx + 1]
  };
}
