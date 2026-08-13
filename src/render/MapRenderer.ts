// SRC/render/MapRenderer.ts
// Multi-floor renderer with independent textures and IDs
// Supports floor transitions via T/G buttons

import { ARENA_FLOOR, CHESSBOARD_FLOOR, FloorConfig, ALL_FLOORS } from '../config/FloorMap';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  yLevel: number;      // Vertical position for elevation
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  isChessboard: boolean;
  floorId: number;
}

export class MapRenderer {
  private currentFloorIndex: number = 0;  // Current active floor

  constructor() {}

  /**
   * Set the current floor by index
   */
  public setCurrentFloor(index: number): void {
    if (index >= 0 && index < ALL_FLOORS.length) {
      this.currentFloorIndex = index;
    }
  }

  /**
   * Get the current floor index
   */
  public getCurrentFloorIndex(): number {
    return this.currentFloorIndex;
  }

  /**
   * Move to next floor (T button - go up)
   */
  public nextFloor(): void {
    this.currentFloorIndex = (this.currentFloorIndex + 1) % ALL_FLOORS.length;
    console.log(`[MapRenderer] Moved to floor ${this.currentFloorIndex}: ${ALL_FLOORS[this.currentFloorIndex].name}`);
  }

  /**
   * Move to previous floor (G button - go down)
   */
  public previousFloor(): void {
    this.currentFloorIndex = (this.currentFloorIndex - 1 + ALL_FLOORS.length) % ALL_FLOORS.length;
    console.log(`[MapRenderer] Moved to floor ${this.currentFloorIndex}: ${ALL_FLOORS[this.currentFloorIndex].name}`);
  }

  /**
   * Returns floor data for the current active floor
   */
  public getFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData {
    const floorConfig = ALL_FLOORS[this.currentFloorIndex];
    
    return {
      x: 0,
      y: 0,
      width: floorConfig.width,
      height: floorConfig.depth,
      yLevel: floorConfig.yLevel,
      texturePath: floorConfig.texturePath,
      repeatX: floorConfig.repeatX,
      repeatZ: floorConfig.repeatZ,
      isChessboard: floorConfig.isChessboard,
      floorId: floorConfig.id
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