import { FLOORS } from './FloorDefinitions';
import type { FloorConfig } from './FloorConfigTypes';

/**
 * Retrieves a floor configuration by its ID
 * @param id - Floor identifier (0-19)
 * @returns FloorConfig or default floor 0 if ID is invalid
 */
export function getFloorById(id: number): FloorConfig {
  if (id < 0 || id >= FLOORS.length) {
    console.warn(`Invalid floor ID: ${id}, using default floor 0`);
    return FLOORS[0];
  }
  return FLOORS[id];
}

/**
 * Returns the total number of available floor configurations
 */
export function getFloorCount(): number {
  return FLOORS.length;
}
