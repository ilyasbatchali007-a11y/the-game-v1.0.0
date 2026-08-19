import type { FloorConfig } from './FloorConfigTypes';
import { generateGreenChessboardTexture } from './FloorTextureGenerator';

const GREEN_CHESSBOARD_TEXTURE = generateGreenChessboardTexture();

/**
 * Arena floor configuration (Floor 0) - Uses atlas texture
 */
export const ARENA_FLOOR: FloorConfig = {
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
};

/**
 * Creates a floor configuration with green chessboard texture
 */
function createChessboardFloor(
  id: number,
  widthTiles: number,
  depthTiles: number
): FloorConfig {
  const tileSize = 64;
  return {
    id,
    width: widthTiles * tileSize,
    depth: depthTiles * tileSize,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: widthTiles,
    repeatZ: depthTiles,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  };
}

/**
 * All floor configurations (20 floors with varying sizes)
 */
export const FLOORS: FloorConfig[] = [
  ARENA_FLOOR,
  // Small arenas
  createChessboardFloor(1, 24, 24),
  createChessboardFloor(2, 48, 48),
  // Rectangular floors
  createChessboardFloor(3, 48, 24),
  createChessboardFloor(4, 24, 48),
  // Medium arenas
  createChessboardFloor(5, 30, 30),
  createChessboardFloor(6, 36, 36),
  createChessboardFloor(7, 45, 45),
  // Corridors and irregular shapes
  createChessboardFloor(8, 48, 24),
  createChessboardFloor(9, 28, 28),
  createChessboardFloor(10, 42, 26),
  createChessboardFloor(11, 26, 42),
  // Compact to massive
  createChessboardFloor(12, 32, 32),
  createChessboardFloor(13, 40, 40),
  createChessboardFloor(14, 48, 48),
  // Ultra wide/tall
  createChessboardFloor(15, 48, 24),
  createChessboardFloor(16, 24, 48),
  // Mini to jumbo
  createChessboardFloor(17, 24, 24),
  createChessboardFloor(18, 44, 44),
  // Custom asymmetric
  createChessboardFloor(19, 38, 30),
];
