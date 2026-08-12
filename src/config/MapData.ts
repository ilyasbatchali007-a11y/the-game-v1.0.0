export const TILE_SIZE = 64;
export const MAP_COLS = 160;
export const MAP_ROWS = 160;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Tile data structure for atlas rendering
// Each tile stores: tileId (which texture to use from atlas) and isStatic flag
export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

// Map data with atlas tile information
// Format: [tileId, isStatic, tileId, isStatic, ...] for each tile
// tileId > 0 renders the tile, tileId = 0 is void (nothing rendered)
export const MAP_TILE_DATA = new Float32Array(MAP_COLS * MAP_ROWS * 2);

export function generateTestMap(): void {
  // Create a 16x16 pattern within the 160x160 map
  // tileId > 0 = Floor (renders texture), tileId = 0 = Void (nothing rendered)
  // Pattern has ~15% void holes in an interconnected design
  
  const patternSize = 16;
  const offsetX = Math.floor((MAP_COLS - patternSize) / 2);
  const offsetY = Math.floor((MAP_ROWS - patternSize) / 2);
  
  // The interconnected pattern with ~15% void (38 voids out of 256)
  const floorPattern: number[][] = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1],
    [1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1],
    [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1],
    [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1],
    [1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1],
    [1,1,0,0,1,1,1,1,1,1,1,1,0,0,1,1],
    [1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1],
    [1,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  
  // Initialize all tiles as void (tileId = 0) first
  MAP_TILE_DATA.fill(0);
  
  // Apply the pattern
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const idx = row * MAP_COLS + col;
      const dataIdx = idx * 2;
      
      // Check if within pattern area
      let tileValue = 0; // Default void
      if (row >= offsetY && row < offsetY + patternSize &&
          col >= offsetX && col < offsetX + patternSize) {
        const patternRow = row - offsetY;
        const patternCol = col - offsetX;
        tileValue = floorPattern[patternRow][patternCol];
      }
      
      if (tileValue === 1) {
        // Floor tile - use ID 100 (variation tile)
        MAP_TILE_DATA[dataIdx] = 100;    // Atlas tile ID 100 (green grass)
        MAP_TILE_DATA[dataIdx + 1] = 0;  // isStatic = false (use variation)
      } else {
        // Void - nothing will be rendered here
        MAP_TILE_DATA[dataIdx] = 0;      // Tile ID 0 (void)
        MAP_TILE_DATA[dataIdx + 1] = 1;  // isStatic = true
      }
    }
  }
  
  // No border walls - pattern floats in void space
}
