export interface FloorConfig {
  id: number;
  name: string;
  width: number;
  depth: number;
  yLevel: number;  // Vertical position of this floor
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
  isChessboard: boolean;  // Use green chessboard pattern
}

// Small test floor sizes
const TEST_WIDTH = 512.0;   // 8 tiles x 64px
const TEST_DEPTH = 512.0;   // 8 tiles x 64px

// Floor 0 - Original arena floor (green grass atlas)
export const ARENA_FLOOR: FloorConfig = {
  id: 0,
  name: 'Arena',
  width: TEST_WIDTH,
  depth: TEST_DEPTH,
  yLevel: 0,
  texturePath: 'src/atlas pictures/atlas floor.jpg',
  repeatX: 8.0,
  repeatZ: 8.0,
  // Atlas configuration
  useAtlas: true,
  atlasTileCountX: 32,  // 32x32 grid in atlas
  atlasTileCountY: 32,
  staticTileRangeStart: 0,    // IDs 0-99 for static tiles (houses, paths)
  staticTileRangeEnd: 99,
  variationTileRangeStart: 100, // IDs 100-1023 for random variations (grass, dirt)
  variationTileRangeEnd: 1023,
  isChessboard: false,
};

// Floor 1 - Green chessboard pattern
export const CHESSBOARD_FLOOR: FloorConfig = {
  id: 1,
  name: 'Chessboard',
  width: TEST_WIDTH,
  depth: TEST_DEPTH,
  yLevel: 64,  // One tile height above arena floor
  texturePath: '',  // Generated procedurally
  repeatX: 8.0,
  repeatZ: 8.0,
  useAtlas: false,
  atlasTileCountX: 1,
  atlasTileCountY: 1,
  staticTileRangeStart: 0,
  staticTileRangeEnd: 0,
  variationTileRangeStart: 0,
  variationTileRangeEnd: 0,
  isChessboard: true,
};

// Array of all available floors
export const ALL_FLOORS: FloorConfig[] = [ARENA_FLOOR, CHESSBOARD_FLOOR];

// Get floor by ID
export function getFloorById(id: number): FloorConfig | null {
  return ALL_FLOORS.find(f => f.id === id) || null;
}

// Get total number of floors
export function getFloorCount(): number {
  return ALL_FLOORS.length;
}
