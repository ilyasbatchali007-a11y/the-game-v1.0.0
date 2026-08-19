// Re-export all floor-related modules for backward compatibility
export type { FloorConfig } from './FloorConfigTypes';
export { generateGreenChessboardTexture } from './FloorTextureGenerator';
export { ARENA_FLOOR, FLOORS } from './FloorDefinitions';
export { getFloorById, getFloorCount } from './FloorLookup';
