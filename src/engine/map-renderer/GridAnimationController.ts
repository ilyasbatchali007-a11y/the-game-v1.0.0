// SRC/engine/map-renderer/GridAnimationController.ts
// Controls the automatic grid scanning animation for X-ray marker

import { RENDER_CONSTANTS } from './MapRendererTypes';

export interface GridPosition {
  x: number;
  y: number;
  z: number;
}

export class GridAnimationController {
  private gridCoordinates: GridPosition[] = [];
  private currentGridIndex: number = 0;
  private lastGridMoveTime: number = 0;
  private isRunning: boolean = false;

  public setGridCoordinates(coordinates: GridPosition[]): void {
    this.gridCoordinates = coordinates;
    this.currentGridIndex = 0;
  }

  public start(): void {
    this.currentGridIndex = 0;
    this.lastGridMoveTime = Date.now();
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public isAnimating(): boolean {
    return this.isRunning;
  }

  public update(revealCallback?: (index: number) => void): { 
    hasUpdate: boolean; 
    position: GridPosition | null;
    currentIndex: number;
  } {
    if (!this.isRunning || this.gridCoordinates.length === 0) {
      return { hasUpdate: false, position: null, currentIndex: this.currentGridIndex };
    }

    const now = Date.now();
    if (now - this.lastGridMoveTime < RENDER_CONSTANTS.GRID_MOVE_INTERVAL) {
      return { hasUpdate: false, position: null, currentIndex: this.currentGridIndex };
    }

    this.lastGridMoveTime = now;

    if (this.currentGridIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentGridIndex];
      
      if (revealCallback) {
        revealCallback(this.currentGridIndex);
      }

      this.currentGridIndex++;

      if (this.currentGridIndex % 10 === 0 || this.currentGridIndex === 1) {
        console.log(`[GridAnimationController] Grid step ${this.currentGridIndex}/${this.gridCoordinates.length}`);
      }

      return { hasUpdate: true, position: pos, currentIndex: this.currentGridIndex - 1 };
    } else {
      this.currentGridIndex = 0;
      console.log('[GridAnimationController] Grid scan complete, restarting...');
      return { hasUpdate: true, position: null, currentIndex: 0 };
    }
  }

  public getCurrentIndex(): number {
    return this.currentGridIndex;
  }

  public getTotalCount(): number {
    return this.gridCoordinates.length;
  }

  public getPositionAt(index: number): GridPosition | null {
    if (index < 0 || index >= this.gridCoordinates.length) return null;
    return this.gridCoordinates[index];
  }

  public moveToNext(): GridPosition | null {
    if (this.currentGridIndex >= this.gridCoordinates.length) {
      this.currentGridIndex = 0;
      return null;
    }
    return this.gridCoordinates[this.currentGridIndex++];
  }
}
