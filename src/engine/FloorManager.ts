// src/engine/FloorManager.ts
// Manages floor navigation, teleportation between floors

import { World } from '../ecs/World';
import { PLAYER_ID } from '../config/Constants';
import { 
  FLOORS, 
  FloorData, 
  currentFloorIndex, 
  setCurrentFloor,
  getCurrentFloor,
  getNextFloorIndex,
  getPreviousFloorIndex,
  getTotalFloorCount
} from '../config/FloorSystem';
import { ChessboardTextureGenerator, ChessboardConfig } from '../render/ChessboardTexture';

export class FloorManager {
  private gl: WebGL2RenderingContext;
  private floorTextures: Map<number, WebGLTexture> = new Map();
  private currentFloorIdx: number = 0;
  private onFloorChangedCallback: ((floorIndex: number) => void) | null = null;
  
  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.initializeFloorTextures();
  }
  
  /**
   * Initialize textures for all floors
   */
  private initializeFloorTextures(): void {
    for (const floor of FLOORS) {
      const config: ChessboardConfig = {
        width: 512,  // Texture resolution
        height: 512,
        checkerSize: 32,  // Each checker square is 32x32 pixels
        color1: floor.color1,
        color2: floor.color2
      };
      
      const texture = ChessboardTextureGenerator.createWebGLTexture(this.gl, config);
      this.floorTextures.set(floor.id, texture);
    }
  }
  
  /**
   * Get the texture for a specific floor
   */
  public getFloorTexture(floorId: number): WebGLTexture | undefined {
    return this.floorTextures.get(floorId);
  }
  
  /**
   * Get current floor data
   */
  public getCurrentFloor(): FloorData {
    return FLOORS[this.currentFloorIdx];
  }
  
  /**
   * Get current floor index
   */
  public getCurrentFloorIndex(): number {
    return this.currentFloorIdx;
  }
  
  /**
   * Teleport player to next floor
   */
  public goToNextFloor(world: World): boolean {
    const nextIdx = getNextFloorIndex();
    if (nextIdx === this.currentFloorIdx) {
      console.log('[FloorManager] Already at top floor');
      return false;
    }
    
    return this.teleportToFloor(nextIdx, world);
  }
  
  /**
   * Teleport player to previous floor
   */
  public goToPreviousFloor(world: World): boolean {
    const prevIdx = getPreviousFloorIndex();
    if (prevIdx === this.currentFloorIdx) {
      console.log('[FloorManager] Already at bottom floor');
      return false;
    }
    
    return this.teleportToFloor(prevIdx, world);
  }
  
  /**
   * Teleport player to specific floor by index
   */
  public teleportToFloor(floorIndex: number, world: World): boolean {
    if (floorIndex < 0 || floorIndex >= FLOORS.length) {
      console.error(`[FloorManager] Invalid floor index: ${floorIndex}`);
      return false;
    }
    
    const oldFloorIdx = this.currentFloorIdx;
    this.currentFloorIdx = floorIndex;
    setCurrentFloor(floorIndex);
    
    // Update player position - can add custom positioning per floor
    if (world.active[PLAYER_ID]) {
      // Optional: Add floor-specific spawn points
      // For now, keep player at same X,Y but they're now on a different floor
      console.log(`[FloorManager] Teleported from Floor ${oldFloorIdx + 1} to Floor ${floorIndex + 1}`);
    }
    
    // Notify listeners of floor change
    if (this.onFloorChangedCallback) {
      this.onFloorChangedCallback(floorIndex);
    }
    
    return true;
  }
  
  /**
   * Set callback for floor change events
   */
  public onFloorChanged(callback: (floorIndex: number) => void): void {
    this.onFloorChangedCallback = callback;
  }
  
  /**
   * Get total number of floors
   */
  public getTotalFloors(): number {
    return getTotalFloorCount();
  }
  
  /**
   * Customize a specific floor's properties
   */
  public customizeFloor(
    floorIndex: number,
    options?: {
      width?: number;
      depth?: number;
      checkerSize?: number;
      color1?: [number, number, number];
      color2?: [number, number, number];
    }
  ): void {
    if (floorIndex < 0 || floorIndex >= FLOORS.length) {
      console.error(`[FloorManager] Invalid floor index: ${floorIndex}`);
      return;
    }
    
    const floor = FLOORS[floorIndex];
    
    if (options) {
      if (options.width !== undefined) floor.width = options.width;
      if (options.depth !== undefined) floor.depth = options.depth;
      if (options.checkerSize !== undefined) floor.checkerSize = options.checkerSize;
      if (options.color1 !== undefined) floor.color1 = options.color1;
      if (options.color2 !== undefined) floor.color2 = options.color2;
      
      // Regenerate texture with new settings
      const config: ChessboardConfig = {
        width: 512,
        height: 512,
        checkerSize: options.checkerSize ? options.checkerSize * 16 : 32,
        color1: floor.color1,
        color2: floor.color2
      };
      
      const oldTexture = this.floorTextures.get(floor.id);
      if (oldTexture) {
        this.gl.deleteTexture(oldTexture);
      }
      
      const newTexture = ChessboardTextureGenerator.createWebGLTexture(this.gl, config);
      this.floorTextures.set(floor.id, newTexture);
    }
  }
  
  /**
   * Cleanup - delete all floor textures
   */
  public destroy(): void {
    for (const texture of this.floorTextures.values()) {
      this.gl.deleteTexture(texture);
    }
    this.floorTextures.clear();
  }
}
