export const TILE_SIZE = 64;
export const MAP_COLS = 160;
export const MAP_ROWS = 160;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE;
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;

// Tile IDs for teleporters
export const TELEPORTER_UP_ID = 10;
export const TELEPORTER_DOWN_ID = 13;

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

// Multi-floor system
export interface FloorData {
  floorId: number;
  width: number;
  height: number;
  tileData: Float32Array; // [tileId, isStatic, ...]
  offsetX: number; // World position offset
  offsetY: number;
}

export const MAX_FLOORS = 20;
export const FLOORS: FloorData[] = [];
export let currentFloorId: number = 0;

export function generateTestMap(): void {
  // Generate floor 0 (atlas floor) - 160x160
  generateFloor(0, 160, 160, true);
  
  // Generate floors 1-19 (repetitive texture) - max 30x30
  for (let i = 1; i < MAX_FLOORS; i++) {
    const size = Math.floor(Math.random() * 21) + 10; // Random size 10-30
    generateFloor(i, size, size, false);
  }
  
  // Load floor 0 by default
  loadFloor(0);
}

export function generateFloor(floorId: number, width: number, height: number, useAtlas: boolean): void {
  const tileData = new Float32Array(width * height * 2);
  
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = (row * width + col) * 2;
      
      if (useAtlas) {
        // Floor 0: Atlas texture with green grass
        tileData[idx] = 100;    // Atlas tile ID 100 (green grass)
        tileData[idx + 1] = 0;  // isStatic = false (use variation)
      } else {
        // Floors 1-19: Repetitive chessboard pattern
        const isChessA = (col + row) % 2 === 0;
        tileData[idx] = isChessA ? 100 : 101;  // Alternate between two green tiles
        tileData[idx + 1] = 1;  // isStatic = true (exact tile)
      }
    }
  }
  
  // Add teleporters for all floors except the last one
  if (floorId < MAX_FLOORS - 1) {
    // Place UP teleporter at center
    const upCol = Math.floor(width / 2);
    const upRow = Math.floor(height / 2);
    const upIdx = (upRow * width + upCol) * 2;
    tileData[upIdx] = TELEPORTER_UP_ID;
    tileData[upIdx + 1] = 1; // static
    
    // Place DOWN teleporter near UP (offset by 1 tile diagonally)
    const downCol = upCol - 1;
    const downRow = upRow - 1;
    if (downCol >= 0 && downRow >= 0) {
      const downIdx = (downRow * width + downCol) * 2;
      tileData[downIdx] = TELEPORTER_DOWN_ID;
      tileData[downIdx + 1] = 1; // static
    }
  }
  
  FLOORS[floorId] = {
    floorId,
    width,
    height,
    tileData,
    offsetX: 0,
    offsetY: 0
  };
}

export function loadFloor(floorId: number): void {
  if (floorId < 0 || floorId >= MAX_FLOORS) return;
  
  currentFloorId = floorId;
  const floor = FLOORS[floorId];
  
  // Copy floor data to MAP_TILE_DATA
  for (let row = 0; row < floor.height; row++) {
    for (let col = 0; col < floor.width; col++) {
      const srcIdx = (row * floor.width + col) * 2;
      const dstIdx = (row * MAP_COLS + col) * 2;
      MAP_TILE_DATA[dstIdx] = floor.tileData[srcIdx];
      MAP_TILE_DATA[dstIdx + 1] = floor.tileData[srcIdx + 1];
      MAP_DATA[row * MAP_COLS + col] = 0; // All floor tiles are passable
    }
  }
  
  console.log(`[MapData] Loaded floor ${floorId} (${floor.width}x${floor.height})`);
}

export function teleportToFloor(targetFloorId: number, playerX: number, playerY: number): { x: number; y: number } {
  if (targetFloorId < 0 || targetFloorId >= MAX_FLOORS) {
    return { x: playerX, y: playerY };
  }
  
  loadFloor(targetFloorId);
  const floor = FLOORS[targetFloorId];
  
  // Spawn player at center of new floor
  const centerX = (floor.width * TILE_SIZE) / 2;
  const centerY = (floor.height * TILE_SIZE) / 2;
  
  console.log(`[MapData] Teleported to floor ${targetFloorId}`);
  return { x: centerX, y: centerY };
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
