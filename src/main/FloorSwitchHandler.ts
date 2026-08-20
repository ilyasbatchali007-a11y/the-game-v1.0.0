import { getFloorCount, getCurrentWorldWidth, getCurrentWorldHeight } from '../config/MapData';
import { PLAYER_ID } from '../config/Constants';
import { TILE_SIZE, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA } from '../config/MapData';

export interface FloorSwitchState {
  floorSwitchCooldown: boolean;
}

/**
 * Handles floor switching with T (previous) and G (next) keys
 */
export function handleFloorSwitch(
  e: KeyboardEvent,
  state: FloorSwitchState,
  mapRenderer: any,
  world: any,
  camera: any,
  renderer: any
): void {
  if (state.floorSwitchCooldown) return;

  if (e.key === 't' || e.key === 'T') {
    state.floorSwitchCooldown = true;
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
    mapRenderer.switchFloor(newFloor);

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

    setTimeout(() => { state.floorSwitchCooldown = false; }, 200);
  }

  if (e.key === 'g' || e.key === 'G') {
    state.floorSwitchCooldown = true;
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
    mapRenderer.switchFloor(newFloor);

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

    setTimeout(() => { state.floorSwitchCooldown = false; }, 200);
  }
}

/**
 * Handles portal interaction with E key
 */
export function handlePortalInteraction(
  e: KeyboardEvent,
  state: FloorSwitchState,
  mapRenderer: any,
  world: any,
  camera: any,
  renderer: any
): void {
  if (state.floorSwitchCooldown || !world) return;

  // Get player's current tile position
  const playerCol = Math.floor(world.x[PLAYER_ID] / TILE_SIZE);
  const playerRow = Math.floor(world.y[PLAYER_ID] / TILE_SIZE);

  // Check surrounding tiles (including current tile) for portal
  let foundPortal = false;
  for (let dRow = -1; dRow <= 1 && !foundPortal; dRow++) {
    for (let dCol = -1; dCol <= 1 && !foundPortal; dCol++) {
      const checkCol = playerCol + dCol;
      const checkRow = playerRow + dRow;

      if (checkCol >= 0 && checkCol < getCurrentMapCols() &&
          checkRow >= 0 && checkRow < getCurrentMapRows()) {
        const idx = (checkRow * getCurrentMapCols() + checkCol) * 2;
        const tileId = MAP_TILE_DATA[idx];

        // Check if this is a portal tile
        if (tileId === 1000 || tileId === 1001) {
          state.floorSwitchCooldown = true;
          foundPortal = true;

          const currentFloor = mapRenderer.getCurrentFloorId();
          let newFloor: number;

          if (tileId === 1000) {
            // Next floor portal (blue)
            newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
          } else {
            // Previous floor portal (red)
            newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
          }

          mapRenderer.switchFloor(newFloor);

          // Update renderer's map data texture after floor switch
          if (renderer) {
            renderer.updateMapDataTexture();
          }

          // Teleport player to center of new floor and update camera
          world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
          world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
          world.vx[PLAYER_ID] = 0;
          world.vy[PLAYER_ID] = 0;
          if (camera) {
            camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
            camera.snapToTarget();
          }

          console.log(`[Portal] Stepped on ${tileId === 1000 ? 'NEXT' : 'PREVIOUS'} floor portal, switched to floor ${newFloor}`);

          setTimeout(() => { state.floorSwitchCooldown = false; }, 300);
        }
      }
    }
  }
}
