// SRC/engine/camera/IsometricProjector.ts
// Handles isometric coordinate transformations for tile-based rendering
// Converts between world, screen, and isometric tile coordinates

import { TILE_SIZE } from '../../config/MapData';

export class IsometricProjector {
  private readonly isHalfWidth: number;
  private readonly isHalfHeight: number;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;

  constructor(tileSize: number = TILE_SIZE) {
    this.isHalfWidth = tileSize / 2;
    this.isHalfHeight = tileSize / 4;
  }

  /**
   * Set viewport dimensions for screen calculations
   */
  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Convert world tile coordinates to isometric screen position
   */
  public tileToScreen(
    tileCol: number,
    tileRow: number,
    cameraX: number,
    cameraY: number,
    topPadding: number = 100
  ): { x: number; y: number } {
    // Isometric transformation
    const isoX = (tileCol - tileRow) * this.isHalfWidth;
    const isoY = (tileCol + tileRow) * this.isHalfHeight;

    // Apply camera offset
    const screenX = isoX - cameraX + this.viewportWidth / 2;
    const screenY = isoY - cameraY + topPadding;

    return { x: screenX, y: screenY };
  }

  /**
   * Convert world coordinates to isometric screen position
   */
  public worldToIsoScreen(
    worldX: number,
    worldY: number,
    cameraX: number,
    cameraY: number
  ): { x: number; y: number } {
    const tileCol = worldX / TILE_SIZE;
    const tileRow = worldY / TILE_SIZE;

    return this.tileToScreen(tileCol, tileRow, cameraX, cameraY);
  }

  /**
   * Convert screen coordinates back to tile coordinates
   * Inverse of tileToScreen
   */
  public screenToTile(
    screenX: number,
    screenY: number,
    cameraX: number,
    cameraY: number,
    topPadding: number = 100
  ): { col: number; row: number } {
    // Reverse the isometric transformation
    const adjustedX = screenX + cameraX - this.viewportWidth / 2;
    const adjustedY = screenY + cameraY - topPadding;

    const tileCol = (adjustedX / this.isHalfWidth + adjustedY / this.isHalfHeight) / 2;
    const tileRow = (adjustedY / this.isHalfHeight - adjustedX / this.isHalfWidth) / 2;

    return {
      col: Math.floor(tileCol),
      row: Math.floor(tileRow)
    };
  }

  /**
   * Check if a tile is visible in the current viewport
   */
  public isTileVisible(
    tileCol: number,
    tileRow: number,
    cameraX: number,
    cameraY: number,
    paddingTiles: number = 1
  ): boolean {
    const screenPos = this.tileToScreen(tileCol, tileRow, cameraX, cameraY);
    const tileSize = TILE_SIZE;
    const padding = tileSize * paddingTiles;

    return (
      screenPos.x >= -padding &&
      screenPos.x <= this.viewportWidth + padding &&
      screenPos.y >= -padding &&
      screenPos.y <= this.viewportHeight + padding
    );
  }

  /**
   * Get half-width value for external calculations
   */
  public getHalfWidth(): number {
    return this.isHalfWidth;
  }

  /**
   * Get half-height value for external calculations
   */
  public getHalfHeight(): number {
    return this.isHalfHeight;
  }
}
