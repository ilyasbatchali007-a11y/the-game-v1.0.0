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
  // Multi-floor support
  elevation: number;        // Y position offset for this floor (for stacking floors)
  layerIndex: number;       // Render order (lower = rendered first)
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
  // Multi-floor support
  elevation: 0.0,
  layerIndex: 0,
};

/**
 * Create a custom floor configuration with customizable properties
 * @param options Partial floor config to override defaults
 */
export function createFloorConfig(options: Partial<FloorConfig> & { texturePath: string }): FloorConfig {
  return {
    width: options.width ?? 10240.0,
    depth: options.depth ?? 10240.0,
    texturePath: options.texturePath,
    repeatX: options.repeatX ?? 160.0,
    repeatZ: options.repeatZ ?? 160.0,
    useAtlas: options.useAtlas ?? false,
    atlasTileCountX: options.atlasTileCountX ?? 1,
    atlasTileCountY: options.atlasTileCountY ?? 1,
    staticTileRangeStart: options.staticTileRangeStart ?? 0,
    staticTileRangeEnd: options.staticTileRangeEnd ?? 0,
    variationTileRangeStart: options.variationTileRangeStart ?? 0,
    variationTileRangeEnd: options.variationTileRangeEnd ?? 0,
    elevation: options.elevation ?? 0.0,
    layerIndex: options.layerIndex ?? 0,
  };
}
