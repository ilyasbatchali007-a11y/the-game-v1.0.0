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

// Floor dimensions match the world size (32 tiles x 64px = 2048px)
export const ARENA_FLOOR: FloorConfig = {
  width: 2048.0,
  depth: 2048.0,
  texturePath: 'src/atlas pictures/atlas floor.jpg',
  repeatX: 32.0,
  repeatZ: 32.0,
  // Atlas configuration - supports 128 tile types (0-127)
  useAtlas: true,
  atlasTileCountX: 32,  // 32x32 grid in atlas (supports up to 1024 tiles)
  atlasTileCountY: 32,
  staticTileRangeStart: 0,    // IDs 0-99 for static tiles (includes green floor + debug colors)
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100, // IDs 100-127 for additional variations
  variationTileRangeEnd: 127,
};
