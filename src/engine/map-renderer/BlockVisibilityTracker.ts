// SRC/engine/map-renderer/BlockVisibilityTracker.ts
// Tracks which blocks are visible/revealed using fog of war logic

import { FogOfWarTracker } from '../FogOfWarTracker';

export class BlockVisibilityTracker {
  private blockVisibility: boolean[] = [];
  private fogOfWar: FogOfWarTracker | null = null;

  constructor(blockCount: number = 0) {
    this.initialize(blockCount);
  }

  public initialize(blockCount: number): void {
    this.blockVisibility = new Array(blockCount).fill(false);
    if (blockCount > 0) {
      this.blockVisibility[0] = true;
    }
    this.fogOfWar = new FogOfWarTracker();
  }

  public revealBlock(blockIndex: number): void {
    if (blockIndex < 0 || blockIndex >= this.blockVisibility.length) return;
    if (!this.blockVisibility[blockIndex]) {
      this.blockVisibility[blockIndex] = true;
      this.fogOfWar?.revealBlock(blockIndex);
    }
  }

  public isBlockVisible(blockIndex: number): boolean {
    if (blockIndex < 0 || blockIndex >= this.blockVisibility.length) return false;
    return this.blockVisibility[blockIndex];
  }

  public getRevealedCount(): number {
    return this.fogOfWar?.getRevealedCount() ?? 0;
  }

  public getAllVisibility(): boolean[] {
    return [...this.blockVisibility];
  }

  public setAllHidden(): void {
    this.blockVisibility.fill(false);
    this.fogOfWar = new FogOfWarTracker();
  }
}
