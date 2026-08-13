// src/config/FloorSystem.ts
// Multi-floor system with customizable floors and green chessboard texture

export interface FloorData {
  id: number;
  name: string;
  width: number;
  depth: number;
  tileSize: number;
  checkerSize: number;  // Size of each checker square in tiles
  color1: [number, number, number];  // Light green RGB
  color2: [number, number, number];  // Dark green RGB
}

export const DEFAULT_FLOOR_COUNT = 20;

// Default floor configuration - can be customized per floor
export function createFloorConfig(
  id: number,
  width: number = 10240,
  depth: number = 10240,
  tileSize: number = 64,
  checkerSize: number = 1,
  color1: [number, number, number] = [144, 238, 144],  // Light green
  color2: [number, number, number] = [34, 139, 34]     // Dark green
): FloorData {
  return {
    id,
    name: `Floor ${id + 1}`,
    width,
    depth,
    tileSize,
    checkerSize,
    color1,
    color2
  };
}

// Generate all floors with customizable settings
export function generateFloors(count: number = DEFAULT_FLOOR_COUNT): FloorData[] {
  const floors: FloorData[] = [];
  
  for (let i = 0; i < count; i++) {
    // Customize each floor - you can modify these parameters per floor
    const floor = createFloorConfig(
      i,
      10240,  // width
      10240,  // depth
      64,     // tileSize
      1,      // checkerSize (1 = single tile chessboard)
      [144 + i * 2, 238 - i * 3, 144 + i * 2],  // Slightly different green per floor
      [34, 139 - i * 2, 34]                      // Slightly different dark green per floor
    );
    floors.push(floor);
  }
  
  return floors;
}

// Pre-generated default floors
export const FLOORS = generateFloors(DEFAULT_FLOOR_COUNT);

// Current floor index (managed by FloorManager)
export let currentFloorIndex: number = 0;

export function setCurrentFloor(index: number): void {
  if (index >= 0 && index < FLOORS.length) {
    currentFloorIndex = index;
  }
}

export function getCurrentFloor(): FloorData {
  return FLOORS[currentFloorIndex];
}

export function getNextFloorIndex(): number {
  return Math.min(currentFloorIndex + 1, FLOORS.length - 1);
}

export function getPreviousFloorIndex(): number {
  return Math.max(currentFloorIndex - 1, 0);
}

export function getTotalFloorCount(): number {
  return FLOORS.length;
}
