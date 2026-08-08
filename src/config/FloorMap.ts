// SRC/config/FloorMap.ts
export interface FloorConfig {
  width: number;
  depth: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  
  // Atlas support (optional - for varied tile types)
  useAtlas?: boolean;
  atlasConfig?: import('./AtlasConfig').AtlasConfig;
}

// Floor dimensions match the world size (32 tiles x 64px = 2048px)
export const ARENA_FLOOR: FloorConfig = {
  width: 2048.0,
  depth: 2048.0,
  texturePath: 'assets/textures/floor.png',
  repeatX: 32.0,
  repeatZ: 32.0,
  useAtlas: false, // Set to true when using atlas
};
