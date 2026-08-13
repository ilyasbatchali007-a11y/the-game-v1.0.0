export const TILE_SIZE = 64;

// Fixed size for all floors to ensure texture compatibility and player movement
export const MAP_COLS = 32;
export const MAP_ROWS = 32;

export const NUM_FLOORS = 5;
export const FLOOR_HEIGHT = 64;

// Tile data structure for atlas rendering
export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

// Multi-floor map data - fixed dimensions for all floors
export const FLOOR_MAP_DATA: Uint8Array[] = [];
export const FLOOR_TILE_DATA: Float32Array[] = [];

// Initialize floor arrays with fixed dimensions
for (let i = 0; i < NUM_FLOORS; i++) {
  FLOOR_MAP_DATA.push(new Uint8Array(MAP_COLS * MAP_ROWS));
  FLOOR_TILE_DATA.push(new Float32Array(MAP_COLS * MAP_ROWS * 2));
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
  return { cols: MAP_COLS, rows: MAP_ROWS };
}

export function generateTestMap(): void {
  // Generate each floor level with solid tiles (no voids)
  for (let floor = 0; floor < NUM_FLOORS; floor++) {
    const floorMapData = FLOOR_MAP_DATA[floor];
    const floorTileData = FLOOR_TILE_DATA[floor];
    
    // Fill entire floor with solid tiles - no voids
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const idx = row * MAP_COLS + col;
        const dataIdx = idx * 2;
        
        // Floor tile - use different texture IDs for different floors
        // Ground floor (0) uses original texture, other floors use green chessboard pattern
        if (floor === 0) {
          // Original floor - use base tile ID with variation (100-103)
          floorMapData[idx] = 0; // Floor type (passable)
          floorTileData[dataIdx] = 100 + ((col + row) % 4);    // Atlas tile ID
          floorTileData[dataIdx + 1] = 0;  // isStatic = false (use variation)
        } else {
          // Additional floors - green chessboard pattern (IDs 200-201)
          const isGreen = (col + row) % 2 === 0;
          floorMapData[idx] = 0; // Floor type (passable)
          floorTileData[dataIdx] = isGreen ? 200 : 201;    // Green chessboard tile ID
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
  
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return true;
  }
  return FLOOR_MAP_DATA[f][row * MAP_COLS + col] === 2;
}

// New helper for continuous collision detection with floating-point positions
export function getTileAtPosition(worldX: number, worldY: number, floor?: number): { col: number; row: number } {
  const f = floor !== undefined ? floor : currentFloor;
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
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * MAP_COLS + col) * 2;
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
  if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * MAP_COLS + col) * 2;
  return {
    tileId: FLOOR_TILE_DATA[floor][idx],
    isStatic: FLOOR_TILE_DATA[floor][idx + 1]
  };
}
