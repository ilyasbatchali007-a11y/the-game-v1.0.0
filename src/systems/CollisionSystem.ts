type World = {
  active: boolean[];
  speed: number[];
  vx: number[];
  vy: number[];
  x: number[];
  y: number[];
  w: number[];
  h: number[];
};

import { getCurrentWorldWidth, getCurrentWorldHeight } from '../config/MapData';
import { isTileBlocking, TILE_SIZE } from '../config/MapData';

export class CollisionSystem {
  public update(world: World, dt: number, playerId: number = 0): void {
    if (!world.active[playerId]) return;

    const vx = world.vx[playerId] ?? 0;
    const vy = world.vy[playerId] ?? 0;

    // Apply collision and wall-sliding physics with floating-point precision
    const nextPos = this.moveAndSlide(
      world.x[playerId],
      world.y[playerId],
      vx,
      vy,
      world.w[playerId] || 32,
      world.h[playerId] || 32,
      dt
    );

    world.x[playerId] = nextPos.x;
    world.y[playerId] = nextPos.y;
  }

  private moveAndSlide(
    x: number,
    y: number,
    vx: number,
    vy: number,
    width: number,
    height: number,
    dt: number
  ): { x: number; y: number } {
    // Define footprint box at the bottom of the entity for collision checks
    // This prevents early stopping when moving UP and passing through borders when moving DOWN
    const footLeft = x + (width * 0.2);
    const footRight = x + (width * 0.8);
    const footTop = y + (height * 0.75);
    const footBottom = y + height;

    // Calculate next position with floating-point precision
    let nextX = x + vx * dt;
    let nextY = y + vy * dt;

    // Calculate next footprint position
    const nextFootLeft = nextX + (width * 0.2);
    const nextFootRight = nextX + (width * 0.8);
    const nextFootTop = nextY + (height * 0.75);
    const nextFootBottom = nextY + height;

    // Get current world dimensions dynamically
    const worldWidth = getCurrentWorldWidth();
    const worldHeight = getCurrentWorldHeight();

    // Clamp to world bounds (dynamic) - using full entity bounds
    nextX = Math.max(0, Math.min(nextX, worldWidth - width));
    nextY = Math.max(0, Math.min(nextY, worldHeight - height));

    // Check tile collisions at footprint corners
    // This enables seamless sliding along walls with floating-point positions
    const margin = 1; // Small margin to prevent sticking
    
    // Check all four corners of the footprint box
    const footCorners = [
      { x: nextFootLeft + margin, y: nextFootTop + margin },
      { x: nextFootRight - margin, y: nextFootTop + margin },
      { x: nextFootLeft + margin, y: nextFootBottom - margin },
      { x: nextFootRight - margin, y: nextFootBottom - margin }
    ];

    let hasCollision = false;
    for (const corner of footCorners) {
      const col = Math.floor(corner.x / TILE_SIZE);
      const row = Math.floor(corner.y / TILE_SIZE);
      if (isTileBlocking(col, row)) {
        hasCollision = true;
        break;
      }
    }

    // Simple slide: if collision detected, don't move (can be enhanced with axis-separated sliding)
    if (hasCollision) {
      // Try moving only on X axis (check footprint at original Y)
      let canMoveX = true;
      const origFootTop = y + (height * 0.75);
      const origFootBottom = y + height;
      const xFootCorners = [
        { x: nextFootLeft + margin, y: origFootTop + margin },
        { x: nextFootRight - margin, y: origFootTop + margin },
        { x: nextFootLeft + margin, y: origFootBottom - margin },
        { x: nextFootRight - margin, y: origFootBottom - margin }
      ];
      for (const corner of xFootCorners) {
        const col = Math.floor(corner.x / TILE_SIZE);
        const row = Math.floor(corner.y / TILE_SIZE);
        if (isTileBlocking(col, row)) {
          canMoveX = false;
          break;
        }
      }
      
      if (canMoveX) {
        return { x: nextX, y };
      }

      // Try moving only on Y axis (check footprint at original X)
      let canMoveY = true;
      const origFootLeft = x + (width * 0.2);
      const origFootRight = x + (width * 0.8);
      const yFootCorners = [
        { x: origFootLeft + margin, y: nextFootTop + margin },
        { x: origFootRight - margin, y: nextFootTop + margin },
        { x: origFootLeft + margin, y: nextFootBottom - margin },
        { x: origFootRight - margin, y: nextFootBottom - margin }
      ];
      for (const corner of yFootCorners) {
        const col = Math.floor(corner.x / TILE_SIZE);
        const row = Math.floor(corner.y / TILE_SIZE);
        if (isTileBlocking(col, row)) {
          canMoveY = false;
          break;
        }
      }
      
      if (canMoveY) {
        return { x, y: nextY };
      }

      // Full collision - don't move
      return { x, y };
    }

    return { x: nextX, y: nextY };
  }
}