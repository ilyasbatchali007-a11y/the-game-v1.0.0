// SRC/engine/XRayMarker.ts
// Manages the glowing block entity for X-ray visualization of player position

import { BlockPosition } from './types/MapBlockTypes';

/**
 * Glowing block entity for X-ray visualization
 * Represents the player's current position in the dungeon mesh
 */
export class XRayMarker {
  position: BlockPosition;
  blockSize: number;
  blockSizeVector: { x: number, y: number, z: number }; // Per-axis sizing for anisotropic grids
  color: [number, number, number, number];
  visible: boolean;

  constructor(blockSize: number = 0.1) {
    this.position = { x: 0, y: 0, z: 0 };
    this.blockSize = blockSize;
    this.blockSizeVector = { x: blockSize, y: blockSize, z: blockSize };
    this.color = [0.0, 1.0, 0.0, 1.0]; // Green with full alpha for glowing effect
    this.visible = true; // Always visible by default
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  setBlockSizeVector(x: number, y: number, z: number): void {
    this.blockSizeVector = { x, y, z };
  }

  moveUp(steps: number = 1): void {
    this.position.y += steps * this.blockSizeVector.y;
  }

  moveDown(steps: number = 1): void {
    this.position.y -= steps * this.blockSizeVector.y;
  }

  setColor(r: number, g: number, b: number, a: number = 0.8): void {
    this.color = [r, g, b, a];
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }
  
  isVisible(): boolean {
    return this.visible;
  }
}
