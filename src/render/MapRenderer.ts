// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports 100 independent floors with customized sizes that can be switched at runtime
// Uses green chessboard pattern texture for all floors

import { ARENA_FLOOR, FloorConfig, FLOORS, getFloorById, getFloorCount } from '../config/FloorMap';
import { generateTestMap, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA, MAP_DATA } from '../config/MapData';
import { portalManager } from '../config/PortalManager';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  floorId: number;  // Current floor ID for reference
  useAtlas: boolean;  // Whether to use atlas texture or chessboard pattern
}

export class MapRenderer {
  private currentFloorId: number = 0;
  private floorConfig: FloorConfig;

  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
  }

  /**
   * Switch to a different floor by ID (0-19)
   * @param floorId - The floor ID to switch to (0-19)
   * @returns true if successful, false if invalid floor ID
   */
  public switchFloor(floorId: number): boolean {
    if (floorId < 0 || floorId >= getFloorCount()) {
      console.warn(`Invalid floor ID: ${floorId}. Must be between 0 and ${getFloorCount() - 1}`);
      return false;
    }
    
    this.currentFloorId = floorId;
    const floorConfig = getFloorById(floorId);
    if (!floorConfig) {
      console.warn(`Floor configuration not found for ID: ${floorId}`);
      return false;
    }
    this.floorConfig = floorConfig;
    
    // Get floor dimensions from PortalManager (uses actual JSON data)
    const dims = portalManager.getFloorDimensions(floorId);
    const cols = dims ? dims.width : Math.floor(this.floorConfig.width / 64);
    const rows = dims ? dims.depth : Math.floor(this.floorConfig.depth / 64);
    
    // Regenerate the map data with new dimensions and texture settings
    generateTestMap({
      cols,
      rows,
      useAtlas: this.floorConfig.useAtlas
    });
    
    // Generate portal tiles for this floor using PortalManager
    this.generatePortalTiles(floorId, cols);
    
    console.log(`[MapRenderer] Switched to Floor ${floorId} (${cols}x${rows} tiles, ${this.floorConfig.width}x${this.floorConfig.depth}px)`);
    return true;
  }

  /**
   * Generate portal tile data for the current floor using PortalManager
   */
  private generatePortalTiles(floorId: number, mapCols: number): void {
    // Generate portal tiles
    const portalData = portalManager.generatePortalTileData(floorId, mapCols);
    
    for (const entry of portalData) {
      if (entry.index < MAP_TILE_DATA.length) {
        MAP_TILE_DATA[entry.index] = entry.tileId;
        MAP_TILE_DATA[entry.index + 1] = entry.isStatic;
      }
    }
  }

  /**
   * Get the current floor ID
   */
  public getCurrentFloorId(): number {
    return this.currentFloorId;
  }

  /**
   * Get all available floor configurations
   */
  public getAvailableFloors(): FloorConfig[] {
    return FLOORS;
  }

  /**
   * Get configuration for a specific floor
   */
  public getFloorConfig(floorId: number): FloorConfig | null {
    if (floorId < 0 || floorId >= getFloorCount()) {
      return null;
    }
    const floorConfig = getFloorById(floorId);
    return floorConfig || null;
  }

  /**
   * Returns a single floor rectangle covering the entire visible area
   * This replaces the tile-by-tile rendering with one seamless quad
   */
  public getFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData {
    // Return the entire world as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
    return {
      x: 0,
      y: 0,
      width: this.floorConfig.width,
      height: this.floorConfig.depth,
      texturePath: this.floorConfig.texturePath,
      repeatX: this.floorConfig.repeatX,
      repeatZ: this.floorConfig.repeatZ,
      floorId: this.currentFloorId,
      useAtlas: this.floorConfig.useAtlas
    };
  }

  /**
   * Legacy method kept for compatibility - now returns empty data
   * since we render the floor as a single quad instead of tiles
   */
  public getVisibleTileData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): { buffer: Float32Array; count: number } {
    // Return empty - floor is now rendered as a single quad
    return { buffer: new Float32Array(0), count: 0 };
  }
}