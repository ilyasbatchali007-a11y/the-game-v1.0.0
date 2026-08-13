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
  // UV offset for independent texture positioning (chessboard pattern)
  uvOffsetX: number;
  uvOffsetY: number;
  // Floor elevation (Y position in 3D space)
  elevation: number;
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
  // UV offset for chessboard pattern (no offset for base floor)
  uvOffsetX: 0.0,
  uvOffsetY: 0.0,
  // Base floor at elevation 0
  elevation: 0.0,
};

// Additional floors with different sizes and UV offsets for green chessboard effect
export const createFloorConfigs = (): FloorConfig[] => {
  const floors: FloorConfig[] = [];
  
  // Base floor - large, no UV offset
  floors.push({
    ...ARENA_FLOOR,
    elevation: 0.0,
    uvOffsetX: 0.0,
    uvOffsetY: 0.0,
  });
  
  // Floor 1 - smaller, UV offset for checkerboard pattern
  floors.push({
    ...ARENA_FLOOR,
    width: 8192.0,
    depth: 8192.0,
    elevation: 50.0,
    uvOffsetX: 0.5,  // Offset by half a tile for checkerboard
    uvOffsetY: 0.5,
  });
  
  // Floor 2 - even smaller, different UV offset
  floors.push({
    ...ARENA_FLOOR,
    width: 6144.0,
    depth: 6144.0,
    elevation: 100.0,
    uvOffsetX: 0.25,
    uvOffsetY: 0.25,
  });
  
  // Floor 3 - smallest, another UV offset
  floors.push({
    ...ARENA_FLOOR,
    width: 4096.0,
    depth: 4096.0,
    elevation: 150.0,
    uvOffsetX: 0.75,
    uvOffsetY: 0.75,
  });
  
  return floors;
};

export const FLOOR_CONFIGS = createFloorConfigs();
