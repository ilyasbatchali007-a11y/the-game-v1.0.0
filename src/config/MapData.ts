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
  // Floor layout blueprint: 1 = place tile, 0 = empty void
  const floorLayout = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0]
  ];
  
  const layoutRows = floorLayout.length;
  const layoutCols = floorLayout[0].length;
  
  // Calculate offset to center the layout on the map
  const offsetX = Math.floor((MAP_COLS - layoutCols) / 2);
  const offsetY = Math.floor((MAP_ROWS - layoutRows) / 2);
  
  // Clear all data first
  MAP_DATA.fill(0);
  MAP_TILE_DATA.fill(0);
  
  // Generate floor tiles based on the blueprint
  for (let row = 0; row < layoutRows; row++) {
    for (let col = 0; col < layoutCols; col++) {
      if (floorLayout[row][col] === 1) {
        const mapRow = offsetY + row;
        const mapCol = offsetX + col;
        
        if (mapRow >= 0 && mapRow < MAP_ROWS && mapCol >= 0 && mapCol < MAP_COLS) {
          const idx = mapRow * MAP_COLS + mapCol;
          const dataIdx = idx * 2;
          
          // Random tile ID from variation range (51-181)
          const randomOffset = Math.floor(Math.random() * 131);
          MAP_DATA[idx] = 0; // Floor
          MAP_TILE_DATA[dataIdx] = 51 + randomOffset;
          MAP_TILE_DATA[dataIdx + 1] = 0; // isStatic = false
        }
      }
    }
  }
  
  // Add border walls around the entire map
  for (let col = 0; col < MAP_COLS; col++) {
    // Top wall
    let idx = col;
    let dataIdx = idx * 2;
    MAP_DATA[idx] = 2;
    MAP_TILE_DATA[dataIdx] = 5;
    MAP_TILE_DATA[dataIdx + 1] = 1;
    
    // Bottom wall
    idx = (MAP_ROWS - 1) * MAP_COLS + col;
    dataIdx = idx * 2;
    MAP_DATA[idx] = 2;
    MAP_TILE_DATA[dataIdx] = 5;
    MAP_TILE_DATA[dataIdx + 1] = 1;
  }
  
  for (let row = 0; row < MAP_ROWS; row++) {
    // Left wall
    let idx = row * MAP_COLS;
    let dataIdx = idx * 2;
    MAP_DATA[idx] = 2;
    MAP_TILE_DATA[dataIdx] = 5;
    MAP_TILE_DATA[dataIdx + 1] = 1;
    
    // Right wall
    idx = row * MAP_COLS + (MAP_COLS - 1);
    dataIdx = idx * 2;
    MAP_DATA[idx] = 2;
    MAP_TILE_DATA[dataIdx] = 5;
    MAP_TILE_DATA[dataIdx + 1] = 1;
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
