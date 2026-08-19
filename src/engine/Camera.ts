// SRC/engine/Camera.ts
// Player-centered camera system with smooth interpolation and viewport clamping
// Orchestrates TargetFollower, MatrixCalculator, ViewportClamper, and IsometricProjector

import { clamp } from '../utils/MathUtils';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config/Constants';
import { TILE_SIZE } from '../config/MapData';
import { TargetFollower, ICameraTarget } from './camera/TargetFollower';
import { MatrixCalculator } from './camera/MatrixCalculator';
import { ViewportClamper } from './camera/ViewportClamper';
import { IsometricProjector } from './camera/IsometricProjector';

export interface ICameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export class Camera {
  private x: number = 0;
  private y: number = 0;
  private zoom: number = 1;
  private rotation: number = 0;

  private readonly follower: TargetFollower;
  private readonly clamper: ViewportClamper;
  private readonly projector: IsometricProjector;

  private viewportWidth: number = 800;
  private viewportHeight: number = 600;

  private mapWidth: number = WORLD_WIDTH;
  private mapHeight: number = WORLD_HEIGHT;

  // Matrix caching to avoid allocations
  private viewProjectionMatrix: Float32Array = new Float32Array(16);
  private viewMatrix: Float32Array = new Float32Array(16);
  private projectionMatrix: Float32Array = new Float32Array(16);
  private isMatrixDirty: boolean = true;

  constructor() {
    this.follower = new TargetFollower();
    this.clamper = new ViewportClamper();
    this.projector = new IsometricProjector();
  }

  /**
   * Set the camera target (player/entity to follow)
   */
  public setTarget(target: ICameraTarget): void {
    this.follower.setTarget(target);
  }

  /**
   * Set a static offset for the camera relative to the target
   */
  public setOffset(offsetX: number, offsetY: number): void {
    this.follower.setOffset(offsetX, offsetY);
    this.isMatrixDirty = true;
  }

  /**
   * Get current offset values
   */
  public getOffset(): { offsetX: number; offsetY: number } {
    return this.follower.getOffset();
  }

  /**
   * Clear the current target
   */
  public clearTarget(): void {
    this.follower.clearTarget();
  }

  /**
   * Set smooth interpolation factor (0-1)
   */
  public setSmoothFactor(factor: number): void {
    this.follower.setSmoothFactor(factor);
  }

  /**
   * Get current smooth factor
   */
  public getSmoothFactor(): number {
    return this.follower.getSmoothFactor();
  }

  /**
   * Set viewport dimensions
   */
  public setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.clamper.setViewportDimensions(width, height);
    this.projector.setViewport(width, height);
    this.isMatrixDirty = true;
  }

  /**
   * Set map bounds for clamping
   */
  public setMapBounds(width: number, height: number): void {
    this.mapWidth = width;
    this.mapHeight = height;
    this.clamper.setMapBounds(width, height);
    this.isMatrixDirty = true;
  }

  /**
   * Update camera position with frame-rate independent exponential decay
   * @returns true if camera moved, false otherwise
   */
  public update(deltaTime: number = 1): boolean {
    const result = this.follower.interpolate(
      { x: this.x, y: this.y },
      this.viewportWidth,
      this.viewportHeight,
      deltaTime
    );

    this.x = result.x;
    this.y = result.y;

    if (result.moved) {
      this.isMatrixDirty = true;
      return true;
    }
    
    this.isMatrixDirty = false;
    return false;
  }

  /**
   * Instantly snap camera to position (no interpolation)
   */
  public snapTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.isMatrixDirty = true;
  }

  /**
   * Snap camera to target immediately
   */
  public snapToTarget(): void {
    const ideal = this.follower.calculateIdealPosition(this.viewportWidth, this.viewportHeight);
    if (ideal) {
      this.x = ideal.x;
      this.y = ideal.y;
      this.isMatrixDirty = true;
    }
  }

  /**
   * Manually move camera by offset
   */
  public move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
    this.isMatrixDirty = true;
  }

  /**
   * Set zoom level
   */
  public setZoom(zoom: number): void {
    this.zoom = clamp(zoom, 0.5, 3.0);
    this.isMatrixDirty = true;
  }

  /**
   * Get current zoom level
   */
  public getZoom(): number {
    return this.zoom;
  }

  /**
   * Set rotation (for isometric angle adjustments)
   */
  public setRotation(angleRadians: number): void {
    this.rotation = angleRadians;
  }

  /**
   * Get camera X position
   */
  public getX(): number {
    return this.x;
  }

  /**
   * Get camera Y position
   */
  public getY(): number {
    return this.y;
  }

  /**
   * Get full camera state
   */
  public getState(): ICameraState {
    return {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      rotation: this.rotation
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  public worldToScreen(worldX: number, worldY: number, out?: { x: number; y: number }): { x: number; y: number } {
    const result = out || { x: 0, y: 0 };
    result.x = worldX - this.x;
    result.y = worldY - this.y;
    return result;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  public screenToWorld(screenX: number, screenY: number, out?: { x: number; y: number }): { x: number; y: number } {
    const result = out || { x: 0, y: 0 };
    result.x = screenX + this.x;
    result.y = screenY + this.y;
    return result;
  }

  /**
   * Convert world tile coordinates to isometric screen position
   */
  public tileToScreen(tileCol: number, tileRow: number): { x: number; y: number } {
    return this.projector.tileToScreen(tileCol, tileRow, this.x, this.y);
  }

  /**
   * Check if a world point is visible in the current viewport
   */
  public isVisible(worldX: number, worldY: number, padding: number = 0): boolean {
    return this.clamper.isVisible(this.x, this.y, worldX, worldY, padding);
  }

  /**
   * Check if a tile is visible in the current viewport
   */
  public isTileVisible(tileCol: number, tileRow: number): boolean {
    return this.projector.isTileVisible(tileCol, tileRow, this.x, this.y);
  }

  /**
   * Get view-projection matrix for shader uniform
   */
  public getViewProjectionMatrix(): Float32Array {
    if (!this.isMatrixDirty) {
      return this.viewProjectionMatrix;
    }

    MatrixCalculator.copyMatrix(
      MatrixCalculator.createViewProjectionMatrix(this.x, this.y, this.viewportWidth, this.viewportHeight),
      this.viewProjectionMatrix
    );

    this.isMatrixDirty = false;
    return this.viewProjectionMatrix;
  }

  /**
   * Get view matrix (camera transform only, without projection)
   */
  public getViewMatrix(): Float32Array {
    if (!this.isMatrixDirty) {
      return this.viewMatrix;
    }

    MatrixCalculator.copyMatrix(
      MatrixCalculator.createViewMatrix(this.x, this.y),
      this.viewMatrix
    );

    this.isMatrixDirty = false;
    return this.viewMatrix;
  }

  /**
   * Get projection matrix for current viewport
   */
  public getProjectionMatrix(): Float32Array {
    if (!this.isMatrixDirty) {
      return this.projectionMatrix;
    }

    MatrixCalculator.copyMatrix(
      MatrixCalculator.createOrthographicProjection(
        0,
        this.viewportWidth,
        0,
        this.viewportHeight
      ),
      this.projectionMatrix
    );

    this.isMatrixDirty = false;
    return this.projectionMatrix;
  }

  /**
   * Get frustum bounds for culling
   */
  public getFrustumBounds(padding: number = 0): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    return this.clamper.getFrustumBounds(this.x, this.y, padding);
  }

  /**
   * Get visible tile range for rendering optimization
   */
  public getVisibleTileRange(): {
    minCol: number;
    minRow: number;
    maxCol: number;
    maxRow: number;
  } {
    const mapTileCountX = Math.ceil(this.mapWidth / TILE_SIZE);
    const mapTileCountY = Math.ceil(this.mapHeight / TILE_SIZE);
    
    return this.clamper.getVisibleTileRange(
      this.x,
      this.y,
      TILE_SIZE,
      mapTileCountX,
      mapTileCountY
    );
  }
}

/**
 * Create a camera bound to a player entity
 */
export function createPlayerCamera(
  player: ICameraTarget,
  viewportWidth: number,
  viewportHeight: number,
  smoothFactor: number = 0.1,
  offsetX: number = 0,
  offsetY: number = 0
): Camera {
  const camera = new Camera();
  camera.setTarget(player);
  camera.setViewport(viewportWidth, viewportHeight);
  camera.setSmoothFactor(smoothFactor);
  camera.setOffset(offsetX, offsetY);

  return camera;
}
