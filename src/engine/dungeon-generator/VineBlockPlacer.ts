// SRC/engine/dungeon-generator/VineBlockPlacer.ts
// Handles block placement with collision detection for vine-based dungeon generation

import { MapBlock } from '../types/MapBlockTypes';

/**
 * Manages grid cell occupation and block creation for dungeon generation
 */
export class VineBlockPlacer {
  private occupied = new Set<string>();
  private blocks: MapBlock[] = [];
  private blockSize: number;

  constructor(blockSize: number = 10) {
    this.blockSize = blockSize;
  }

  /**
   * Creates a block at grid position if not already occupied
   * Returns the created block or null if position is occupied
   */
  tryPlaceBlock(gx: number, gy: number, gz: number): MapBlock | null {
    const key = `${gx},${gy},${gz}`;
    if (this.occupied.has(key)) {
      return null;
    }

    this.occupied.add(key);
    const block: MapBlock = {
      id: `block_${this.blocks.length}`,
      position: {
        x: gx * this.blockSize + this.blockSize / 2,
        y: gy * this.blockSize + this.blockSize / 2,
        z: gz * this.blockSize + this.blockSize / 2
      },
      size: { x: this.blockSize, y: this.blockSize, z: this.blockSize },
      type: 'dungeon_vine'
    };
    this.blocks.push(block);
    return block;
  }

  /**
   * Gets all placed blocks in generation order
   */
  getBlocks(): MapBlock[] {
    return [...this.blocks];
  }

  /**
   * Gets the count of placed blocks
   */
  getBlockCount(): number {
    return this.blocks.length;
  }

  /**
   * Removes a block by grid position (used for truncation)
   */
  removeBlockAt(gx: number, gy: number, gz: number): void {
    const key = `${gx},${gy},${gz}`;
    this.occupied.delete(key);
    
    // Find and remove the block from the array
    const blockIndex = this.blocks.findIndex(b => {
      const bgx = Math.round((b.position.x - this.blockSize / 2) / this.blockSize);
      const bgy = Math.round((b.position.y - this.blockSize / 2) / this.blockSize);
      const bgz = Math.round((b.position.z - this.blockSize / 2) / this.blockSize);
      return bgx === gx && bgy === gy && bgz === gz;
    });
    
    if (blockIndex !== -1) {
      this.blocks.splice(blockIndex, 1);
    }
  }

  /**
   * Checks if a grid position is occupied
   */
  isOccupied(gx: number, gy: number, gz: number): boolean {
    const key = `${gx},${gy},${gz}`;
    return this.occupied.has(key);
  }
}
