// SRC/engine/map-window-renderer/GridAnimationController.ts
// Handles automatic grid scanning animation for X-ray marker

import { XRayMarker } from '../XRayMarker';
import { BlockPosition } from './types/MapBlockTypes';

export class GridAnimationController {
  private gridCoordinates: BlockPosition[] = [];
  private currentIndex: number = 0;
  private lastMoveTime: number = 0;
  private readonly moveInterval: number = 1000;
  private isEnabled: boolean = false;

  constructor() {}

  setGridCoordinates(coordinates: BlockPosition[]): void {
    this.gridCoordinates = coordinates;
    this.currentIndex = 0;
  }

  update(xRayMarker: XRayMarker | null, onReveal: (index: number) => void): void {
    if (!xRayMarker || !this.isEnabled || this.gridCoordinates.length === 0) return;

    const now = Date.now();
    if (now - this.lastMoveTime < this.moveInterval) return;

    this.lastMoveTime = now;

    if (this.currentIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentIndex];
      xRayMarker.setPosition(pos.x, pos.y, pos.z);
      onReveal(this.currentIndex);
      this.currentIndex++;

      if (this.currentIndex % 10 === 0 || this.currentIndex === 1) {
        console.log(`[GridAnimation] Step ${this.currentIndex}/${this.gridCoordinates.length}`);
      }
    } else {
      this.currentIndex = 0;
      console.log('[GridAnimation] Scan complete, restarting...');
    }
  }

  start(): void {
    this.currentIndex = 0;
    this.lastMoveTime = Date.now();
    this.isEnabled = true;
    console.log('[GridAnimation] Started');
  }

  stop(): void {
    this.isEnabled = false;
    console.log('[GridAnimation] Stopped');
  }

  moveNext(): void {
    if (this.currentIndex < this.gridCoordinates.length) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
