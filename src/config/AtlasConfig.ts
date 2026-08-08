// SRC/config/AtlasConfig.ts
// Configuration for texture atlas support with Biome Zones
// YOU DECIDE LATER: Which zone ID maps to Desert, Forest, Buildings, etc.

export interface BiomeZone {
  id: string;
  // Top-left corner of the zone in the atlas grid [col, row] (0-indexed)
  gridStart: [number, number];
  // Size of the zone in tiles [cols, rows]
  gridSize: [number, number];
}

export interface AtlasConfig {
  // Path to the atlas texture file (PNG, JPG, WebP, or KTX2)
  texturePath: string;

  // Total number of tiles horizontally in the ENTIRE atlas
  tilesX: number;

  // Total number of tiles vertically in the ENTIRE atlas
  tilesY: number;

  // Define biome zones within this atlas
  // Keys are arbitrary IDs you will use in your map data
  // Example: { 'desert': {...}, 'forest': {...}, 'buildings': {...} }
  zones?: Record<string, BiomeZone>;

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
   * Get UV coordinates for a specific tile index (global atlas index)
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

  /**
   * Get random UV offset within a specific biome zone
   * Used for procedural terrain generation (desert, forest, etc.)
   * @param zoneId - The zone ID (e.g., 'desert', 'forest')
   * @returns UV offset [u, v] for a random tile within that zone
   */
  getRandomUVInZone(zoneId: string): [number, number] {
    if (!this.zones || !this.zones[zoneId]) {
      console.warn(`Zone "${zoneId}" not found in atlas config, using default`);
      return [0, 0];
    }

    const zone = this.zones[zoneId];
    const [startCol, startRow] = zone.gridStart;
    const [sizeCol, sizeRow] = zone.gridSize;

    // Pick random tile within this zone
    const randomCol = Math.floor(Math.random() * sizeCol);
    const randomRow = Math.floor(Math.random() * sizeRow);

    const finalCol = startCol + randomCol;
    const finalRow = startRow + randomRow;

    // Convert to UV space
    const u = finalCol / this.tilesX;
    const v = finalRow / this.tilesY;

    return [u, v];
  }

  /**
   * Get static UV offset for fixed structures (buildings, paths, etc.)
   * @param zoneId - The zone ID (e.g., 'buildings')
   * @param relCol - Relative column within the zone (optional)
   * @param relRow - Relative row within the zone (optional)
   * @returns UV offset [u, v] for a specific tile
   */
  getStaticUVInZone(zoneId: string, relCol?: number, relRow?: number): [number, number] {
    if (!this.zones || !this.zones[zoneId]) {
      console.warn(`Zone "${zoneId}" not found in atlas config, using default`);
      return [0, 0];
    }

    const zone = this.zones[zoneId];
    const [startCol, startRow] = zone.gridStart;
    const [sizeCol, sizeRow] = zone.gridSize;

    // Use provided coords or default to (0,0) within zone
    const finalCol = startCol + (relCol !== undefined ? relCol : 0);
    const finalRow = startRow + (relRow !== undefined ? relRow : 0);

    // Clamp to stay within zone bounds
    const safeCol = Math.min(Math.max(finalCol, startCol), startCol + sizeCol - 1);
    const safeRow = Math.min(Math.max(finalRow, startRow), startRow + sizeRow - 1);

    const u = safeCol / this.tilesX;
    const v = safeRow / this.tilesY;

    return [u, v];
  }
}

/**
 * Default atlas configuration with example biome zones
 * YOU DECIDE LATER: Rename zone IDs to match your biomes (desert, forest, snow, buildings, etc.)
 * Current setup: 8x8 atlas with 4 zones as examples
 */
export const DEFAULT_ATLAS: AtlasConfig = {
  texturePath: 'assets/textures/atlas.png',
  tilesX: 8,
  tilesY: 8,
  zones: {
    // ZONE A: Top-left 4x4 area (16 tiles)
    // You decide later: This could be DESERT, FOREST, GRASS, etc.
    'zone_a': {
      id: 'zone_a',
      gridStart: [0, 0],
      gridSize: [4, 4],
    },
    // ZONE B: Top-right 4x4 area (16 tiles)
    // You decide later: This could be FOREST, SNOW, SWAMP, etc.
    'zone_b': {
      id: 'zone_b',
      gridStart: [4, 0],
      gridSize: [4, 4],
    },
    // ZONE C: Middle-left 8x2 area (16 tiles)
    // You decide later: This could be ROCKS, SAND, VOLCANIC, etc.
    'zone_c': {
      id: 'zone_c',
      gridStart: [0, 4],
      gridSize: [8, 2],
    },
    // STATIC ZONE: Bottom 8x2 area (16 tiles)
    // Recommended for: BUILDINGS, PATHS, DUNGEONS (fixed structures)
    'static_buildings': {
      id: 'static_buildings',
      gridStart: [0, 6],
      gridSize: [8, 2],
    }
  }
};

/**
 * Example: Simple 4x4 atlas for testing
 */
export const SMALL_ATLAS: AtlasConfig = {
  texturePath: 'assets/textures/atlas_small.png',
  tilesX: 4,
  tilesY: 4,
  zones: {
    'zone_a': { id: 'zone_a', gridStart: [0, 0], gridSize: [2, 2] },
    'zone_b': { id: 'zone_b', gridStart: [2, 0], gridSize: [2, 2] },
    'zone_c': { id: 'zone_c', gridStart: [0, 2], gridSize: [2, 2] },
    'static_buildings': { id: 'static_buildings', gridStart: [2, 2], gridSize: [2, 2] }
  }
};
