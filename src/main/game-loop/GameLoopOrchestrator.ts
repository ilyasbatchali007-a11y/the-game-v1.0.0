/**
 * Fixed timestep game loop with accumulator for physics updates
 * Handles movement, collision, camera sync, and floor/entity rendering
 */

import { World } from '../../ecs/World';
import { MovementSystem } from '../../systems/MovementSystem';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { Camera } from '../../engine/Camera';
import { GLInstancedRenderer } from '../../render/GLInstancedRenderer';
import { MapRenderer } from '../../render/MapRenderer';
import { FIXED_DT, PLAYER_ID } from '../../config/Constants';
import { TILE_SIZE, MAP_TILE_DATA, getCurrentMapCols, getCurrentMapRows, getCurrentWorldWidth, getCurrentWorldHeight } from '../../config/MapData';
import { getFloorCount } from '../../config/FloorMap';

export interface GameLoopState {
  isRunning: boolean;
  inputState: Record<string, boolean>;
}

let accumulator = 0;
let lastTime = 0;
let floorSwitchCooldown = false;

/**
 * Starts the fixed-timestep game loop with render cycle
 */
export function startGameLoop(
  world: World,
  movementSystem: MovementSystem,
  collisionSystem: CollisionSystem,
  renderer: GLInstancedRenderer,
  camera: Camera,
  mapRenderer: MapRenderer,
  ctx: WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  texture: WebGLTexture,
  onInputStateUpdate: (inputState: Record<string, boolean>) => void
): () => void {
  // Reset timing
  lastTime = performance.now();
  accumulator = 0;

  let animationFrameId: number;

  function loop(now: number) {
    if (!gameLoopState.isRunning) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    const dt = (now - lastTime) / 1000;
    lastTime = now;
    accumulator += Math.min(dt, 0.25); // Prevent spiral of death

    // Fixed timestep updates
    while (accumulator >= FIXED_DT) {
      movementSystem.update(world, gameLoopState.inputState, FIXED_DT);
      collisionSystem.update(world as any, FIXED_DT, PLAYER_ID);

      accumulator -= FIXED_DT;
    }

    // Sync camera target with the latest player position
    camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });

    // Update camera and check if it moved
    const cameraMoved = camera.update(dt);

    // Render Frame
    ctx.clear(ctx.COLOR_BUFFER_BIT);

    // Get camera position for rendering
    const camX = camera.getX();
    const camY = camera.getY();

    // Always recalculate floor data on first few frames OR when camera moved
    if (cameraMoved || lastTime === now) {
      // 1. Get floor data and render as SINGLE quad (1 draw call instead of 1024+)
      const floorData = mapRenderer.getFloorData(
        camX, camY,
        canvas.width,
        canvas.height
      );

      // 2. Render seamless floor in ONE draw call
      renderer.renderFloor(
        floorData,
        canvas.width,
        canvas.height,
        texture,
        camX,
        camY
      );
    } else {
      // Re-render floor without recalculating data
      renderer.renderFloor(
        null,
        canvas.width,
        canvas.height,
        texture,
        camX,
        camY
      );
    }

    // 3. Draw Player Entity (red square) on Top
    renderer.renderPlayer(world, canvas.width, canvas.height, texture, camX, camY);

    animationFrameId = requestAnimationFrame(loop);
  }

  animationFrameId = requestAnimationFrame(loop);

  // Return stop function
  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}

const gameLoopState: GameLoopState = {
  isRunning: false,
  inputState: {}
};

export function getGameLoopState(): GameLoopState {
  return gameLoopState;
}

export function setGameRunning(running: boolean): void {
  gameLoopState.isRunning = running;
}

export function getInputState(): Record<string, boolean> {
  return gameLoopState.inputState;
}

export function resetInputState(): void {
  gameLoopState.inputState = {};
}

export function setFloorSwitchCooldown(active: boolean): void {
  floorSwitchCooldown = active;
}

export function getFloorSwitchCooldown(): boolean {
  return floorSwitchCooldown;
}

/**
 * Handle floor switching logic with player teleportation
 */
export function switchToFloor(
  newFloor: number,
  world: World,
  camera: Camera,
  renderer: GLInstancedRenderer | null,
  mapRenderer: MapRenderer
): void {
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
  camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
  camera.snapToTarget();
}

/**
 * Handle portal interaction - switch floor based on portal type
 */
export function handlePortalInteraction(
  world: World,
  camera: Camera,
  renderer: GLInstancedRenderer | null,
  mapRenderer: MapRenderer
): void {
  const playerCol = Math.floor(world.x[PLAYER_ID] / TILE_SIZE);
  const playerRow = Math.floor(world.y[PLAYER_ID] / TILE_SIZE);
  
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
          const currentFloor = mapRenderer.getCurrentFloorId();
          let newFloor: number;
          
          if (tileId === 1000) {
            // Next floor portal (blue)
            newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
          } else {
            // Previous floor portal (red)
            newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
          }
          
          switchToFloor(newFloor, world, camera, renderer, mapRenderer);
          console.log(`[Portal] Stepped on ${tileId === 1000 ? 'NEXT' : 'PREVIOUS'} floor portal, switched to floor ${newFloor}`);
          return;
        }
      }
    }
  }
}
