/**
 * Atlas Configuration
 * Defines how the 2048x2048 atlas texture is divided into tiles
 * 
 * Atlas specs:
 * - Image size: 2048x2048 pixels
 * - Tile size: 64x64 pixels (high quality, scaled down to 32px in-game)
 * - Grid: 32x32 tiles = 1024 unique tiles total
 */

export interface AtlasTile {
  /** Unique ID for this tile type (e.g., 'grass_1', 'house_floor') */
  id: string;
  /** Grid column (0-31) */
  col: number;
  /** Grid row (0-31) */
  row: number;
  /** Is this a static tile? (false = random variation allowed) */
  isStatic: boolean;
  /** For random tiles: list of alternative tile IDs to choose from */
  variations?: string[];
}

export interface AtlasConfig {
  /** Path to the atlas image file */
  imagePath: string;
  /** Total columns in the atlas grid */
  columns: number;
  /** Total rows in the atlas grid */
  rows: number;
  /** Size of each tile in pixels (in the atlas image) */
  tileSize: number;
  /** Map of tile type names to their atlas positions */
  tiles: Record<string, AtlasTile>;
  /** Default tile ID to use when none specified */
  defaultTile: string;
}

/**
 * Main floor atlas configuration
 * Place your 'atlas floor.png' (2048x2048) in /src/atlas pictures/
 */
export const FLOOR_ATLAS: AtlasConfig = {
  imagePath: 'src/atlas pictures/atlas floor.png',
  columns: 32,
  rows: 32,
  tileSize: 64,
  defaultTile: 'grass_1',
  tiles: {
    // =====================
    // STATIC TILES (isStatic: true)
    // These always use the exact same UV coordinates
    // =====================
    
    // House floors - dedicated slots
    'house_floor_wood': {
      id: 'house_floor_wood',
      col: 0,
      row: 0,
      isStatic: true,
    },
    'house_floor_stone': {
      id: 'house_floor_stone',
      col: 1,
      row: 0,
      isStatic: true,
    },
    'house_floor_tile': {
      id: 'house_floor_tile',
      col: 2,
      row: 0,
      isStatic: true,
    },
    
    // Paths and roads
    'path_stone': {
      id: 'path_stone',
      col: 3,
      row: 0,
      isStatic: true,
    },
    'path_dirt': {
      id: 'path_dirt',
      col: 4,
      row: 0,
      isStatic: true,
    },
    'road_cobblestone': {
      id: 'road_cobblestone',
      col: 5,
      row: 0,
      isStatic: true,
    },
    
    // Special structures
    'bridge_wood': {
      id: 'bridge_wood',
      col: 6,
      row: 0,
      isStatic: true,
    },
    'bridge_stone': {
      id: 'bridge_stone',
      col: 7,
      row: 0,
      isStatic: true,
    },
    'dock_wood': {
      id: 'dock_wood',
      col: 8,
      row: 0,
      isStatic: true,
    },
    
    // =====================
    // RANDOM VARIATION TILES (isStatic: false)
    // Game will pick random UV within these regions for variety
    // =====================
    
    // Grass variations (rows 1-8, cols 0-31 = 256 tiles)
    'grass_1': {
      id: 'grass_1',
      col: 0,
      row: 1,
      isStatic: false,
      variations: Array.from({ length: 255 }, (_, i) => `grass_${i + 2}`),
    },
    // Auto-generate grass_2 through grass_256 references
    ...Object.fromEntries(
      Array.from({ length: 255 }, (_, i) => [
        `grass_${i + 2}`,
        {
          id: `grass_${i + 2}`,
          col: (i + 1) % 32,
          row: 1 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Dirt variations (rows 9-16)
    'dirt_1': {
      id: 'dirt_1',
      col: 0,
      row: 9,
      isStatic: false,
      variations: Array.from({ length: 255 }, (_, i) => `dirt_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 255 }, (_, i) => [
        `dirt_${i + 2}`,
        {
          id: `dirt_${i + 2}`,
          col: (i + 1) % 32,
          row: 9 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Sand variations (rows 17-20)
    'sand_1': {
      id: 'sand_1',
      col: 0,
      row: 17,
      isStatic: false,
      variations: Array.from({ length: 127 }, (_, i) => `sand_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 127 }, (_, i) => [
        `sand_${i + 2}`,
        {
          id: `sand_${i + 2}`,
          col: (i + 1) % 32,
          row: 17 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Snow variations (rows 21-24)
    'snow_1': {
      id: 'snow_1',
      col: 0,
      row: 21,
      isStatic: false,
      variations: Array.from({ length: 127 }, (_, i) => `snow_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 127 }, (_, i) => [
        `snow_${i + 2}`,
        {
          id: `snow_${i + 2}`,
          col: (i + 1) % 32,
          row: 21 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Forest floor / leaf litter (rows 25-28)
    'forest_1': {
      id: 'forest_1',
      col: 0,
      row: 25,
      isStatic: false,
      variations: Array.from({ length: 127 }, (_, i) => `forest_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 127 }, (_, i) => [
        `forest_${i + 2}`,
        {
          id: `forest_${i + 2}`,
          col: (i + 1) % 32,
          row: 25 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Swamp/marsh variations (rows 29-30)
    'swamp_1': {
      id: 'swamp_1',
      col: 0,
      row: 29,
      isStatic: false,
      variations: Array.from({ length: 63 }, (_, i) => `swamp_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 63 }, (_, i) => [
        `swamp_${i + 2}`,
        {
          id: `swamp_${i + 2}`,
          col: (i + 1) % 32,
          row: 29 + Math.floor((i + 1) / 32),
          isStatic: false,
        } as AtlasTile
      ])
    ),
    
    // Rock/stone variations (row 31)
    'rock_1': {
      id: 'rock_1',
      col: 0,
      row: 31,
      isStatic: false,
      variations: Array.from({ length: 31 }, (_, i) => `rock_${i + 2}`),
    },
    ...Object.fromEntries(
      Array.from({ length: 31 }, (_, i) => [
        `rock_${i + 2}`,
        {
          id: `rock_${i + 2}`,
          col: i + 1,
          row: 31,
          isStatic: false,
        } as AtlasTile
      ])
    ),
  }
};

/**
 * Helper function to get UV coordinates for a tile
 * Returns UV offset and scale for sampling the correct region of the atlas
 */
export function getTileUV(tileId: string, config: AtlasConfig = FLOOR_ATLAS): { uOffset: number; vOffset: number; uScale: number; vScale: number } {
  const tile = config.tiles[tileId] || config.tiles[config.defaultTile];
  
  if (!tile) {
    // Return default (top-left tile)
    return { uOffset: 0, vOffset: 0, uScale: 1 / config.columns, vScale: 1 / config.rows };
  }
  
  const uOffset = tile.col / config.columns;
  const vOffset = tile.row / config.rows;
  const uScale = 1 / config.columns;
  const vScale = 1 / config.rows;
  
  return { uOffset, vOffset, uScale, vScale };
}

/**
 * Helper function to get a random variation tile ID
 * For static tiles, returns the same ID
 * For random tiles, picks a random variation based on coordinates
 */
export function getRandomTileId(baseTileId: string, seedX: number, seedY: number, config: AtlasConfig = FLOOR_ATLAS): string {
  const tile = config.tiles[baseTileId] || config.tiles[config.defaultTile];
  
  if (!tile || !tile.isStatic && !tile.variations) {
    return baseTileId;
  }
  
  if (tile.isStatic) {
    return tile.id;
  }
  
  // Use deterministic randomness based on world coordinates
  // This ensures the same tile always gets the same variation
  const variations = tile.variations!;
  const hash = Math.abs(Math.sin(seedX * 12.9898 + seedY * 78.233) * 43758.5453);
  const index = Math.floor((hash - Math.floor(hash)) * variations.length);
  
  return variations[index] || baseTileId;
}
