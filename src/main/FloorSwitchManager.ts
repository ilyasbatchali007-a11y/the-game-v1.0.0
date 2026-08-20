import { CELL_SIZE, PLAYER_ID } from '../config/Constants';
import { getCurrentWorldWidth, getCurrentWorldHeight, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA } from '../config/MapData';
import { getFloorCount } from '../config/FloorMap';

/**
 * Handles floor switching logic and player teleportation.
 */
export class FloorSwitchManager {
  private cooldown: boolean = false;
  private readonly cooldownDuration: number = 200; // ms

  /**
   * Switch to a specific floor and teleport player to center
   */
  switchFloor(
    mapRenderer: any,
    world: any,
    camera: any,
    renderer: any,
    targetFloor: number
  ): void {
    if (this.cooldown) return;

    const currentFloor = mapRenderer.getCurrentFloorId();
    if (targetFloor < 0 || targetFloor >= getFloorCount()) return;

    this.cooldown = true;
    mapRenderer.switchFloor(targetFloor);

    // Update renderer's map data texture after floor switch
    if (renderer) {
      renderer.updateMapDataTexture();
    }

    // Teleport player to center of new floor and update camera
    if (world) {
      world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
      world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
      world.vx[PLAYER_ID] = 0;
      world.vy[PLAYER_ID] = 0;
      if (camera) {
        camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
        camera.snapToTarget();
      }
    }

    setTimeout(() => { this.cooldown = false; }, this.cooldownDuration);
  }

  /**
   * Switch to previous floor (wrap around)
   */
  switchToPreviousFloor(
    mapRenderer: any,
    world: any,
    camera: any,
    renderer: any
  ): void {
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
    this.switchFloor(mapRenderer, world, camera, renderer, newFloor);
  }

  /**
   * Switch to next floor (wrap around)
   */
  switchToNextFloor(
    mapRenderer: any,
    world: any,
    camera: any,
    renderer: any
  ): void {
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
    this.switchFloor(mapRenderer, world, camera, renderer, newFloor);
  }

  /**
   * Handle portal interaction - switch floor based on portal type
   */
  handlePortalInteraction(
    mapRenderer: any,
    world: any,
    camera: any,
    renderer: any
  ): void {
    if (this.cooldown || !world) return;

    const playerCol = Math.floor(world.x[PLAYER_ID] / CELL_SIZE);
    const playerRow = Math.floor(world.y[PLAYER_ID] / CELL_SIZE);

    // Check surrounding tiles (including current tile) for portal
    for (let dRow = -1; dRow <= 1; dRow++) {
      for (let dCol = -1; dCol <= 1; dCol++) {
        const checkCol = playerCol + dCol;
        const checkRow = playerRow + dRow;

        if (checkCol >= 0 && checkCol < getCurrentMapCols() &&
            checkRow >= 0 && checkRow < getCurrentMapRows()) {
          const idx = (checkRow * getCurrentMapCols() + checkCol) * 2;
          const tileId = MAP_TILE_DATA[idx];

          // Check if this is a portal tile
          if (tileId === 1000 || tileId === 1001) {
            this.cooldown = true;

            const currentFloor = mapRenderer.getCurrentFloorId();
            const newFloor = tileId === 1000
              ? (currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0)
              : (currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1);

            mapRenderer.switchFloor(newFloor);

            // Update renderer's map data texture after floor switch
            if (renderer) {
              renderer.updateMapDataTexture();
            }

            // Teleport player to center of new floor
            world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
            world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
            world.vx[PLAYER_ID] = 0;
            world.vy[PLAYER_ID] = 0;
            if (camera) {
              camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
              camera.snapToTarget();
            }

            console.log(`[Portal] Stepped on ${tileId === 1000 ? 'NEXT' : 'PREVIOUS'} floor portal, switched to floor ${newFloor}`);
            setTimeout(() => { this.cooldown = false; }, 300);
            return;
          }
        }
      }
    }
  }

  /**
   * Check if floor switching is currently on cooldown
   */
  isOnCooldown(): boolean {
    return this.cooldown;
  }
}
