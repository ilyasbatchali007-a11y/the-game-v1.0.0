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
import { isTileBlocking, isThresholdTile, TILE_SIZE } from '../config/MapData';

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
    // Calculate next position with floating-point precision
    let nextX = x + vx * dt;
    let nextY = y + vy * dt;

    // Get current world dimensions dynamically
    const worldWidth = getCurrentWorldWidth();
    const worldHeight = getCurrentWorldHeight();

    // Clamp to world bounds (dynamic)
    nextX = Math.max(0, Math.min(nextX, worldWidth - width));
    nextY = Math.max(0, Math.min(nextY, worldHeight - height));

    // Check tile collisions at corners of the entity's bounding box
    // This enables seamless sliding along walls with floating-point positions
    const margin = 1; // Small margin to prevent sticking
    
    // Check all four corners of the entity
    const corners = [
      { x: nextX + margin, y: nextY + margin },
      { x: nextX + width - margin, y: nextY + margin },
      { x: nextX + margin, y: nextY + height - margin },
      { x: nextX + width - margin, y: nextY + height - margin }
    ];

    let hasCollision = false;
    for (const corner of corners) {
      const col = Math.floor(corner.x / TILE_SIZE);
      const row = Math.floor(corner.y / TILE_SIZE);
      if (isTileBlocking(col, row) || isThresholdTile(col, row)) {
        hasCollision = true;
        break;
      }
    }

    // Simple slide: if collision detected, don't move (can be enhanced with axis-separated sliding)
    if (hasCollision) {
      // Try moving only on X axis
      let canMoveX = true;
      const xCorners = [
        { x: nextX + margin, y: y + margin },
        { x: nextX + width - margin, y: y + margin },
        { x: nextX + margin, y: y + height - margin },
        { x: nextX + width - margin, y: y + height - margin }
      ];
      for (const corner of xCorners) {
        const col = Math.floor(corner.x / TILE_SIZE);
        const row = Math.floor(corner.y / TILE_SIZE);
        if (isTileBlocking(col, row) || isThresholdTile(col, row)) {
          canMoveX = false;
          break;
        }
      }
      
      if (canMoveX) {
        return { x: nextX, y };
      }

      // Try moving only on Y axis
      let canMoveY = true;
      const yCorners = [
        { x: x + margin, y: nextY + margin },
        { x: x + width - margin, y: nextY + margin },
        { x: x + margin, y: nextY + height - margin },
        { x: x + width - margin, y: nextY + height - margin }
      ];
      for (const corner of yCorners) {
        const col = Math.floor(corner.x / TILE_SIZE);
        const row = Math.floor(corner.y / TILE_SIZE);
        if (isTileBlocking(col, row) || isThresholdTile(col, row)) {
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