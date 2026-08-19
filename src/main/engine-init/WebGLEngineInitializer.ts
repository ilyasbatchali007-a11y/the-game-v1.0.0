/**
 * WebGL2 engine initialization
 * Sets up canvas, context, world, systems, renderer, camera, and textures
 */

import { MAX_ENTITIES, PLAYER_ID } from '../../config/Constants';
import { generateTestMap, getCurrentWorldWidth, getCurrentWorldHeight } from '../../config/MapData';
import { World } from '../../ecs/World';
import { MovementSystem } from '../../systems/MovementSystem';
import { CollisionSystem } from '../../systems/CollisionSystem';
import { GLInstancedRenderer } from '../../render/GLInstancedRenderer';
import { AssetLoader } from '../../engine/AssetLoader';
import { Camera, createPlayerCamera } from '../../engine/Camera';
import { MapRenderer } from '../../render/MapRenderer';

export interface EngineComponents {
  canvas: HTMLCanvasElement;
  ctx: WebGL2RenderingContext;
  world: World;
  movementSystem: MovementSystem;
  collisionSystem: CollisionSystem;
  renderer: GLInstancedRenderer;
  camera: Camera;
  texture: WebGLTexture;
  mapRenderer: MapRenderer;
}

/**
 * Initialize the game engine with all core components
 */
export async function initEngine(): Promise<EngineComponents> {
  // 1. Setup Canvas & WebGL2 Context
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) throw new Error('Canvas not found');

  // Set canvas to window size for proper viewport
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL 2 is not supported.');

  const ctx = gl as WebGL2RenderingContext;

  ctx.viewport(0, 0, canvas.width, canvas.height);
  ctx.clearColor(0.1, 0.1, 0.12, 1.0);

  // 2. Initialize Core Systems & World
  const world = new World();
  const movementSystem = new MovementSystem();
  const collisionSystem = new CollisionSystem();
  const renderer = new GLInstancedRenderer(ctx, MAX_ENTITIES);
  
  // Generate test map BEFORE spawning player
  generateTestMap();
  console.log('[Engine] Map generated, size:', getCurrentWorldWidth() * getCurrentWorldHeight(), 'tiles');
  
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
  // Offset positions camera to show more of the map above the player
  const camera = createPlayerCamera(
    { x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] },
    canvas.width,
    canvas.height,
    1.0, // Immediate camera follow
    -320,   // offsetX (keep original camera offset)
    -100    // offsetY (keep original camera offset)
  );
  
  // Initialize camera position to player position so map is visible on first frame
  camera.snapToTarget();

  // 3. Load Atlas Texture (not used for floor - chessboard pattern is rendered in shader)
  // Texture is still loaded for entity rendering compatibility
  let texture: WebGLTexture;
  try {
    texture = await AssetLoader.loadTexture(
      ctx,
      'src/atlas pictures/atlas floor.jpg'
    );
    console.log('[Engine] Atlas texture loaded successfully');
  } catch (error) {
    console.warn('[Engine] Failed to load atlas texture, using placeholder', error);
    // Fallback to a simple placeholder texture
    texture = await AssetLoader.loadTexture(
      ctx,
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    );
  }

  // Initialize map renderer with floor switching support
  const mapRenderer = new MapRenderer();
  
  // Expose floor switching functions globally for UI/debugging
  (window as any).switchFloor = (floorId: number) => {
    return mapRenderer.switchFloor(floorId);
  };
  
  (window as any).getCurrentFloor = () => {
    return mapRenderer.getCurrentFloorId();
  };
  
  (window as any).getAvailableFloors = () => {
    return mapRenderer.getAvailableFloors();
  };

  return {
    canvas,
    ctx,
    world,
    movementSystem,
    collisionSystem,
    renderer,
    camera,
    texture,
    mapRenderer
  };
}
