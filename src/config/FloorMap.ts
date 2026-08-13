export interface FloorConfig {
  id: number;           // Customizable floor ID
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
  id: 0,
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

// Additional smaller floors with customizable IDs and sizes
// Floors 1-3 use a green chessboard pattern texture
export const SMALL_FLOOR_1: FloorConfig = {
  id: 1,
  width: 5120.0,   // Half the size of arena floor
  depth: 5120.0,
  texturePath: 'green-chessboard',  // Special identifier for procedural green chessboard
  repeatX: 80.0,
  repeatZ: 80.0,
  useAtlas: false,  // Use procedural texture instead of atlas
  atlasTileCountX: 32,
  atlasTileCountY: 32,
  staticTileRangeStart: 0,
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100,
  variationTileRangeEnd: 1023,
};

export const SMALL_FLOOR_2: FloorConfig = {
  id: 2,
  width: 2560.0,   // Quarter the size of arena floor
  depth: 2560.0,
  texturePath: 'green-chessboard',  // Special identifier for procedural green chessboard
  repeatX: 40.0,
  repeatZ: 40.0,
  useAtlas: false,  // Use procedural texture instead of atlas
  atlasTileCountX: 32,
  atlasTileCountY: 32,
  staticTileRangeStart: 0,
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100,
  variationTileRangeEnd: 1023,
};

export const SMALL_FLOOR_3: FloorConfig = {
  id: 3,
  width: 1280.0,   // Eighth the size of arena floor
  depth: 1280.0,
  texturePath: 'green-chessboard',  // Special identifier for procedural green chessboard
  repeatX: 20.0,
  repeatZ: 20.0,
  useAtlas: false,  // Use procedural texture instead of atlas
  atlasTileCountX: 32,
  atlasTileCountY: 32,
  staticTileRangeStart: 0,
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100,
  variationTileRangeEnd: 1023,
};

// Collection of all available floors for easy swapping
export const FLOORS: FloorConfig[] = [ARENA_FLOOR, SMALL_FLOOR_1, SMALL_FLOOR_2, SMALL_FLOOR_3];

/**
 * Get a floor configuration by ID
 * @param floorId - The ID of the floor to retrieve
 * @returns The floor configuration or ARENA_FLOOR if not found
 */
export function getFloorById(floorId: number): FloorConfig {
  const floor = FLOORS.find(f => f.id === floorId);
  return floor || ARENA_FLOOR;
}

/**
 * Create a custom floor configuration
 * @param id - Custom floor ID
 * @param width - Floor width (must be smaller than ARENA_FLOOR.width)
 * @param depth - Floor depth (must be smaller than ARENA_FLOOR.depth)
 * @param texturePath - Path to floor texture
 * @returns New FloorConfig
 */
export function createCustomFloor(
  id: number,
  width: number,
  depth: number,
  texturePath: string = 'src/atlas pictures/atlas floor.jpg'
): FloorConfig {
  // Ensure floor is smaller than the arena floor
  const clampedWidth = Math.min(width, ARENA_FLOOR.width - 64);
  const clampedDepth = Math.min(depth, ARENA_FLOOR.depth - 64);
  
  return {
    id,
    width: clampedWidth,
    depth: clampedDepth,
    texturePath,
    repeatX: clampedWidth / 64.0,
    repeatZ: clampedDepth / 64.0,
    useAtlas: true,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
  };
}
