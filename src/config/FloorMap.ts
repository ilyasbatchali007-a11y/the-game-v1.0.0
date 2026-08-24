// FloorConfig interface now uses string for texturePath (can be URL or data URL)
export interface FloorConfig {
  id: number;  // Unique floor identifier (0-100)
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

// Generate green chessboard texture at module initialization
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

// Default floor dimensions match the world size (160 tiles x 64px = 10240px)
export const ARENA_FLOOR: FloorConfig = {
  id: 0,
  width: 10240.0,
  depth: 10240.0,
  texturePath: '/textures/atlas.png',
  repeatX: 160.0,
  repeatZ: 160.0,
  // Atlas configuration (enabled for floor 0)
  useAtlas: true,
  atlasTileCountX: 32,  // 32x32 grid in atlas
  atlasTileCountY: 32,
  staticTileRangeStart: 0,    // IDs 0-99 for static tiles (houses, paths)
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100, // IDs 100-1023 for random variations (grass, dirt)
  variationTileRangeEnd: 1023,
};

// Generate 101 floor configurations (IDs 0-100) with default 32x32 tile size
// Each floor has its own explicit configuration entry
export const FLOORS: FloorConfig[] = [
  // Floor 0 - Atlas floor (special case)
  {
    id: 0,
    width: 2048.0,
    depth: 2048.0,
    texturePath: '/textures/atlas.png',
    repeatX: 32.0,
    repeatZ: 32.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  // Floors 1-100 - Green chessboard floors
  { id: 1, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 2, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 3, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 4, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 5, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 6, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 7, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 8, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 9, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 10, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 11, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 12, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 13, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 14, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 15, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 16, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 17, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 18, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 19, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 20, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 21, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 22, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 23, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 24, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 25, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 26, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 27, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 28, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 29, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 30, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 31, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 32, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 33, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 34, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 35, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 36, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 37, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 38, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 39, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 40, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 41, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 42, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 43, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 44, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 45, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 46, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 47, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 48, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 49, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 50, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 51, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 52, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 53, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 54, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 55, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 56, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 57, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 58, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 59, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 60, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 61, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 62, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 63, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 64, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 65, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 66, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 67, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 68, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 69, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 70, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 71, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 72, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 73, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 74, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 75, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 76, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 77, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 78, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 79, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 80, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 81, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 82, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 83, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 84, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 85, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 86, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 87, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 88, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 89, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 90, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 91, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 92, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 93, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 94, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 95, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 96, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 97, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 98, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 99, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 100, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
];

// Get floor by ID (0-100)
export function getFloorById(id: number): FloorConfig {
  if (id < 0 || id >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${id}, using default floor 0`);
    return FLOORS[0];
  }
  return FLOORS[id];
}

// Get total number of available floors (101 floors: IDs 0-100)
export function getFloorCount(): number {
  return FLOORS.length;
}

// Helper function to customize a specific floor's dimensions
export function customizeFloor(
  floorId: number,
  widthInTiles: number,
  depthInTiles: number,
  texturePath?: string,
  useAtlas?: boolean
): void {
  if (floorId < 0 || floorId > 100) {
    console.error(`Cannot customize floor: ID ${floorId} is out of range (0-100)`);
    return;
  }

  const tileSize = 64; // Each tile is 64px
  FLOORS[floorId].width = widthInTiles * tileSize;
  FLOORS[floorId].depth = depthInTiles * tileSize;
  FLOORS[floorId].repeatX = widthInTiles;
  FLOORS[floorId].repeatZ = depthInTiles;

  if (texturePath !== undefined) {
    FLOORS[floorId].texturePath = texturePath;
  }

  if (useAtlas !== undefined) {
    FLOORS[floorId].useAtlas = useAtlas;
  }

  console.log(`Floor ${floorId} customized to ${widthInTiles}x${depthInTiles} tiles (${FLOORS[floorId].width}x${FLOORS[floorId].depth} pixels)`);
}
