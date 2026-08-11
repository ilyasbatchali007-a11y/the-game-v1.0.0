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
  // Atlas configuration
  useAtlas: true,
  atlasTileCountX: 14,  // 14x13 grid in atlas
  atlasTileCountY: 13,
  staticTileRangeStart: 0,    // IDs 0-50 for static tiles (houses, paths, walls)
  staticTileRangeEnd: 50,
  variationTileRangeStart: 51, // IDs 51-181 for random variations (grass, dirt, stone)
  variationTileRangeEnd: 181,
};
