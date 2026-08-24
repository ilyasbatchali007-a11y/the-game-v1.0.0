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
export const FLOORS: FloorConfig[] = [
  // Floor 0 - Atlas floor (105x105 tiles)
  {
    id: 0,
    width: 6720.0,
    depth: 6720.0,
    texturePath: '/textures/atlas.png',
    repeatX: 105.0,
    repeatZ: 105.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  },
  { id: 1, width: 9088.0, depth: 9088.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 142.0, repeatZ: 142.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 2, width: 7552.0, depth: 7552.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 118.0, repeatZ: 118.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 3, width: 12096.0, depth: 12096.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 189.0, repeatZ: 189.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 4, width: 8384.0, depth: 8384.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 131.0, repeatZ: 131.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 5, width: 10688.0, depth: 10688.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 167.0, repeatZ: 167.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 6, width: 7168.0, depth: 7168.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 112.0, repeatZ: 112.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 7, width: 12480.0, depth: 12480.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 195.0, repeatZ: 195.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 8, width: 7936.0, depth: 7936.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 124.0, repeatZ: 124.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 9, width: 9792.0, depth: 9792.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 153.0, repeatZ: 153.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 10, width: 11392.0, depth: 11392.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 178.0, repeatZ: 178.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 11, width: 6976.0, depth: 6976.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 109.0, repeatZ: 109.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 12, width: 11776.0, depth: 11776.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 184.0, repeatZ: 184.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 13, width: 8896.0, depth: 8896.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 139.0, repeatZ: 139.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 14, width: 10304.0, depth: 10304.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 161.0, repeatZ: 161.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 15, width: 7360.0, depth: 7360.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 115.0, repeatZ: 115.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 16, width: 12672.0, depth: 12672.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 198.0, repeatZ: 198.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 17, width: 9408.0, depth: 9408.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 147.0, repeatZ: 147.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 18, width: 8128.0, depth: 8128.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 127.0, repeatZ: 127.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 19, width: 11072.0, depth: 11072.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 173.0, repeatZ: 173.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 20, width: 6528.0, depth: 6528.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 102.0, repeatZ: 102.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 21, width: 10112.0, depth: 10112.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 158.0, repeatZ: 158.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 22, width: 8640.0, depth: 8640.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 135.0, repeatZ: 135.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 23, width: 12224.0, depth: 12224.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 191.0, repeatZ: 191.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 24, width: 7744.0, depth: 7744.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 121.0, repeatZ: 121.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 25, width: 10496.0, depth: 10496.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 164.0, repeatZ: 164.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 26, width: 9216.0, depth: 9216.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 144.0, repeatZ: 144.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 27, width: 11584.0, depth: 11584.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 181.0, repeatZ: 181.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 28, width: 6848.0, depth: 6848.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 107.0, repeatZ: 107.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 29, width: 9600.0, depth: 9600.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 150.0, repeatZ: 150.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 30, width: 10880.0, depth: 10880.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 170.0, repeatZ: 170.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 31, width: 7232.0, depth: 7232.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 113.0, repeatZ: 113.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 32, width: 12544.0, depth: 12544.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 196.0, repeatZ: 196.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 33, width: 8768.0, depth: 8768.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 137.0, repeatZ: 137.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 34, width: 9984.0, depth: 9984.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 156.0, repeatZ: 156.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 35, width: 8256.0, depth: 8256.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 129.0, repeatZ: 129.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 36, width: 11968.0, depth: 11968.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 187.0, repeatZ: 187.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 37, width: 6656.0, depth: 6656.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 104.0, repeatZ: 104.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 38, width: 10752.0, depth: 10752.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 168.0, repeatZ: 168.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 39, width: 9024.0, depth: 9024.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 141.0, repeatZ: 141.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 40, width: 11200.0, depth: 11200.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 175.0, repeatZ: 175.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 41, width: 7616.0, depth: 7616.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 119.0, repeatZ: 119.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 42, width: 12352.0, depth: 12352.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 193.0, repeatZ: 193.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 43, width: 9536.0, depth: 9536.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 149.0, repeatZ: 149.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 44, width: 8064.0, depth: 8064.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 126.0, repeatZ: 126.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 45, width: 10368.0, depth: 10368.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 162.0, repeatZ: 162.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 46, width: 6912.0, depth: 6912.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 108.0, repeatZ: 108.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 47, width: 11712.0, depth: 11712.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 183.0, repeatZ: 183.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 48, width: 8512.0, depth: 8512.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 133.0, repeatZ: 133.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 49, width: 11328.0, depth: 11328.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 177.0, repeatZ: 177.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 50, width: 7424.0, depth: 7424.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 116.0, repeatZ: 116.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 51, width: 12160.0, depth: 12160.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 190.0, repeatZ: 190.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 52, width: 9728.0, depth: 9728.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 152.0, repeatZ: 152.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 53, width: 7872.0, depth: 7872.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 123.0, repeatZ: 123.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 54, width: 10624.0, depth: 10624.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 166.0, repeatZ: 166.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 55, width: 6464.0, depth: 6464.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 101.0, repeatZ: 101.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 56, width: 11840.0, depth: 11840.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 185.0, repeatZ: 185.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 57, width: 9280.0, depth: 9280.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 145.0, repeatZ: 145.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 58, width: 10944.0, depth: 10944.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 171.0, repeatZ: 171.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 59, width: 8320.0, depth: 8320.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 130.0, repeatZ: 130.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 60, width: 12736.0, depth: 12736.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 199.0, repeatZ: 199.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 61, width: 7040.0, depth: 7040.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 110.0, repeatZ: 110.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 62, width: 9920.0, depth: 9920.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 155.0, repeatZ: 155.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 63, width: 11456.0, depth: 11456.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 179.0, repeatZ: 179.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 64, width: 8832.0, depth: 8832.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 138.0, repeatZ: 138.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 65, width: 10432.0, depth: 10432.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 163.0, repeatZ: 163.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 66, width: 7680.0, depth: 7680.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 120.0, repeatZ: 120.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 67, width: 12608.0, depth: 12608.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 197.0, repeatZ: 197.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 68, width: 9472.0, depth: 9472.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 148.0, repeatZ: 148.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 69, width: 6784.0, depth: 6784.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 106.0, repeatZ: 106.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 70, width: 11136.0, depth: 11136.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 174.0, repeatZ: 174.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 71, width: 8576.0, depth: 8576.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 134.0, repeatZ: 134.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 72, width: 12032.0, depth: 12032.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 188.0, repeatZ: 188.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 73, width: 7488.0, depth: 7488.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 117.0, repeatZ: 117.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 74, width: 10240.0, depth: 10240.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 160.0, repeatZ: 160.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 75, width: 9152.0, depth: 9152.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 143.0, repeatZ: 143.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 76, width: 12800.0, depth: 12800.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 200.0, repeatZ: 200.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 77, width: 8000.0, depth: 8000.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 125.0, repeatZ: 125.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 78, width: 11648.0, depth: 11648.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 182.0, repeatZ: 182.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 79, width: 6592.0, depth: 6592.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 103.0, repeatZ: 103.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 80, width: 10048.0, depth: 10048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 157.0, repeatZ: 157.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 81, width: 8704.0, depth: 8704.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 136.0, repeatZ: 136.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 82, width: 12288.0, depth: 12288.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 192.0, repeatZ: 192.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 83, width: 7296.0, depth: 7296.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 114.0, repeatZ: 114.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 84, width: 10816.0, depth: 10816.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 169.0, repeatZ: 169.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 85, width: 9344.0, depth: 9344.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 146.0, repeatZ: 146.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 86, width: 11264.0, depth: 11264.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 176.0, repeatZ: 176.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 87, width: 7808.0, depth: 7808.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 122.0, repeatZ: 122.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 88, width: 12416.0, depth: 12416.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 194.0, repeatZ: 194.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 89, width: 8960.0, depth: 8960.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 140.0, repeatZ: 140.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 90, width: 10560.0, depth: 10560.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 165.0, repeatZ: 165.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 91, width: 7104.0, depth: 7104.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 111.0, repeatZ: 111.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 92, width: 11904.0, depth: 11904.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 186.0, repeatZ: 186.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 93, width: 8192.0, depth: 8192.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 128.0, repeatZ: 128.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 94, width: 9856.0, depth: 9856.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 154.0, repeatZ: 154.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 95, width: 11520.0, depth: 11520.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 180.0, repeatZ: 180.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 96, width: 6400.0, depth: 6400.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 100.0, repeatZ: 100.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 97, width: 9664.0, depth: 9664.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 151.0, repeatZ: 151.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 98, width: 11008.0, depth: 11008.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 172.0, repeatZ: 172.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 99, width: 8448.0, depth: 8448.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 132.0, repeatZ: 132.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 },
  { id: 100, width: 2048.0, depth: 2048.0, texturePath: GREEN_CHESSBOARD_TEXTURE, repeatX: 32.0, repeatZ: 32.0, useAtlas: false, atlasTileCountX: 32, atlasTileCountY: 32, staticTileRangeStart: 0, staticTileRangeEnd: 99, variationTileRangeStart: 100, variationTileRangeEnd: 1023 }
];

// Helper functions to get floor information
export function getFloorById(id: number): FloorConfig | undefined {
  return FLOORS.find(floor => floor.id === id);
}

export function getFloorCount(): number {
  return FLOORS.length;
}
