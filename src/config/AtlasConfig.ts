// SRC/config/AtlasConfig.ts
// Configuration for texture atlas support in floor rendering

export interface AtlasConfig {
  // Path to the atlas texture file (PNG, JPG, WebP, or KTX2)
  texturePath: string;
  
  // Number of tiles horizontally in the atlas
  tilesX: number;
  
  // Number of tiles vertically in the atlas
  tilesY: number;
  
  // Total number of tile types (tilesX * tilesY)
  get totalTiles(): number {
    return this.tilesX * this.tilesY;
  }
  
  // Size of each tile in UV space (0-1 range)
  get tileWidth(): number {
    return 1.0 / this.tilesX;
  }
  
  get tileHeight(): number {
    return 1.0 / this.tilesY;
  }
  
  /**
   * Get UV coordinates for a specific tile index
   * @param tileIndex - Tile index (0 to totalTiles-1), row-major order
   * @returns Object with uvOffset (u,v) and uvScale (u,v)
   */
  getTileUVs(tileIndex: number): { uvOffset: [number, number]; uvScale: [number, number] } {
    const clampedIndex = Math.max(0, Math.min(tileIndex, this.totalTiles - 1));
    const row = Math.floor(clampedIndex / this.tilesX);
    const col = clampedIndex % this.tilesX;
    
    return {
      uvOffset: [col * this.tileWidth, row * this.tileHeight],
      uvScale: [this.tileWidth, this.tileHeight]
    };
  }
}

/**
 * Default atlas configuration
 * Example: 4x4 grid = 16 different tile types
 * Adjust tilesX/tilesY based on your actual atlas image
 */
export const DEFAULT_ATLAS: AtlasConfig = {
  texturePath: 'assets/textures/atlas.png',
  tilesX: 4,
  tilesY: 4,
};

/**
 * Example: 8x8 grid = 64 different tile types
 */
export const LARGE_ATLAS: AtlasConfig = {
  texturePath: 'assets/textures/atlas_large.png',
  tilesX: 8,
  tilesY: 8,
};

/**
 * Example: 2x2 grid = 4 tile types (simple test atlas)
 */
export const SMALL_ATLAS: AtlasConfig = {
  texturePath: 'assets/textures/atlas_small.png',
  tilesX: 2,
  tilesY: 2,
};
