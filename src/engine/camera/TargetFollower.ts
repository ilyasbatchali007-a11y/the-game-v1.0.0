// SRC/engine/camera/TargetFollower.ts
// Handles smooth exponential decay interpolation for camera following a target
// Implements frame-rate independent lerp with convergence detection

import { lerp, clamp } from '../../utils/MathUtils';

export interface ICameraTarget {
  x: number;
  y: number;
}

export class TargetFollower {
  private target: ICameraTarget | null = null;
  private smoothFactor: number = 0.1;
  private lambda: number = -Math.log(1 - 0.1);
  private readonly EPSILON: number = 0.01;

  // Static offset from target position
  private offsetX: number = 0;
  private offsetY: number = 0;

  /**
   * Set the camera target (player/entity to follow)
   */
  public setTarget(target: ICameraTarget): void {
    this.target = target;
  }

  /**
   * Clear the current target
   */
  public clearTarget(): void {
    this.target = null;
  }

  /**
   * Set a static offset for the camera relative to the target
   */
  public setOffset(offsetX: number, offsetY: number): void {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  /**
   * Get current offset values
   */
  public getOffset(): { offsetX: number; offsetY: number } {
    return { offsetX: this.offsetX, offsetY: this.offsetY };
  }

  /**
   * Set smooth interpolation factor (0-1)
   */
  public setSmoothFactor(factor: number): void {
    this.smoothFactor = clamp(factor, 0.01, 1.0);
    this.lambda = -Math.log(1 - this.smoothFactor);
  }

  /**
   * Get current smooth factor
   */
  public getSmoothFactor(): number {
    return this.smoothFactor;
  }

  /**
   * Calculate ideal camera position based on target and offset
   */
  public calculateIdealPosition(
    viewportWidth: number,
    viewportHeight: number
  ): { x: number; y: number } | null {
    if (!this.target) return null;

    return {
      x: this.target.x - viewportWidth / 2 + this.offsetX,
      y: this.target.y - viewportHeight / 2 + this.offsetY
    };
  }

  /**
   * Interpolate current position toward target position
   * Returns true if movement occurred, false if converged
   */
  public interpolate(
    currentPosition: { x: number; y: number },
    viewportWidth: number,
    viewportHeight: number,
    deltaTime: number = 1
  ): { x: number; y: number; moved: boolean } {
    const ideal = this.calculateIdealPosition(viewportWidth, viewportHeight);
    
    if (!ideal) {
      return { x: currentPosition.x, y: currentPosition.y, moved: false };
    }

    // Check if already within epsilon threshold
    const dx = ideal.x - currentPosition.x;
    const dy = ideal.y - currentPosition.y;

    if (Math.abs(dx) < this.EPSILON && Math.abs(dy) < this.EPSILON) {
      return { x: ideal.x, y: ideal.y, moved: false };
    }

    // Frame-rate independent exponential decay
    const factor = 1 - Math.exp(-this.lambda * deltaTime);

    return {
      x: lerp(currentPosition.x, ideal.x, factor),
      y: lerp(currentPosition.y, ideal.y, factor),
      moved: true
    };
  }

  /**
   * Get current target if exists
   */
  public getTarget(): ICameraTarget | null {
    return this.target;
  }

  /**
   * Check if camera has a target
   */
  public hasTarget(): boolean {
    return this.target !== null;
  }
}
