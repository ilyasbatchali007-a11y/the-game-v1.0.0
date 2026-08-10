// src/config/FloorMap.ts
// Floor configuration for atlas texture system

export interface FloorConfig {
  width: number;
  depth: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  // Atlas-specific configuration
  atlasGridSize?: number;      // e.g., 32 for 32x32 grid
  atlasTilePixels?: number;    // e.g., 64 for 64px tiles in atlas
  staticTileStart?: number;    // Start of static tile range
  staticTileEnd?: number;      // End of static tile range
  variationTileStart?: number; // Start of variation tile range
  variationTileEnd?: number;   // End of variation tile range
}

// Floor dimensions match the world size (32 tiles x 64px = 2048px)
// Updated to use atlas texture with space in filename
export const ARENA_FLOOR: FloorConfig = {
  width: 2048.0,
  depth: 2048.0,
  texturePath: '/src/atlas pictures/atlas floor.png',
  repeatX: 32.0,
  repeatZ: 32.0,
  // Atlas configuration
  atlasGridSize: 32,
  atlasTilePixels: 64,
  staticTileStart: 0,
  staticTileEnd: 255,
  variationTileStart: 256,
  variationTileEnd: 1023,
};
