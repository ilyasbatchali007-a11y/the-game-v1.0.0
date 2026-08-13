// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports multiple floors with different textures and customizable sizes

import { ARENA_FLOOR, FloorConfig, createFloorConfig } from '../config/FloorMap';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  elevation: number;      // Y offset for multi-floor support
  layerIndex: number;     // Render order
  useAtlas: boolean;      // Whether to use atlas or standalone texture
  atlasTileCountX: number;
  atlasTileCountY: number;
  staticRangeStart: number;
  staticRangeEnd: number;
  variationRangeStart: number;
  variationRangeEnd: number;
}

export class MapRenderer {
  private floors: FloorConfig[] = [];
  
  constructor(defaultFloor?: FloorConfig) {
    if (defaultFloor) {
      this.addFloor(defaultFloor);
    }
  }

  /**
   * Add a new floor layer with custom configuration
   * Multiple floors can be rendered in a single batch using the same shader
   */
  public addFloor(config: FloorConfig): void {
    this.floors.push(config);
    // Sort by layerIndex to ensure correct render order
    this.floors.sort((a, b) => a.layerIndex - b.layerIndex);
  }

  /**
   * Remove a floor by index
   */
  public removeFloor(index: number): void {
    if (index >= 0 && index < this.floors.length) {
      this.floors.splice(index, 1);
    }
  }

  /**
   * Get all floor configurations sorted by layer index
   */
  public getAllFloors(): FloorConfig[] {
    return [...this.floors];
  }

  /**
   * Returns floor data for ALL configured floors
   * Each floor is rendered as a single quad (1 draw call per floor)
   * All floors share the same shader pipeline for efficiency
   */
  public getAllFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData[] {
    return this.floors.map(floor => ({
      x: 0,
      y: 0,
      width: floor.width,
      height: floor.depth,
      texturePath: floor.texturePath,
      repeatX: floor.repeatX,
      repeatZ: floor.repeatZ,
      elevation: floor.elevation,
      layerIndex: floor.layerIndex,
      useAtlas: floor.useAtlas,
      atlasTileCountX: floor.atlasTileCountX,
      atlasTileCountY: floor.atlasTileCountY,
      staticRangeStart: floor.staticTileRangeStart,
      staticRangeEnd: floor.staticTileRangeEnd,
      variationRangeStart: floor.variationTileRangeStart,
      variationRangeEnd: floor.variationTileRangeEnd
    }));
  }

  /**
   * Legacy method - returns data for the first floor only
   * Kept for backward compatibility
   */
  public getFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData {
    if (this.floors.length === 0) {
      // Default fallback
      return {
        x: 0,
        y: 0,
        width: ARENA_FLOOR.width,
        height: ARENA_FLOOR.depth,
        texturePath: ARENA_FLOOR.texturePath,
        repeatX: ARENA_FLOOR.repeatX,
        repeatZ: ARENA_FLOOR.repeatZ,
        elevation: ARENA_FLOOR.elevation,
        layerIndex: ARENA_FLOOR.layerIndex,
        useAtlas: ARENA_FLOOR.useAtlas,
        atlasTileCountX: ARENA_FLOOR.atlasTileCountX,
        atlasTileCountY: ARENA_FLOOR.atlasTileCountY,
        staticRangeStart: ARENA_FLOOR.staticTileRangeStart,
        staticRangeEnd: ARENA_FLOOR.staticTileRangeEnd,
        variationRangeStart: ARENA_FLOOR.variationTileRangeStart,
        variationRangeEnd: ARENA_FLOOR.variationTileRangeEnd
      };
    }
    
    const floor = this.floors[0];
    return {
      x: 0,
      y: 0,
      width: floor.width,
      height: floor.depth,
      texturePath: floor.texturePath,
      repeatX: floor.repeatX,
      repeatZ: floor.repeatZ,
      elevation: floor.elevation,
      layerIndex: floor.layerIndex,
      useAtlas: floor.useAtlas,
      atlasTileCountX: floor.atlasTileCountX,
      atlasTileCountY: floor.atlasTileCountY,
      staticRangeStart: floor.staticTileRangeStart,
      staticRangeEnd: floor.staticTileRangeEnd,
      variationRangeStart: floor.variationTileRangeStart,
      variationRangeEnd: floor.variationTileRangeEnd
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