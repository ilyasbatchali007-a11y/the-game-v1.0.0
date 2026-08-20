// SRC/engine/map-window-renderer/BlockVisibilityManager.ts
// Manages fog of war and block visibility state

export class BlockVisibilityManager {
  private visibility: boolean[] = [];
  private revealedCount: number = 0;

  constructor(blockCount: number) {
    this.visibility = new Array(blockCount).fill(false);
  }

  revealBlock(blockIndex: number): void {
    if (blockIndex < 0 || blockIndex >= this.visibility.length) return;
    if (!this.visibility[blockIndex]) {
      this.visibility[blockIndex] = true;
      this.revealedCount++;
    }
  }

  isVisible(blockIndex: number): boolean {
    if (blockIndex < 0 || blockIndex >= this.visibility.length) return false;
    return this.visibility[blockIndex];
  }

  getRevealedCount(): number {
    return this.revealedCount;
  }

  reset(): void {
    this.visibility.fill(false);
    this.revealedCount = 0;
  }
}
