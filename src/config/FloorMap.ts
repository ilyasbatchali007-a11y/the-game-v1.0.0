// Floor Map Configuration for Atlas Texture Rendering
// Single draw call floor rendering with atlas-based tile variation

export interface FloorConfig {
  width: number;
  depth: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
}

// Floor dimensions match the world size (32 tiles x 64px = 2048px)
// Updated to use the atlas texture with space in filename
export const ARENA_FLOOR: FloorConfig = {
  width: 2048.0,
  depth: 2048.0,
  texturePath: 'src/atlas pictures/atlas floor.png',  // Note: filename includes space
  repeatX: 32.0,
  repeatZ: 32.0,
};

// Atlas configuration constants
export const ATLAS_CONFIG = {
  atlasSize: 2048,           // 2048x2048 pixels
  tileSize: 64,              // 64px per tile in atlas
  gridResolution: 32,        // 32x32 grid = 1024 tiles
  
  // Tile ID ranges in the atlas
  // 0-511: Random variation tiles (grass, dirt, etc.)
  // 512-1023: Static tiles (houses, paths, structures)
  variationStart: 0,
  variationEnd: 511,
  variationCount: 512,
  staticStart: 512,
  staticEnd: 1023,
  staticCount: 512,
  
  // World dimensions (in game tiles)
  worldTileWidth: 32,
  worldTileHeight: 32,
};
