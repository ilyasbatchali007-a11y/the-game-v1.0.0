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

import { getCurrentWorldWidth, getCurrentWorldHeight, getMapData, getCurrentMapRows, getCurrentMapCols } from '../config/MapData';
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
      world.w[playerId] || TILE_SIZE,
      world.h[playerId] || TILE_SIZE,
      dt
    );

    world.x[playerId] = nextPos.x;
    world.y[playerId] = nextPos.y;
  }

  /**
   * Checks if the full outer base of the entity is on valid walkable floor tiles.
   * This validates all 4 corners of the base against the tile grid.
   * Returns false if any corner is out of bounds OR on a blocking tile (void/wall).
   */
  private isBaseOnValidFloor(
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    // Calculate tile coordinates for the full base corners
    const leftCol = Math.floor(x / TILE_SIZE);
    const rightCol = Math.floor((x + width - 1) / TILE_SIZE);
    const bottomRow = Math.floor((y + height - 1) / TILE_SIZE);
    
    // Get current map dimensions directly from MAP_DATA array
    const mapCols = getCurrentMapCols();
    const mapRows = getCurrentMapRows();
    
    // Check if base corners are within strict grid bounds
    // If any corner is outside the array, it's VOID
    if (leftCol < 0 || rightCol >= mapCols || bottomRow < 0 || bottomRow >= mapRows) {
        return false;
    }
    
    // Check if both bottom corners are on valid walkable floor tiles
    // isTileBlocking returns true for walls/void (including tile ID 0 if configured so), false for walkable
    const leftWalkable = !isTileBlocking(leftCol, bottomRow);
    const rightWalkable = !isTileBlocking(rightCol, bottomRow);
    
    return leftWalkable && rightWalkable;
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

    // STEP 1: Floor validation - MUST run first and take precedence
    // If the full base would step off valid floor, reject movement immediately
    if (!this.isBaseOnValidFloor(nextX, nextY, width, height)) {
        // Movement would take entity off valid floor - reject this movement
        // Revert to previous valid position
        return { x, y };
    }

    // STEP 2: Define footprint box at the bottom of the entity for wall collision checks
    // This prevents early stopping when moving UP and passing through borders when moving DOWN
    const footLeft = nextX + (width * 0.2);
    const footRight = nextX + (width * 0.8);
    const footTop = nextY + (height * 0.75);
    const footBottom = nextY + height;

    // STEP 3: Wall collision checks using the shrunken footprint
    // Check tile collisions at footprint corners for smooth sliding
    const margin = 1; // Small margin to prevent sticking
    
    // Check all four corners of the footprint box
    const footCorners = [
      { x: footLeft + margin, y: footTop + margin },
      { x: footRight - margin, y: footTop + margin },
      { x: footLeft + margin, y: footBottom - margin },
      { x: footRight - margin, y: footBottom - margin }
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

    // Simple slide: if collision detected, try axis-separated sliding
    if (hasCollision) {
      // Try moving only on X axis (check footprint at original Y)
      let canMoveX = true;
      const origFootTop = y + (height * 0.75);
      const origFootBottom = y + height;
      const xFootCorners = [
        { x: footLeft + margin, y: origFootTop + margin },
        { x: footRight - margin, y: origFootTop + margin },
        { x: footLeft + margin, y: origFootBottom - margin },
        { x: footRight - margin, y: origFootBottom - margin }
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
        // Verify floor validity for X-only movement
        if (this.isBaseOnValidFloor(nextX, y, width, height)) {
            return { x: nextX, y };
        }
      }

      // Try moving only on Y axis (check footprint at original X)
      let canMoveY = true;
      const origFootLeft = x + (width * 0.2);
      const origFootRight = x + (width * 0.8);
      const yFootCorners = [
        { x: origFootLeft + margin, y: footTop + margin },
        { x: origFootRight - margin, y: footTop + margin },
        { x: origFootLeft + margin, y: footBottom - margin },
        { x: origFootRight - margin, y: footBottom - margin }
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
        // Verify floor validity for Y-only movement
        if (this.isBaseOnValidFloor(x, nextY, width, height)) {
            return { x, y: nextY };
        }
      }

      // Full collision or invalid floor - don't move
      return { x, y };
    }

    return { x: nextX, y: nextY };
  }
}