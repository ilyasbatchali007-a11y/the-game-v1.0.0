import { World } from '../ecs/World';
import { MovementSystem } from '../systems/MovementSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { GLInstancedRenderer } from '../render/GLInstancedRenderer';
import { Camera } from '../engine/Camera';
import { MapRenderer } from '../render/MapRenderer';
import { FIXED_DT, PLAYER_ID } from '../config/Constants';

export interface LoopState {
  gameRunning: boolean;
  accumulator: number;
  lastTime: number;
  inputState: Record<string, boolean>;
}

export interface LoopDependencies {
  world: World;
  renderer: GLInstancedRenderer;
  camera: Camera;
  ctx: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  movementSystem: MovementSystem;
  collisionSystem: CollisionSystem;
  texture: WebGLTexture;
  mapRenderer: MapRenderer;
}

/**
 * Manages the fixed-timestep game loop with rendering
 */
export function startGameLoop(
  state: LoopState,
  deps: LoopDependencies
): void {
  const { world, renderer, camera, ctx, canvas, movementSystem, collisionSystem, texture, mapRenderer } = deps;

  // Reset timing
  state.lastTime = performance.now();
  state.accumulator = 0;

  function loop(now: number) {
    if (!state.gameRunning) {
      requestAnimationFrame(loop);
      return;
    }

    const dt = (now - state.lastTime) / 1000;
    state.lastTime = now;
    state.accumulator += Math.min(dt, 0.25); // Prevent spiral of death

    // Fixed timestep updates
    while (state.accumulator >= FIXED_DT) {
      movementSystem.update(world, state.inputState, FIXED_DT);
      collisionSystem.update(world as any, FIXED_DT, PLAYER_ID);
      state.accumulator -= FIXED_DT;
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
    if (cameraMoved || state.lastTime === now) {
      const floorData = mapRenderer.getFloorData(camX, camY, canvas.width, canvas.height);
      renderer.renderFloor(floorData, canvas.width, canvas.height, texture, camX, camY);
    } else {
      renderer.renderFloor(null, canvas.width, canvas.height, texture, camX, camY);
    }

    // Draw Player Entity (red square) on Top
    renderer.renderPlayer(world, canvas.width, canvas.height, texture, camX, camY);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

/**
 * Handles keyboard input for movement
 */
export function setupInputHandlers(state: LoopState): void {
  window.addEventListener('keydown', (e) => {
    if (!state.gameRunning) return;
    state.inputState[e.key] = true;
  });

  window.addEventListener('keyup', (e) => {
    if (!state.gameRunning) return;
    state.inputState[e.key] = false;
  });
}
