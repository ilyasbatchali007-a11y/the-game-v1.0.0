// FloorConfig interface now uses string for texturePath (can be URL or data URL)
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

// Generate 20 independent floor configurations with customized sizes
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
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
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
];

// Get floor by ID (0-19)
export function getFloorById(id: number): FloorConfig {
  if (id < 0 || id >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${id}, using default floor 0`);
    return FLOORS[0];
  }
  return FLOORS[id];
}

// Get total number of available floors
export function getFloorCount(): number {
  return FLOORS.length;
}
