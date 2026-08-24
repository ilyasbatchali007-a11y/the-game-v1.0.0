// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports 20 independent floors with customized sizes that can be switched at runtime
// Uses green chessboard pattern texture for all floors

import { ARENA_FLOOR, FloorConfig, FLOORS, getFloorById, getFloorCount } from '../config/FloorMap';
import { generateTestMap, placePortalsForFloor } from '../config/MapData';
import { PortalManager } from '../config/PortalManager';

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
  private portalManagerInitialized = false;

  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
  }

  /**
   * Initialize the PortalManager (call once at app startup)
   */
  public async initializePortalManager(): Promise<void> {
    if (!this.portalManagerInitialized) {
      await PortalManager.initialize();
      this.portalManagerInitialized = true;
    }
  }

  /**
   * Switch to a different floor by ID (0-19)
   * @param floorId - The floor ID to switch to (0-19)
   * @returns true if successful, false if invalid floor ID
   */
  public async switchFloor(floorId: number): Promise<boolean> {
    if (floorId < 0 || floorId >= getFloorCount()) {
      console.warn(`Invalid floor ID: ${floorId}. Must be between 0 and ${getFloorCount() - 1}`);
      return false;
    }
    
    this.currentFloorId = floorId;
    this.floorConfig = getFloorById(floorId);
    
    // Regenerate the map data with new dimensions and texture settings
    const cols = Math.floor(this.floorConfig.width / 64);
    const rows = Math.floor(this.floorConfig.depth / 64);
    await generateTestMap({
      cols,
      rows,
      useAtlas: this.floorConfig.useAtlas
    });
    
    // Place portals for this floor using PortalManager data
    placePortalsForFloor(floorId);
    
    console.log(`[MapRenderer] Switched to Floor ${floorId} (${cols}x${rows} tiles, ${this.floorConfig.width}x${this.floorConfig.depth}px)`);
    return true;
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
    return getFloorById(floorId);
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