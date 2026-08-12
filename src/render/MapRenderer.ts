// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance

import { ARENA_FLOOR, FloorConfig } from '../config/FloorMap';

export class MapRenderer {
  private floorConfig: FloorConfig;

  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
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
  ): { x: number; y: number; width: number; height: number; texturePath: string; repeatX: number; repeatZ: number } {
    // Return the entire world as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
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
}