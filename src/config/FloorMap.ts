export interface FloorConfig {
  width: number;
  depth: number;
  texturePath: string;
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

// Floor dimensions match the world size (160 tiles x 64px = 10240px)
export const ARENA_FLOOR: FloorConfig = {
  width: 10240.0,
  depth: 10240.0,
  texturePath: 'src/atlas pictures/atlas floor.jpg',
  repeatX: 160.0,
  repeatZ: 160.0,
  // Atlas configuration
  useAtlas: true,
  atlasTileCountX: 32,  // 32x32 grid in atlas
  atlasTileCountY: 32,
  staticTileRangeStart: 0,    // IDs 0-99 for static tiles (houses, paths)
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100, // IDs 100-1023 for random variations (grass, dirt)
  variationTileRangeEnd: 1023,
};

// Green chessboard texture floors (19 additional floors)
// Sizes vary between 30*30 to 40*40 tiles (each tile is 64px)
const TILE_SIZE = 64;

export interface ExtraFloor {
  id: number;
  width: number;
  depth: number;
  yLevel: number;  // Height level for this floor
  texturePath: string;
  repeatX: number;
  repeatZ: number;
}

// Generate 19 extra floors with varying sizes and green chessboard texture
export const EXTRA_FLOORS: ExtraFloor[] = [];

// Create green chessboard pattern texture data URL
const GREEN_CHECKERBOARD_SIZE = 128; // 2x2 tiles of 64px each
const GREEN_LIGHT = '#2d5a27';
const GREEN_DARK = '#1a3d17';

function createGreenChessboardTexture(): string {
  const canvas = document.createElement('canvas');
  canvas.width = GREEN_CHECKERBOARD_SIZE;
  canvas.height = GREEN_CHECKERBOARD_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  const tileSize = GREEN_CHECKERBOARD_SIZE / 2;
  
  // Draw checkerboard pattern
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? GREEN_LIGHT : GREEN_DARK;
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
  
  return canvas.toDataURL('image/png');
}

// Store the generated texture URL
const GREEN_CHECKERBOARD_TEXTURE = createGreenChessboardTexture();

// Generate 19 floors with varying sizes
for (let i = 0; i < 19; i++) {
  // Vary size between 30 and 40 tiles
  const sizeVariation = 30 + (i % 11); // Cycles through 30-40
  const width = sizeVariation * TILE_SIZE;
  const depth = sizeVariation * TILE_SIZE;
  
  EXTRA_FLOORS.push({
    id: i,
    width: width,
    depth: depth,
    yLevel: (i + 1) * 200, // Each floor is 200 units above the previous
    texturePath: GREEN_CHECKERBOARD_TEXTURE,
    repeatX: sizeVariation,
    repeatZ: sizeVariation,
  });
}

// Total floors including the main arena floor
export const TOTAL_FLOORS = EXTRA_FLOORS.length + 1;
