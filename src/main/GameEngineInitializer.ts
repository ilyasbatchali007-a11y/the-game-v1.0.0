import { generateTestMap, getCurrentWorldWidth, getCurrentWorldHeight } from '../config/MapData';
import { MAX_ENTITIES, PLAYER_ID } from '../config/Constants';
import { World } from '../ecs/World';
import { MovementSystem } from '../systems/MovementSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { GLInstancedRenderer } from '../render/GLInstancedRenderer';
import { AssetLoader } from '../engine/AssetLoader';
import { Camera, createPlayerCamera } from '../engine/Camera';
import { MapRenderer } from '../render/MapRenderer';

export interface EngineContext {
  canvas: HTMLCanvasElement;
  ctx: WebGL2RenderingContext;
  world: World;
  renderer: GLInstancedRenderer;
  camera: Camera;
  movementSystem: MovementSystem;
  collisionSystem: CollisionSystem;
  texture: WebGLTexture;
  mapRenderer: MapRenderer;
}

/**
 * Initializes core game engine: canvas, WebGL2 context, ECS world, systems, renderer, camera
 */
export async function initializeGameEngine(): Promise<EngineContext> {
  // Setup Canvas & WebGL2 Context
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas not found');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL 2 is not supported.');

  const ctx = gl as WebGL2RenderingContext;
  ctx.viewport(0, 0, canvas.width, canvas.height);
  ctx.clearColor(0.1, 0.1, 0.12, 1.0);

  // Initialize Core Systems & World
  const world = new World();
  const movementSystem = new MovementSystem();
  const collisionSystem = new CollisionSystem();
  const renderer = new GLInstancedRenderer(ctx, MAX_ENTITIES);

  // Generate test map BEFORE spawning player
  generateTestMap();
  console.log('[Engine] Map generated, size:', world.set.count, 'tiles');

  // Update renderer's map data texture after map generation
  renderer.updateMapDataTexture();

  // Spawn player entity at center of map (avoiding border walls)
  const playerX = getCurrentWorldWidth() / 2;
  const playerY = getCurrentWorldHeight() / 2;
  world.active[PLAYER_ID] = 1;
  world.x[PLAYER_ID] = playerX;
  world.y[PLAYER_ID] = playerY;
  world.w[PLAYER_ID] = 32;
  world.h[PLAYER_ID] = 32;
  world.speed[PLAYER_ID] = 200;
  world.vx[PLAYER_ID] = 0;
  world.vy[PLAYER_ID] = 0;
  world.rotation[PLAYER_ID] = 0;

  // Update sparse set for renderer
  world.set.count = 1;
  world.set.dense[0] = PLAYER_ID;

  // Set up isometric projection (rotate 45 degrees, scale Y by 0.5)
  renderer.setIsometricView(Math.PI / 4, 0.5);

  // Create camera following the player with isometric view and offset
  const camera = createPlayerCamera(
    { x: playerX, y: playerY },
    canvas.width,
    canvas.height,
    1.0, // Immediate camera follow
    -320,   // offsetX
    -100    // offsetY
  );

  // Initialize camera position to player position so map is visible on first frame
  camera.snapToTarget();

  // Load Atlas Texture
  let texture: WebGLTexture;
  try {
    texture = await AssetLoader.loadTexture(
      ctx,
      'src/atlas pictures/atlas floor.jpg'
    );
    console.log('[Engine] Atlas texture loaded successfully');
  } catch (error) {
    console.warn('[Engine] Failed to load atlas texture, using placeholder', error);
    texture = await AssetLoader.loadTexture(
      ctx,
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    );
  }

  const mapRenderer = new MapRenderer();

  return {
    canvas,
    ctx,
    world,
    renderer,
    camera,
    movementSystem,
    collisionSystem,
    texture,
    mapRenderer
  };
}

/**
 * Exposes floor switching functions globally for UI/debugging
 */
export function exposeFloorSwitchingAPI(mapRenderer: MapRenderer): void {
  (window as any).switchFloor = (floorId: number) => mapRenderer.switchFloor(floorId);
  (window as any).getCurrentFloor = () => mapRenderer.getCurrentFloorId();
  (window as any).getAvailableFloors = () => mapRenderer.getAvailableFloors();
}
