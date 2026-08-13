// src/config/AtlasConfig.ts
// Configuration for the texture atlas system

export const ATLAS_CONFIG = {
  // Atlas image settings
  imagePath: 'src/atlas pictures/atlas floor.jpg',
  atlasSize: 2048,           // 2048x2048 pixels
  
  // Grid layout within atlas
  tilesPerRow: 32,           // 32 tiles per row
  tilesPerCol: 32,           // 32 tiles per column
  tileSizePixels: 64,        // Each tile is 64x64 pixels in the atlas
  
  // Game world settings
  worldTileCountX: 32,       // 32x32 game tiles
  worldTileCountY: 32,
  worldTileSizePixels: 64,   // Each game tile renders as 64x64 pixels
  
  // Tile ID ranges in atlas
  // Static tiles: IDs 0-99 (for houses, paths, structures - manually placed)
  staticTileStart: 0,
  staticTileEnd: 99,
  
  // Special teleporter tiles
  teleporterUpId: 19,      // UP teleporter tile (RED - RGB 206, 69, 60)
  teleporterDownId: 29,    // DOWN teleporter tile (BLUE - RGB 59, 137, 208)
  
  // Random variation tiles: IDs 100-1023 (for grass, dirt, etc. - auto-selected by hash)
  variationTileStart: 100,
  variationTileEnd: 1023,
  
  // Total tiles available: 32*32 = 1024
  totalTiles: 1024,
};

// Helper: Convert tile ID to UV coordinates in atlas
export function getTileUV(tileId: number): { u: number; v: number } {
  const row = Math.floor(tileId / ATLAS_CONFIG.tilesPerRow);
  const col = tileId % ATLAS_CONFIG.tilesPerRow;
  
  // Normalize to [0, 1] UV space
  const u = col / ATLAS_CONFIG.tilesPerRow;
  const v = row / ATLAS_CONFIG.tilesPerCol;
  
  return { u, v };
}

// Helper: Get tile size in UV space
export function getTileUVSize(): { uSize: number; vSize: number } {
  return {
    uSize: 1.0 / ATLAS_CONFIG.tilesPerRow,
    vSize: 1.0 / ATLAS_CONFIG.tilesPerCol,
  };
}
