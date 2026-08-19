// SRC/engine/FogOfWarTracker.ts
// Tracks which dungeon mesh blocks are currently visible to the player

/**
 * Fog of War system for 3D map visibility
 * Tracks which blocks of the dungeon mesh are currently visible
 */
export class FogOfWarTracker {
  // Set of revealed block indices (preserved generation order from JSON)
  private revealedBlocks: Set<number> = new Set();
  // Starting block index that's always visible (glowing cube starting area)
  private startingBlockIndex: number = 0;
  
  constructor() {
    // Always reveal the starting block
    this.revealBlock(this.startingBlockIndex);
  }
  
  /**
   * Reveal a specific block by its index in the generation order
   */
  revealBlock(blockIndex: number): void {
    if (!this.revealedBlocks.has(blockIndex)) {
      this.revealedBlocks.add(blockIndex);
      console.log(`[FogOfWar] Block ${blockIndex} revealed`);
    }
  }
  
  /**
   * Check if a block is currently visible
   */
  isBlockRevealed(blockIndex: number): boolean {
    return this.revealedBlocks.has(blockIndex);
  }
  
  /**
   * Get all revealed block indices
   */
  getRevealedBlocks(): number[] {
    return Array.from(this.revealedBlocks);
  }
  
  /**
   * Get the count of revealed blocks
   */
  getRevealedCount(): number {
    return this.revealedBlocks.size;
  }
  
  /**
   * Reset fog of war (only starting block remains visible)
   */
  reset(): void {
    this.revealedBlocks.clear();
    this.revealBlock(this.startingBlockIndex);
    console.log('[FogOfWar] Reset to starting area only');
  }
}
