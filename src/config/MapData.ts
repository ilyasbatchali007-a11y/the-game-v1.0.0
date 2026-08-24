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
// Portal tiles: Old system used 1000/1001 for next/previous floor
// New system uses directional IDs: 2001=UP, 2002=DOWN, 2003=LEFT, 2004=RIGHT, 2005=FRONT, 2006=BACK
export let MAP_DATA = new Uint8Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS);

// New: Map data with atlas tile information
export let MAP_TILE_DATA = new Float32Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS * 2); 
// Format: [tileId, isStatic, tileId, isStatic, ...] for each tile

export function generateTestMap(floorConfig?: { cols: number; rows: number; useAtlas: boolean; floorId?: number }): void {
  const cols = floorConfig?.cols || DEFAULT_MAP_COLS;
  const rows = floorConfig?.rows || DEFAULT_MAP_ROWS;
  const useAtlas = floorConfig?.useAtlas ?? true;
  const floorId = floorConfig?.floorId ?? 0;
  
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
    
    // Spawn portals based on List 3 placement data for this floor
    spawnPortalsForFloor(floorId, cols, rows);
    
  } else {
    // Floors 1-19 - Green chessboard pattern (all tiles are passable floor)
    // Spawn portals based on List 3 placement data for this floor
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
    
    // Spawn portals based on List 3 placement data for this floor
    spawnPortalsForFloor(floorId, cols, rows);
  }
}

/**
 * Spawn portal tiles on a floor based on List 3 placement data and List 2 adjacency
 * @param floorId - The floor ID to spawn portals for
 * @param cols - Number of columns in the map
 * @param rows - Number of rows in the map
 */
function spawnPortalsForFloor(floorId: number, cols: number, rows: number): void {
  // Access PortalManager from global scope (set when module loads)
  const PortalManager = (globalThis as any).__PortalManager;
  
  if (!PortalManager) {
    console.error('[PortalManager] CRITICAL: Not loaded at all! Check import order.');
    return;
  }
  
  console.log('[PortalManager] Spawning portals for floor', floorId, 'with', cols, 'x', rows, 'tiles');
  
  const placements = PortalManager.getAllPlacements(floorId);
  console.log('[PortalManager] Found', placements.length, 'portal placements for floor', floorId);
  
  for (const { direction, placement } of placements) {
    // Check if this direction has a valid connection in List 2
    if (!PortalManager.hasPortal(floorId, direction)) {
      console.log('[PortalManager] Skipping', direction, '- no adjacency connection');
      continue; // Skip if no actual connection exists
    }
    
    const tileId = PortalManager.getTileIdForDirection(direction);
    console.log('[PortalManager] Placing', direction, 'portal with tile ID', tileId, 'coords:', placement);
    
    if (direction === 'up' || direction === 'down') {
      // Single tile at fixed coordinates
      const x = placement.x!;
      const z = placement.z!;
      if (x >= 0 && x < cols && z >= 0 && z < rows) {
        const idx = (z * cols + x) * 2;
        MAP_TILE_DATA[idx] = tileId;
        MAP_TILE_DATA[idx + 1] = 1; // isStatic = true
      }
    } else {
      // Wall-line portals: left/right span Z axis, front/back span X axis
      const buffer = placement.buffer || 2;
      
      if (direction === 'left' || direction === 'right') {
        // Left/Right walls: line along Z axis at edge of map
        const col = direction === 'left' ? buffer : cols - 1 - buffer;
        const startZ = placement.startZ || buffer;
        const endZ = placement.endZ || rows - 1 - buffer;
        
        for (let z = startZ; z <= endZ; z++) {
          const idx = (z * cols + col) * 2;
          MAP_TILE_DATA[idx] = tileId;
          MAP_TILE_DATA[idx + 1] = 1; // isStatic = true
        }
      } else if (direction === 'front' || direction === 'back') {
        // Front/Back walls: line along X axis at edge of map
        const row = direction === 'front' ? buffer : rows - 1 - buffer;
        const startX = placement.startX || buffer;
        const endX = placement.endX || cols - 1 - buffer;
        
        for (let x = startX; x <= endX; x++) {
          const idx = (row * cols + x) * 2;
          MAP_TILE_DATA[idx] = tileId;
          MAP_TILE_DATA[idx + 1] = 1; // isStatic = true
        }
      }
    }
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
