// Main entry point - Orchestrator for game systems
import { generateTestMap, MAP_DATA, getCurrentWorldWidth, getCurrentWorldHeight, TILE_SIZE, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA } from './config/MapData';
import { MapRenderer } from './render/MapRenderer';
import { MAX_ENTITIES, FIXED_DT, WORLD_WIDTH, WORLD_HEIGHT, CELL_SIZE, PLAYER_ID } from './config/Constants';
import { World } from './ecs/World';
import { MovementSystem } from './systems/MovementSystem'; 
import { CollisionSystem } from './systems/CollisionSystem';
import { GLInstancedRenderer } from './render/GLInstancedRenderer';
import { AssetLoader } from './engine/AssetLoader';
import { SaveManager } from './serialization/SaveManager';
import { SaveSlotManager } from './serialization/SaveSlotManager';
import { Camera, createPlayerCamera } from './engine/Camera';
import { getFloorCount } from './config/FloorMap';
import { DungeonMapVisualizer } from './main/DungeonMapVisualizer';
import { SaveSlotUIRenderer } from './main/SaveSlotUIRenderer';
import { KeyboardInputHandler } from './main/KeyboardInputHandler';

// 💡 ADDITION: Initialize MapRenderer with floor switching support
const mapRenderer = new MapRenderer();

// Expose floor switching function globally for UI/debugging
(window as any).switchFloor = (floorId: number) => {
  return mapRenderer.switchFloor(floorId);
};

(window as any).getCurrentFloor = () => {
  return mapRenderer.getCurrentFloorId();
};

(window as any).getAvailableFloors = () => {
  return mapRenderer.getAvailableFloors();
};

// Game State
let gameRunning = false;
let world: World | null = null;
let renderer: GLInstancedRenderer | null = null;
let camera: Camera | null = null;
let texture: WebGLTexture | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: WebGL2RenderingContext | null = null;
let movementSystem: MovementSystem | null = null;
let collisionSystem: CollisionSystem | null = null;
let currentSlotId: number | null = null;

// Specialized managers
let dungeonVisualizer: DungeonMapVisualizer | null = null;
let saveSlotUI: SaveSlotUIRenderer | null = null;
let keyboardInputHandler: KeyboardInputHandler | null = null;

// UI Elements
const startMenu = document.getElementById('start-menu') as HTMLElement;
const slotsContainer = document.getElementById('slots-container') as HTMLElement;
const slotsOverlay = document.getElementById('slots-overlay') as HTMLElement;
const btnStart = document.getElementById('btn-start') as HTMLButtonElement;
const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
const btnCredits = document.getElementById('btn-credits') as HTMLButtonElement;
const btnCloseSlots = document.getElementById('btn-close-slots') as HTMLButtonElement;
const link1 = document.getElementById('link-1') as HTMLAnchorElement;
const link2 = document.getElementById('link-2') as HTMLAnchorElement;
const link3 = document.getElementById('link-3') as HTMLAnchorElement;

async function initEngine() {
  // 1. Setup Canvas & WebGL2 Context
  canvas = document.getElementById('canvas') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas not found');

// Set canvas to window size for proper viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

  // Create a guaranteed non-null reference for TypeScript closures
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL 2 is not supported.');

  // Create a guaranteed non-null reference for TypeScript closures
  ctx = gl as WebGL2RenderingContext;

  ctx.viewport(0, 0, canvas.width, canvas.height);
  ctx.clearColor(0.1, 0.1, 0.12, 1.0);

  // 2. Initialize Core Systems & World
  world = new World(); 
  movementSystem = new MovementSystem();
  // CollisionSystem does not require constructor parameters
  collisionSystem = new CollisionSystem();
  renderer = new GLInstancedRenderer(ctx, MAX_ENTITIES);
  
  // Generate test map BEFORE spawning player
  generateTestMap();
  console.log('[Engine] Map generated, size:', MAP_DATA.length, 'tiles');
  
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
  camera = createPlayerCamera(
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

  // Start the game loop
  startGameLoop();
}

function startGame() {
  gameRunning = true;
  startMenu.classList.add('hidden');
  
  // Reset input state
  if (keyboardInputHandler) {
    keyboardInputHandler.resetInput();
  }
}

function stopGame() {
  gameRunning = false;
  startMenu.classList.remove('hidden');
  renderSlots(); // Re-render slots to update their state
}

function renderSlots() {
  if (!saveSlotUI) return;
  
  saveSlotUI.render(
    slotsContainer,
    slotsOverlay,
    world,
    currentSlotId,
    (slotId: number) => {
      currentSlotId = slotId;
      console.log(`[UI] Loaded save slot ${slotId}`);
      startGame();
    },
    (slotId: number) => {
      currentSlotId = slotId;
      initNewGame();
      startGame();
    },
    (slotId: number) => {
      SaveSlotManager.deleteSlot(slotId);
      renderSlots();
    }
  );
}

function initNewGame() {
  // Generate new random seed for the renderer (new map layout)
  if (renderer) {
    renderer['sessionSeed'] = Math.random() * 10000.0;
  }
  
  // Reset world and start new game
  if (world) {
    world = new World();
    generateTestMap();
    if (renderer) renderer.updateMapDataTexture();
    
    // Respawn player at center of new map
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
    world.set.count = 1;
    world.set.dense[0] = PLAYER_ID;
    
    if (camera) {
      camera.setTarget({ x: playerX, y: playerY });
      camera.snapToTarget();
    }
  }
}

let accumulator = 0;
let lastTime = performance.now();

function startGameLoop() {
  // Reset timing
  lastTime = performance.now();
  accumulator = 0;
  
  function loop(now: number) {
    if (!gameRunning || !world || !renderer || !camera || !ctx || !canvas) {
      requestAnimationFrame(loop);
      return;
    }
    
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    accumulator += Math.min(dt, 0.25); // Prevent spiral of death

    // Fixed timestep updates
    while (accumulator >= FIXED_DT) {
      const inputState = keyboardInputHandler?.getInputState() || {};
      movementSystem!.update(world, inputState, FIXED_DT);
      collisionSystem!.update(world as any, FIXED_DT, PLAYER_ID);

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
    if (cameraMoved || lastTime === now) { // First frame condition
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
        texture!,
        camX,
        camY
      );
    } else {
      // Re-render floor without recalculating data
      renderer.renderFloor(
        null,
        canvas.width,
        canvas.height,
        texture!,
        camX,
        camY
      );
    }

    // 3. Draw Player Entity (red square) on Top
    renderer.renderPlayer(world, canvas.width, canvas.height, texture!, camX, camY);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

// Map Canvas Setup - managed by DungeonMapVisualizer
const mapContainer = document.getElementById('map-container') as HTMLElement;
const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;

function initMapCanvas() {
  if (!mapCanvas || !mapContainer) return;
  
  // Get actual container dimensions (works even if just made visible)
  const rect = mapContainer.getBoundingClientRect();
  const width = rect.width || 400;
  const height = rect.height || window.innerHeight;
  
  // Set canvas size to match container display size
  mapCanvas.width = Math.floor(width);
  mapCanvas.height = Math.floor(height);
  
  // Initialize dungeon visualizer if needed
  if (!dungeonVisualizer) {
    dungeonVisualizer = new DungeonMapVisualizer();
  }
  dungeonVisualizer.initialize(mapCanvas);
  console.log('[Main] Map canvas initialized. Press G to generate/load dungeon.');
}

function toggleMap() {
  if (!mapContainer) return;
  
  const mapVisible = mapContainer.classList.contains('visible');
  
  if (!mapVisible) {
    mapContainer.classList.add('visible');
    initMapCanvas();
    if (dungeonVisualizer) {
      dungeonVisualizer.loadDungeonFromFile();
    }
  } else {
    mapContainer.classList.remove('visible');
  }
}
// Keyboard event handlers - delegated to KeyboardInputHandler
window.addEventListener('keydown', (e) => {
  // Initialize keyboard handler on first key press if not already done
  if (!keyboardInputHandler && world) {
    keyboardInputHandler = new KeyboardInputHandler(
      mapRenderer,
      world,
      camera,
      renderer,
      dungeonVisualizer,
      (slotId: number) => {
        SaveSlotManager.saveToSlot(world!, slotId, `Save ${slotId + 1}`);
        console.log(`[UI] Saved to slot ${slotId}!`);
      },
      currentSlotId
    );
    keyboardInputHandler.registerListeners();
    return; // Let the registered handler process this key
  }
  
  // Toggle map with M key - works only in game, not in menu
  if (e.key === 'm' || e.key === 'M') {
    if (!gameRunning) return;
    toggleMap();
    return;
  }

  // Export dungeon files with X key
  if ((e.key === 'x' || e.key === 'X') && dungeonVisualizer) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer?.classList.contains('visible')) {
      dungeonVisualizer.exportCurrentDungeon();
    }
    return;
  }

  // Delete current dungeon with D key
  if ((e.key === 'd' || e.key === 'D') && dungeonVisualizer) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer?.classList.contains('visible')) {
      dungeonVisualizer.deleteCurrentDungeon();
    }
    return;
  }

  if (!gameRunning) return;

  // Floor switching with T (previous) and G (next)
  if ((e.key === 't' || e.key === 'T') && world && camera) {
    const floorSwitchManager = new (require('./main/FloorSwitchManager').FloorSwitchManager)();
    floorSwitchManager.switchToPreviousFloor(mapRenderer, world, camera, renderer);
    return;
  }

  if ((e.key === 'g' || e.key === 'G') && world && camera) {
    const floorSwitchManager = new (require('./main/FloorSwitchManager').FloorSwitchManager)();
    floorSwitchManager.switchToNextFloor(mapRenderer, world, camera, renderer);
    return;
  }

  // Portal interaction with E key
  if ((e.key === 'e' || e.key === 'E') && world && camera) {
    const floorSwitchManager = new (require('./main/FloorSwitchManager').FloorSwitchManager)();
    floorSwitchManager.handlePortalInteraction(mapRenderer, world, camera, renderer);
  }

  // Quick save with Ctrl+S
  if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (world && currentSlotId !== null) {
      SaveSlotManager.saveToSlot(world, currentSlotId, `Save ${currentSlotId + 1}`);
      console.log(`[UI] Saved to slot ${currentSlotId}!`);
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (!gameRunning) return;
  // Input state is managed by KeyboardInputHandler
});

// Handle window resize
window.addEventListener('resize', () => {
  if (!canvas || !ctx || !camera) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.viewport(0, 0, canvas.width, canvas.height);
  camera.setViewport(canvas.width, canvas.height);
});

// Menu Button Handlers
btnStart.addEventListener('click', () => {
  // Hide the start button and other menu buttons
  btnStart.classList.add('hidden');
  if (btnSettings.parentElement) {
    btnSettings.parentElement.classList.add('hidden');
  }
  // Show slots with animation and show overlay
  slotsOverlay.classList.add('active');
  slotsContainer.classList.add('visible');
  renderSlots();
});

// Close slots overlay handler
btnCloseSlots.addEventListener('click', () => {
  // Hide slots overlay
  slotsOverlay.classList.remove('active');
  // Hide slots container
  slotsContainer.classList.remove('visible');
  // Show start button and menu buttons again
  btnStart.classList.remove('hidden');
  if (btnSettings.parentElement) {
    btnSettings.parentElement.classList.remove('hidden');
  }
});

// Settings and Credits button handlers (placeholder for now)
btnSettings.addEventListener('click', () => {
  console.log('[UI] Settings button clicked');
  // Add settings modal/functionality here
});

btnCredits.addEventListener('click', () => {
  console.log('[UI] Credits button clicked');
  // Add credits modal/functionality here
});

// Link box handlers (placeholder - replace # with actual URLs)
link1.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 1 clicked');
  // Replace with: window.open('YOUR_URL_1', '_blank');
});

link2.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 2 clicked');
  // Replace with: window.open('YOUR_URL_2', '_blank');
});

link3.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('[UI] Link 3 clicked');
  // Replace with: window.open('YOUR_URL_3', '_blank');
});

// Initial render of slots on page load (hidden by default)
slotsContainer.classList.remove('visible');

initEngine().catch(console.error);
