export const TILE_SIZE = 64;
export const MAP_COLS = 160;
export const MAP_ROWS = 160;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Multi-floor system configuration
export const NUM_FLOORS = 5; // Number of floor levels
export const FLOOR_HEIGHT = 64; // Vertical distance between floors in pixels

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

// Multi-floor map data - each floor has its own tile data
export const FLOOR_MAP_DATA: Uint8Array[] = [];
export const FLOOR_TILE_DATA: Float32Array[] = [];

// Initialize floor arrays
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

export function generateTestMap(): void {
  // Create a 16x16 floor area in the center of the 160x160 map
  // with ~15% void holes in an interconnected design
  // This pattern is applied to ALL floors
  
  const patternSize = 16;
  const offsetX = Math.floor((MAP_COLS - patternSize) / 2);
  const offsetY = Math.floor((MAP_ROWS - patternSize) / 2);
  
  // Generate each floor level
  for (let floor = 0; floor < NUM_FLOORS; floor++) {
    const floorMapData = FLOOR_MAP_DATA[floor];
    const floorTileData = FLOOR_TILE_DATA[floor];
    
    // Initialize all tiles as void (0) first
    floorMapData.fill(0);
    floorTileData.fill(0);
    
    // Apply the pattern directly
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const idx = row * MAP_COLS + col;
        const dataIdx = idx * 2;
        
        // Check if within pattern area
        let isFloor = false;
        if (row >= offsetY && row < offsetY + patternSize &&
            col >= offsetX && col < offsetX + patternSize) {
          const patternRow = row - offsetY;
          const patternCol = col - offsetX;
          
          // Interconnected pattern with ~15% void (38 voids out of 256)
          isFloor = !(
            (patternRow === 1 || patternRow === 2) && (patternCol === 5 || patternCol === 6 || patternCol === 9 || patternCol === 10) ||
            (patternRow === 3 || patternRow === 4) && (patternCol === 2 || patternCol === 3 || patternCol === 12 || patternCol === 13) ||
            (patternRow === 5 || patternRow === 6) && (patternCol >= 6 && patternCol <= 9) ||
            (patternRow === 9 || patternRow === 10) && (patternCol === 2 || patternCol === 3 || patternCol === 12 || patternCol === 13) ||
            (patternRow === 11 || patternRow === 12) && (patternCol === 6 || patternCol === 7 || patternCol === 9 || patternCol === 10)
          );
        }
        
        if (isFloor) {
          // Floor tile - use different texture IDs for different floors (no texture = plain color)
          // Each floor gets a different base tile ID for visual distinction
          const baseTileId = 100 + (floor * 50); // Different variation range per floor
          floorMapData[idx] = 0; // Floor type (passable)
          floorTileData[dataIdx] = baseTileId;    // Atlas tile ID (different per floor)
          floorTileData[dataIdx + 1] = 0;  // isStatic = false (use variation)
        } else {
          // Void - nothing will be rendered here
          floorMapData[idx] = 0;
          floorTileData[dataIdx] = 0;      // Tile ID 0 (void)
          floorTileData[dataIdx + 1] = 1;  // isStatic = true
        }
      }
    }
  }
  
  // Set current floor to ground (0)
  currentFloor = 0;
  
  // Copy floor 0 data to legacy MAP_DATA for compatibility
  MAP_DATA.set(FLOOR_MAP_DATA[0]);
  MAP_TILE_DATA.set(FLOOR_TILE_DATA[0]);
  
  // No border walls - pattern floats in void space
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
