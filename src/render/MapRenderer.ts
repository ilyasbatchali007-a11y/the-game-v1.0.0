// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports 20 independent floors with customized sizes that can be switched at runtime
// Now uses consolidated FloorSystem for all floor data

import { FloorSystem } from '../systems/FloorSystem';

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

  constructor() {
    // Initialize FloorSystem with floor 0 by default
    FloorSystem.init(0);
  }

  /**
   * Switch to a different floor by ID (0-19)
   * @param floorId - The floor ID to switch to (0-19)
   * @returns true if successful, false if invalid floor ID
   */
  public switchFloor(floorId: number): boolean {
    const success = FloorSystem.switchFloor(floorId);
    if (success) {
      this.currentFloorId = floorId;
      console.log(`[MapRenderer] Switched to Floor ${floorId}`);
    }
    return success;
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
  public getAvailableFloors(): number {
    return FloorSystem.getFloorCount();
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
    const dims = FloorSystem.getPixelDimensions();
    const useAtlas = FloorSystem.isUsingAtlas();
    
    // Return the entire world as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
    return {
      x: 0,
      y: 0,
      width: dims.width,
      height: dims.height,
      texturePath: useAtlas ? '/textures/atlas.png' : '',
      repeatX: dims.width / 64,
      repeatZ: dims.height / 64,
      floorId: this.currentFloorId,
      useAtlas
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
