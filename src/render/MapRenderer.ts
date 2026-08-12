// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance

import { FloorConfig } from '../config/FloorMap';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  isProcedural: boolean;
  proceduralColor1?: [number, number, number];
  proceduralColor2?: [number, number, number];
  tileSize?: number;
}

export class MapRenderer {
  private currentFloor: FloorConfig | null = null;

  constructor() {}

  public setFloor(floorConfig: FloorConfig) {
    this.currentFloor = floorConfig;
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
    if (!this.currentFloor) {
      // Default fallback
      return {
        x: 0,
        y: 0,
        width: 10240,
        height: 10240,
        texturePath: 'src/atlas pictures/atlas floor.jpg',
        repeatX: 160,
        repeatZ: 160,
        isProcedural: false
      };
    }

    // Return the entire world as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
    return {
      x: 0,
      y: 0,
      width: this.currentFloor.width,
      height: this.currentFloor.depth,
      texturePath: this.currentFloor.texturePath,
      repeatX: this.currentFloor.repeatX,
      repeatZ: this.currentFloor.repeatZ,
      isProcedural: this.currentFloor.isProcedural,
      proceduralColor1: this.currentFloor.proceduralColor1,
      proceduralColor2: this.currentFloor.proceduralColor2,
      tileSize: this.currentFloor.tileSize
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