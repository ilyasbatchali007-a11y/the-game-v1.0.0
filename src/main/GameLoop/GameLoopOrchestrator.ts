/**
 * GameLoopOrchestrator - Manages the fixed timestep game loop, input handling, and rendering coordination
 * Separated from main.ts to isolate game loop responsibilities
 */

import { World } from '../../ecs/World';
import { MovementSystem } from '../../systems/MovementSystem';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { GLInstancedRenderer } from '../../render/GLInstancedRenderer';
import { Camera } from '../../engine/Camera';
import { MapRenderer } from '../../render/MapRenderer';
import { FIXED_DT, PLAYER_ID } from '../../config/Constants';

export interface GameLoopDependencies {
  world: World;
  renderer: GLInstancedRenderer;
  camera: Camera;
  movementSystem: MovementSystem;
  collisionSystem: CollisionSystem;
  mapRenderer: MapRenderer;
  canvas: HTMLCanvasElement;
  ctx: WebGL2RenderingContext;
  texture: WebGLTexture | null;
}

export class GameLoopOrchestrator {
  private deps: GameLoopDependencies;
  private gameRunning: boolean = false;
  private inputState: Record<string, boolean> = {};
  private accumulator: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;

  constructor(deps: GameLoopDependencies) {
    this.deps = deps;
  }

  public start(): void {
    this.gameRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.inputState = {};
    this.loop();
  }

  public stop(): void {
    this.gameRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public isRunning(): boolean {
    return this.gameRunning;
  }

  public handleInput(key: string, pressed: boolean): void {
    this.inputState[key] = pressed;
  }

  private loop(): void {
    if (!this.gameRunning) {
      return;
    }

    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.accumulator += Math.min(dt, 0.25); // Prevent spiral of death

    // Fixed timestep updates
    while (this.accumulator >= FIXED_DT) {
      this.deps.movementSystem.update(this.deps.world, this.inputState, FIXED_DT);
      this.deps.collisionSystem.update(this.deps.world as any, FIXED_DT, PLAYER_ID);
      this.accumulator -= FIXED_DT;
    }

    // Sync camera target with the latest player position
    this.deps.camera.setTarget({ x: this.deps.world.x[PLAYER_ID], y: this.deps.world.y[PLAYER_ID] });

    // Update camera and check if it moved
    const cameraMoved = this.deps.camera.update(dt);

    // Render Frame
    this.deps.ctx.clear(this.deps.ctx.COLOR_BUFFER_BIT);

    // Get camera position for rendering
    const camX = this.deps.camera.getX();
    const camY = this.deps.camera.getY();
    const canvas = this.deps.canvas;
    const texture = this.deps.texture;
    const renderer = this.deps.renderer;
    const mapRenderer = this.deps.mapRenderer;

    // Always recalculate floor data on first few frames OR when camera moved
    if (cameraMoved || this.lastTime === now) { // First frame condition
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
    renderer.renderPlayer(this.deps.world, canvas.width, canvas.height, texture, camX, camY);

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }
}
