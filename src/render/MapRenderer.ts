// SRC/render/MapRenderer.ts
// Grid-based floor renderer - renders individual tiles based on blueprint
// Uses your 14x13 grid of 1s (tile) and 0s (void)

import { ARENA_FLOOR, FloorConfig } from '../config/FloorMap';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
}

export interface ITileData {
  x: number;
  y: number;
  tileId: number; // Atlas tile ID
}

export class MapRenderer {
  private floorConfig: FloorConfig;
  private tileGrid: number[][]; // Your 14x13 blueprint
  private tileSize: number = 64; // Size of each tile in world units
  
  // Your exact 14x13 grid blueprint (1 = tile, 0 = void)
  private readonly FLOOR_BLUEPRINT: number[][] = [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0], // Row 0
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // Row 1
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 2
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 3
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], // Row 4
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1], // Row 5
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0], // Row 6
    [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1], // Row 7
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1], // Row 8
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 9
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Row 10
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // Row 11
    [0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0], // Row 12
  ];

  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
    this.tileGrid = this.FLOOR_BLUEPRINT;
  }

  /**
   * Generates individual tiles based on the 14x13 blueprint
   * Returns array of tile data for instanced rendering
   */
  public generateFloorTiles(seed: number): ITileData[] {
    const tiles: ITileData[] = [];
    const rows = this.tileGrid.length;
    const cols = this.tileGrid[0].length;
    
    // Center the 14x13 grid in the world
    const offsetX = ((32 - cols) / 2) * this.tileSize;
    const offsetZ = ((32 - rows) / 2) * this.tileSize;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.tileGrid[row][col] === 1) {
          // Calculate world position
          const x = offsetX + col * this.tileSize;
          const z = offsetZ + row * this.tileSize;
          
          // Generate deterministic random tile ID based on position and seed
          const hash = this.hashPosition(col, row, seed);
          const tileId = this.floorConfig.variationTileRangeStart + 
                        (hash % (this.floorConfig.variationTileRangeEnd - this.floorConfig.variationTileRangeStart + 1));
          
          tiles.push({ x, y: z, tileId });
        }
      }
    }
    
    return tiles;
  }
  
  /**
   * Simple hash function for deterministic randomness
   */
  private hashPosition(x: number, y: number, seed: number): number {
    let h = seed + x * 374761393 + y * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return h ^ (h >> 16);
  }

  /**
   * Returns a single floor rectangle covering the entire visible area
   * Legacy method - now returns full bounds for camera calculation
   */
  public getFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData {
    return {
      x: 0,
      y: 0,
      width: this.floorConfig.width,
      height: this.floorConfig.depth,
      texturePath: this.floorConfig.texturePath,
      repeatX: this.floorConfig.repeatX,
      repeatZ: this.floorConfig.repeatZ
    };
  }

  /**
   * Legacy method kept for compatibility
   */
  public getVisibleTileData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): { buffer: Float32Array; count: number } {
    return { buffer: new Float32Array(0), count: 0 };
  }
}
