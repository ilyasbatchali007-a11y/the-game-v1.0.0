// FloorConfig interface now uses string for texturePath (can be URL or data URL)
export interface FloorConfig {
  id: number;  // Unique floor identifier (0-99)
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
  // NEW: Docking System - Connection points for graph navigation
  connectionPoints: ConnectionPoint[];
}

export enum Direction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  UP = 'UP',
  DOWN = 'DOWN',
}

export interface ConnectionPoint {
  direction: Direction;
  targetFloorId: number;
  type: 'HORIZONTAL' | 'VERTICAL';
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

// Standard floor size for testing: 32x32 tiles (2048x2048 units)
const STANDARD_FLOOR_SIZE = 2048.0;
const STANDARD_TILE_COUNT = 32.0;

// Helper function to create a standard floor config
function createStandardFloor(id: number): FloorConfig {
  return {
    id,
    width: STANDARD_FLOOR_SIZE,
    depth: STANDARD_FLOOR_SIZE,
    texturePath: GREEN_CHESSBOARD_TEXTURE,
    repeatX: STANDARD_TILE_COUNT,
    repeatZ: STANDARD_TILE_COUNT,
    useAtlas: false,
    atlasTileCountX: 32,
    atlasTileCountY: 32,
    staticTileRangeStart: 0,
    staticTileRangeEnd: 99,
    variationTileRangeStart: 100,
    variationTileRangeEnd: 1023,
    connectionPoints: [], // Will be populated by graph generator
  };
}

// Generate graph connections for all floors
function generateFloorGraph(totalFloors: number): void {
  for (let i = 0; i < totalFloors; i++) {
    const current = FLOORS[i];
    const assignedDirections = new Set<Direction>();

    // A. Backbone Connection (Ensure linear progression 0->1->2...)
    if (i < totalFloors - 1) {
      // Connect DOWN to next floor
      current.connectionPoints.push({ 
        direction: Direction.DOWN, 
        targetFloorId: i + 1, 
        type: 'VERTICAL' 
      });
      assignedDirections.add(Direction.DOWN);
      
      // Connect UP from next floor back to current
      FLOORS[i + 1].connectionPoints.push({ 
        direction: Direction.UP, 
        targetFloorId: i, 
        type: 'VERTICAL' 
      });
    }

    // B. Random Horizontal Shortcuts (The "6 Types" Logic)
    // Add 1-2 random edge connections for variety (skip floor 0 start)
    if (i > 0) {
      const possibleDirs = [Direction.LEFT, Direction.RIGHT, Direction.TOP, Direction.BOTTOM];
      const availableDirs = possibleDirs.filter(d => !assignedDirections.has(d));
      
      const numConnections = Math.floor(Math.random() * 2) + 1; 
      
      for (let j = 0; j < numConnections && availableDirs.length > 0; j++) {
        const randIndex = Math.floor(Math.random() * availableDirs.length);
        const dir = availableDirs.splice(randIndex, 1)[0];
        
        // Find a random target floor (not immediate neighbor)
        let targetId = Math.floor(Math.random() * totalFloors);
        if (targetId === i || targetId === i - 1 || targetId === i + 1) {
          targetId = (i + 5) % totalFloors;
        }
        
        current.connectionPoints.push({ 
          direction: dir, 
          targetFloorId: targetId, 
          type: 'HORIZONTAL' 
        });
      }
    }
  }
}

// Generate 100 floor configurations - all uniform 32x32 tiles for testing
export const FLOORS: FloorConfig[] = [
  // Floor 0 - Original Arena (kept as is for reference)
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
    connectionPoints: [], // Will be populated by graph generator
  },
  // Floors 1-99: All uniform 32x32 tiles (2048x2048 units) for consistent testing
  ...Array.from({ length: 99 }, (_, i) => createStandardFloor(i + 1)),
];

// Initialize graph connections after creating all floors
generateFloorGraph(FLOORS.length);

// Export ARENA_FLOOR for backward compatibility (Floor 0)
export const ARENA_FLOOR: FloorConfig = FLOORS[0];

// Get floor by ID (0-99)
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
