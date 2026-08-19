/**
 * New game initialization logic
 * Resets world state and spawns player at map center
 */

import { World } from '../../ecs/World';
import { generateTestMap, getCurrentWorldWidth, getCurrentWorldHeight } from '../../config/MapData';
import { PLAYER_ID } from '../../config/Constants';
import { Camera } from '../../engine/Camera';
import { GLInstancedRenderer } from '../../render/GLInstancedRenderer';

/**
 * Initialize a new game session with fresh world state
 */
export function initNewGame(
  world: World,
  renderer: GLInstancedRenderer | null,
  camera: Camera | null
): void {
  // Generate new random seed for the renderer (new map layout)
  if (renderer) {
    (renderer as any)['sessionSeed'] = Math.random() * 10000.0;
  }
  
  // Reset world and start new game
  const newWorld = new World();
  generateTestMap();
  if (renderer) renderer.updateMapDataTexture();
  
  // Respawn player at center of new map
  const playerX = getCurrentWorldWidth() / 2;
  const playerY = getCurrentWorldHeight() / 2;
  newWorld.active[PLAYER_ID] = 1;
  newWorld.x[PLAYER_ID] = playerX;
  newWorld.y[PLAYER_ID] = playerY;
  newWorld.w[PLAYER_ID] = 32;
  newWorld.h[PLAYER_ID] = 32;
  newWorld.speed[PLAYER_ID] = 200;
  newWorld.vx[PLAYER_ID] = 0;
  newWorld.vy[PLAYER_ID] = 0;
  newWorld.rotation[PLAYER_ID] = 0;
  newWorld.set.count = 1;
  newWorld.set.dense[0] = PLAYER_ID;
  
  if (camera) {
    camera.setTarget({ x: playerX, y: playerY });
    camera.snapToTarget();
  }
  
  // Copy new world state to existing world reference
  Object.assign(world, newWorld);
}
