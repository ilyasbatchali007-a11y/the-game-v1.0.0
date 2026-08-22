// src/engine/FloorSystem.ts
// Cohesive Floor System Module - Centralized floor tile management
// 
// This module consolidates all floor-related logic including:
// - Floor configurations (dimensions, textures, atlas settings)
// - Tile data management (MAP_DATA, MAP_TILE_DATA)
// - Atlas texture configuration and UV calculations
// - Floor switching and generation
// - Portal tile management
// - Tile collision and lookup helpers

// ============================================
// Configuration Interfaces
// ============================================

export interface FloorConfig {
  id: number;  // Unique floor identifier (0-19)
  width: number;
  depth: number;
  texturePath: string;  // URL path or base64 data URL
  repeatX: number;
  repeatZ: number;
  // Atlas texture settings
  useAtlas: boolean;
  atlasTileCountX: number;
  atlasTileCountY: number;
  staticTileRangeStart: number;
  staticTileRangeEnd: number;
  variationTileRangeStart: number;
  variationTileRangeEnd: number;
}

export interface AtlasConfig {
  imagePath: string;
  atlasSize: number;
  tilesPerRow: number;
  tilesPerCol: number;
  tileSizePixels: number;
  worldTileCountX: number;
  worldTileCountY: number;
  worldTileSizePixels: number;
  staticTileStart: number;
  staticTileEnd: number;
  variationTileStart: number;
  variationTileEnd: number;
  totalTiles: number;
}

export interface TileData {
  tileId: number;      // Which tile texture to use from the atlas
  isStatic: boolean;   // If true, use exact tileId; if false, use variation hashing
}

export interface FloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  floorId: number;
  useAtlas: boolean;
}

// ============================================
// Constants
// ============================================

export const TILE_SIZE = 64;
export const DEFAULT_MAP_COLS = 160;
export const DEFAULT_MAP_ROWS = 160;

export const ATLAS_CONFIG: AtlasConfig = {
  imagePath: 'src/atlas pictures/atlas floor.jpg',
  atlasSize: 2048,
  tilesPerRow: 32,
  tilesPerCol: 32,
  tileSizePixels: 64,
  worldTileCountX: 32,
  worldTileCountY: 32,
  worldTileSizePixels: 64,
  staticTileStart: 0,
  staticTileEnd: 99,
  variationTileStart: 100,
  variationTileEnd: 1023,
  totalTiles: 1024,
};

// ============================================
// Floor Configurations
// ============================================

let GREEN_CHESSBOARD_TEXTURE = '';
if (typeof document !== 'undefined') {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const halfSize = 32;
    ctx.fillStyle = '#4a7c23';
    ctx.fillRect(0, 0, halfSize, halfSize);
    ctx.fillRect(halfSize, halfSize, halfSize, halfSize);
    ctx.fillStyle = '#2d5a1a';
    ctx.fillRect(halfSize, 0, halfSize, halfSize);
    ctx.fillRect(0, halfSize, halfSize, halfSize);
    GREEN_CHESSBOARD_TEXTURE = canvas.toDataURL('image/png');
  }
}

export const FLOORS: FloorConfig[] = [
  // Floor 0 - Original Arena (160x160 tiles) - Uses Atlas Texture
  {
    id: 0,
    width: 10240.0,
    depth: 10240.0,
    texturePath: '/textures/atlas.png',
    repeatX: 160.0,
    repeatZ: 160.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 1 - Small Arena (24x24 tiles)
  {
    id: 1,
    width: 1536.0,
    depth: 1536.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 24.0,
    repeatZ: 24.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 2 - Large Arena (48x48 tiles)
  {
    id: 2,
    width: 3072.0,
    depth: 3072.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 48.0,
    repeatZ: 48.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 3 - Wide Rectangle (48x24 tiles)
  {
    id: 3,
    width: 3072.0,
    depth: 1536.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 48.0,
    repeatZ: 24.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 4 - Tall Rectangle (24x48 tiles)
  {
    id: 4,
    width: 1536.0,
    depth: 3072.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 24.0,
    repeatZ: 48.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 5 - Tiny Arena (30x30 tiles)
  {
    id: 5,
    width: 1920.0,
    depth: 1920.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 30.0,
    repeatZ: 30.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 6 - Medium Arena (36x36 tiles)
  {
    id: 6,
    width: 2304.0,
    depth: 2304.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 36.0,
    repeatZ: 36.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 7 - Extra Large (45x45 tiles)
  {
    id: 7,
    width: 2880.0,
    depth: 2880.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 45.0,
    repeatZ: 45.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 8 - Long Corridor (48x24 tiles)
  {
    id: 8,
    width: 3072.0,
    depth: 1536.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 48.0,
    repeatZ: 24.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 9 - Square Small (28x28 tiles)
  {
    id: 9,
    width: 1792.0,
    depth: 1792.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 28.0,
    repeatZ: 28.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 10 - Irregular Wide (42x26 tiles)
  {
    id: 10,
    width: 2688.0,
    depth: 1664.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 42.0,
    repeatZ: 26.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 11 - Irregular Tall (26x42 tiles)
  {
    id: 11,
    width: 1664.0,
    depth: 2688.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 26.0,
    repeatZ: 42.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 12 - Compact (32x32 tiles)
  {
    id: 12,
    width: 2048.0,
    depth: 2048.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 32.0,
    repeatZ: 32.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 13 - Extended (40x40 tiles)
  {
    id: 13,
    width: 2560.0,
    depth: 2560.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 40.0,
    repeatZ: 40.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 14 - Massive (48x48 tiles)
  {
    id: 14,
    width: 3072.0,
    depth: 3072.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 48.0,
    repeatZ: 48.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 15 - Ultra Wide (48x24 tiles)
  {
    id: 15,
    width: 3072.0,
    depth: 1536.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 48.0,
    repeatZ: 24.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 16 - Ultra Tall (24x48 tiles)
  {
    id: 16,
    width: 1536.0,
    depth: 3072.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 24.0,
    repeatZ: 48.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 17 - Mini (24x24 tiles)
  {
    id: 17,
    width: 1536.0,
    depth: 1536.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 24.0,
    repeatZ: 24.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 18 - Jumbo (44x44 tiles)
  {
    id: 18,
    width: 2816.0,
    depth: 2816.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 44.0,
    repeatZ: 44.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floor 19 - Custom Asymmetric (38x30 tiles)
  {
    id: 19,
    width: 2432.0,
    depth: 1920.0,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: 38.0,
    repeatZ: 30.0,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
];

// ============================================
// State Management
// ============================================

let CURRENT_MAP_COLS = DEFAULT_MAP_COLS;
let CURRENT_MAP_ROWS = DEFAULT_MAP_ROWS;
let CURRENT_FLOOR_ID = 0;

// Tile data arrays
export let MAP_DATA = new Uint8Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS);
export let MAP_TILE_DATA = new Float32Array(DEFAULT_MAP_COLS * DEFAULT_MAP_ROWS * 2);

// ============================================
// Helper Functions
// ============================================

export function getCurrentWorldWidth(): number {
  return CURRENT_MAP_COLS * TILE_SIZE;
}

export function getCurrentWorldHeight(): number {
  return CURRENT_MAP_ROWS * TILE_SIZE;
}

export function getCurrentMapCols(): number {
  return CURRENT_MAP_COLS;
}

export function getCurrentMapRows(): number {
  return CURRENT_MAP_ROWS;
}

export function getCurrentFloorId(): number {
  return CURRENT_FLOOR_ID;
}

export function getFloorById(id: number): FloorConfig {
  if (id < 0 || id >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${id}, using default floor 0`);
    return FLOORS[0];
  }
  return FLOORS[id];
}

export function getFloorCount(): number {
  return FLOORS.length;
}

export function getFloorConfig(floorId: number): FloorConfig | null {
  if (floorId < 0 || floorId >= FLOORS.length) {
    return null;
  }
  return FLOORS[floorId];
}

// ============================================
// Atlas Helper Functions
// ============================================

export function getTileUV(tileId: number): { u: number; v: number } {
  const row = Math.floor(tileId / ATLAS_CONFIG.tilesPerRow);
  const col = tileId % ATLAS_CONFIG.tilesPerRow;
  
  const u = col / ATLAS_CONFIG.tilesPerRow;
  const v = row / ATLAS_CONFIG.tilesPerCol;
  
  return { u, v };
}

export function getTileUVSize(): { uSize: number; vSize: number } {
  return {
    uSize: 1.0 / ATLAS_CONFIG.tilesPerRow,
    vSize: 1.0 / ATLAS_CONFIG.tilesPerCol,
  };
}

// ============================================
// Map Generation
// ============================================

export function generateTestMap(floorConfig?: { cols: number; rows: number; useAtlas: boolean }): void {
  const cols = floorConfig?.cols || DEFAULT_MAP_COLS;
  const rows = floorConfig?.rows || DEFAULT_MAP_ROWS;
  const useAtlas = floorConfig?.useAtlas ?? true;
  
  CURRENT_MAP_COLS = cols;
  CURRENT_MAP_ROWS = rows;
  
  MAP_DATA = new Uint8Array(cols * rows);
  MAP_TILE_DATA = new Float32Array(cols * rows * 2);
  
  if (useAtlas) {
    // Floor 0 - Atlas texture, solid floor with no voids
    MAP_DATA.fill(0);
    MAP_TILE_DATA.fill(0);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const dataIdx = idx * 2;
        
        MAP_DATA[idx] = 0;
        MAP_TILE_DATA[dataIdx] = 100;
        MAP_TILE_DATA[dataIdx + 1] = 0;
      }
    }
    
    addPortalTiles(cols, rows);
    
  } else {
    // Floors 1-19 - Green chessboard pattern
    MAP_DATA.fill(0);
    MAP_TILE_DATA.fill(0);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const idx = row * cols + col;
        const dataIdx = idx * 2;
        
        MAP_DATA[idx] = 0;
        MAP_TILE_DATA[dataIdx] = 0;
        MAP_TILE_DATA[dataIdx + 1] = 1;
      }
    }
    
    addPortalTiles(cols, rows);
  }
}

function addPortalTiles(cols: number, rows: number): void {
  const spawnCol = Math.floor(cols / 2);
  const spawnRow = Math.floor(rows / 2);
  
  const nextPortalCol = spawnCol + 2;
  const nextPortalRow = spawnRow;
  if (nextPortalCol < cols && nextPortalRow < rows) {
    const nextPortalIdx = nextPortalRow * cols + nextPortalCol;
    MAP_TILE_DATA[nextPortalIdx * 2] = 1000;
    MAP_TILE_DATA[nextPortalIdx * 2 + 1] = 1;
  }
  
  const prevPortalCol = spawnCol - 2;
  const prevPortalRow = spawnRow;
  if (prevPortalCol >= 0 && prevPortalRow < rows) {
    const prevPortalIdx = prevPortalRow * cols + prevPortalCol;
    MAP_TILE_DATA[prevPortalIdx * 2] = 1001;
    MAP_TILE_DATA[prevPortalIdx * 2 + 1] = 1;
  }
}

// ============================================
// Collision & Tile Lookup
// ============================================

export function isTileBlocking(col: number, row: number): boolean {
  if (col < 0 || col >= CURRENT_MAP_COLS || row < 0 || row >= CURRENT_MAP_ROWS) {
    return true;
  }
  return MAP_DATA[row * CURRENT_MAP_COLS + col] === 2;
}

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

export function getTileData(col: number, row: number): { tileId: number; isStatic: number } {
  if (col < 0 || col >= CURRENT_MAP_COLS || row < 0 || row >= CURRENT_MAP_ROWS) {
    return { tileId: 0, isStatic: 1 };
  }
  const idx = (row * CURRENT_MAP_COLS + col) * 2;
  return {
    tileId: MAP_TILE_DATA[idx],
    isStatic: MAP_TILE_DATA[idx + 1]
  };
}

// ============================================
// Floor Switching
// ============================================

export function switchFloor(floorId: number): boolean {
  if (floorId < 0 || floorId >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${floorId}. Must be between 0 and ${FLOORS.length - 1}`);
    return false;
  }
  
  CURRENT_FLOOR_ID = floorId;
  const floorConfig = FLOORS[floorId];
  
  const cols = Math.floor(floorConfig.width / TILE_SIZE);
  const rows = Math.floor(floorConfig.depth / TILE_SIZE);
  
  generateTestMap({
    cols,
    rows,
    useAtlas: floorConfig.useAtlas
  });
  
  console.log(`[FloorSystem] Switched to Floor ${floorId} (${cols}x${rows} tiles, ${floorConfig.width}x${floorConfig.depth}px)`);
  return true;
}

export function getFloorRenderData(floorId: number): FloorRenderData | null {
  const config = getFloorConfig(floorId);
  if (!config) return null;
  
  return {
    x: 0,
    y: 0,
    width: config.width,
    height: config.depth,
    texturePath: config.texturePath,
    repeatX: config.repeatX,
    repeatZ: config.repeatZ,
    floorId: config.id,
    useAtlas: config.useAtlas
  };
}
