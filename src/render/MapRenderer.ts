// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports multiple separate floors with customizable IDs and sizes

import { FloorConfig, ARENA_FLOOR, getFloorById } from '../config/FloorMap';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  floorId: number;  // Floor ID for identification
}

export class MapRenderer {
  private floorConfig: FloorConfig;
  private currentFloorId: number = 0;
  
  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
    this.currentFloorId = floorConfig.id;
  }

  /**
   * Swap to a different floor by ID
   * @param floorId - The ID of the floor to swap to
   * @returns true if floor was found and swapped, false otherwise
   */
  public swapFloor(floorId: number): boolean {
    const newFloor = getFloorById(floorId);
    if (newFloor) {
      this.floorConfig = newFloor;
      this.currentFloorId = floorId;
      console.log(`[MapRenderer] Swapped to floor ID ${floorId} (${newFloor.width}x${newFloor.depth})`);
      return true;
    }
    console.warn(`[MapRenderer] Floor ID ${floorId} not found`);
    return false;
  }

  /**
   * Swap to a custom floor configuration
   * @param floorConfig - The floor configuration to use
   */
  public setFloorConfig(floorConfig: FloorConfig): void {
    this.floorConfig = floorConfig;
    this.currentFloorId = floorConfig.id;
    console.log(`[MapRenderer] Set custom floor ID ${floorConfig.id} (${floorConfig.width}x${floorConfig.depth})`);
  }

  /**
   * Get the current floor ID
   */
  public getCurrentFloorId(): number {
    return this.currentFloorId;
  }

  /**
   * Get the current floor configuration
   */
  public getCurrentFloorConfig(): FloorConfig {
    return this.floorConfig;
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
    // Return the current floor as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
    return {
      x: 0,
      y: 0,
      width: this.floorConfig.width,
      height: this.floorConfig.depth,
      texturePath: this.floorConfig.texturePath,
      repeatX: this.floorConfig.repeatX,
      repeatZ: this.floorConfig.repeatZ,
      floorId: this.currentFloorId
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
