// SRC/engine/camera/ViewportClamper.ts
// Handles clamping camera position to map bounds and viewport constraints
// Prevents camera from showing empty space beyond map borders

import { clamp } from '../../utils/MathUtils';

export interface IBounds {
  width: number;
  height: number;
}

export class ViewportClamper {
  private mapWidth: number = 0;
  private mapHeight: number = 0;
  private viewportWidth: number = 0;
  private viewportHeight: number = 0;

  /**
   * Set map bounds for clamping
   */
  public setMapBounds(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
  }

  /**
   * Set viewport dimensions
   */
  public setViewportDimensions(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Clamp camera position to prevent showing empty space beyond map borders
   */
  public clamp(position: { x: number; y: number }): { x: number; y: number } {
    const maxX = Math.max(0, this.mapWidth - this.viewportWidth);
    const maxY = Math.max(0, this.mapHeight - this.viewportHeight);

    return {
      x: clamp(position.x, 0, maxX),
      y: clamp(position.y, 0, maxY)
    };
  }

  /**
   * Check if a world point is visible in the current viewport
   */
  public isVisible(
    cameraX: number,
    cameraY: number,
    worldX: number,
    worldY: number,
    padding: number = 0
  ): boolean {
    return (
      worldX >= cameraX - padding &&
      worldX <= cameraX + this.viewportWidth + padding &&
      worldY >= cameraY - padding &&
      worldY <= cameraY + this.viewportHeight + padding
    );
  }

  /**
   * Get frustum bounds for culling
   */
  public getFrustumBounds(
    cameraX: number,
    cameraY: number,
    padding: number = 0
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    return {
      minX: cameraX - padding,
      minY: cameraY - padding,
      maxX: cameraX + this.viewportWidth + padding,
      maxY: cameraY + this.viewportHeight + padding
    };
  }

  /**
   * Calculate maximum valid camera position
   */
  public getMaxCameraPosition(): { x: number; y: number } {
    return {
      x: Math.max(0, this.mapWidth - this.viewportWidth),
      y: Math.max(0, this.mapHeight - this.viewportHeight)
    };
  }

  /**
   * Get visible tile range for rendering optimization
   */
  public getVisibleTileRange(
    cameraX: number,
    cameraY: number,
    tileSize: number,
    mapTileCountX: number,
    mapTileCountY: number,
    paddingTiles: number = 2
  ): { minCol: number; minRow: number; maxCol: number; maxRow: number } {
    const padding = tileSize * paddingTiles;
    const frustum = this.getFrustumBounds(cameraX, cameraY, padding);

    return {
      minCol: Math.max(0, Math.floor(frustum.minX / tileSize)),
      minRow: Math.max(0, Math.floor(frustum.minY / tileSize)),
      maxCol: Math.min(mapTileCountX, Math.ceil(frustum.maxX / tileSize)),
      maxRow: Math.min(mapTileCountY, Math.ceil(frustum.maxY / tileSize))
    };
  }
}
