// 1. Ensure CELL_SIZE is exported from './config/Constants'
import { generateTestMap, MAP_DATA } from './config/MapData';
import { MapRenderer } from './render/MapRenderer';
import { MAX_ENTITIES, FIXED_DT, WORLD_WIDTH, WORLD_HEIGHT, CELL_SIZE, PLAYER_ID } from './config/Constants';
import { World } from './ecs/World';
// 2. Fixed export/import style for MovementSystem (switched to default or named depending on your file structure)
import { MovementSystem } from './systems/MovementSystem'; 
import { CollisionSystem } from './systems/CollisionSystem';
import { GLInstancedRenderer } from './render/GLInstancedRenderer';
import { AssetLoader } from './engine/AssetLoader';
import { SaveManager } from './serialization/SaveManager';
import { SaveSlotManager } from './serialization/SaveSlotManager';
import { Camera, createPlayerCamera } from './engine/Camera';
// 💡 ADDITION: Initialize MapRenderer
const mapRenderer = new MapRenderer();

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
let engineInitialized = false;

// UI Elements
const startMenu = document.getElementById('start-menu') as HTMLElement;
const saveSlotsContainer = document.getElementById('save-slots-container') as HTMLElement;

let currentSlotId: number | null = null;

async function initEngine() {
  // Initialize engine only once
  if (engineInitialized) return;
  engineInitialized = true;
  
  console.log('[Engine] Initializing engine...');
  
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
  
  console.log('[Engine] Core systems initialized');
  
  // Generate test map BEFORE spawning player
  generateTestMap();
  console.log('[Engine] Map generated, size:', MAP_DATA.length, 'tiles');
  
  // Spawn player entity at center of map (avoiding border walls)
  const playerX = WORLD_WIDTH / 2;
  const playerY = WORLD_HEIGHT / 2;
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

  // 3. Load Atlas Texture (atlas floor.jpg from /src/atlas pictures/)
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
  inputState = {};
}

function stopGame() {
  gameRunning = false;
  startMenu.classList.remove('hidden');
  renderSaveSlots();
}

let inputState: Record<string, boolean> = {};
let accumulator = 0;
let lastTime = performance.now();

function startGameLoop() {
  // Reset timing
  lastTime = performance.now();
  accumulator = 0;
  
  console.log('[Engine] Game loop started');
  
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

// Handle keyboard input for movement
window.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  inputState[e.key] = true;
  
  // Quick save shortcut (Ctrl+S)
  if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    if (world && currentSlotId !== null) {
      SaveSlotManager.saveToSlot(world, currentSlotId, `Save Slot ${currentSlotId + 1}`);
      console.log('[UI] Quick saved to slot', currentSlotId);
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (!gameRunning) return;
  inputState[e.key] = false;
});

// Handle window resize
window.addEventListener('resize', () => {
  if (!canvas || !ctx || !camera) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.viewport(0, 0, canvas.width, canvas.height);
  camera.setViewport(canvas.width, canvas.height);
});

// Render save slots on start menu
function renderSaveSlots() {
  saveSlotsContainer.innerHTML = '';
  
  for (let i = 0; i < 3; i++) {
    const slotData = SaveSlotManager.getSlotInfo(i);
    const slotElement = document.createElement('div');
    slotElement.className = `save-slot ${slotData.occupied ? 'occupied' : ''}`;
    
    const mark = document.createElement('div');
    mark.className = 'save-slot-mark';
    
    const info = document.createElement('div');
    info.className = 'save-slot-info';
    
    if (slotData.occupied) {
      const name = document.createElement('div');
      name.className = 'save-slot-name';
      name.textContent = slotData.name || `Save Slot ${i + 1}`;
      
      const date = document.createElement('div');
      date.className = 'save-slot-date';
      date.textContent = SaveSlotManager.formatDate(slotData.timestamp || 0);
      
      info.appendChild(name);
      info.appendChild(date);
    } else {
      const empty = document.createElement('div');
      empty.className = 'save-slot-empty';
      empty.textContent = 'Empty Slot - Click to start new game';
      info.appendChild(empty);
    }
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'save-slot-delete';
    deleteBtn.textContent = 'X';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      SaveSlotManager.deleteSlot(i);
      renderSaveSlots();
    });
    
    slotElement.appendChild(mark);
    slotElement.appendChild(info);
    slotElement.appendChild(deleteBtn);
    
    slotElement.addEventListener('click', (e) => {
      // Prevent triggering if clicking the delete button
      if ((e.target as HTMLElement).classList.contains('save-slot-delete')) {
        return;
      }
      
      if (slotData.occupied) {
        // Load existing save - engine should already be initialized
        const buffer = SaveSlotManager.loadFromSlot(i);
        if (buffer && world) {
          SaveManager.loadWorld(world, buffer);
          currentSlotId = i;
          console.log(`[UI] Loaded save slot ${i}`);
          startGame();
        } else {
          console.error('[UI] Failed to load save slot', i, 'buffer:', !!buffer, 'world:', !!world);
        }
      } else {
        // Start new game in this slot - engine should already be initialized
        startNewGameInSlot(i);
      }
    });
    
    saveSlotsContainer.appendChild(slotElement);
  }
}

function startNewGameInSlot(slotId: number) {
  currentSlotId = slotId;
  
  // Generate new random seed for the renderer (new map layout)
  if (renderer) {
    renderer['sessionSeed'] = Math.random() * 10000.0;
  }
  
  // Reset world and start new game
  if (world) {
    world = new World();
    generateTestMap();
    
    // Respawn player
    const playerX = WORLD_WIDTH / 2;
    const playerY = WORLD_HEIGHT / 2;
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
  startGame();
}

// Initialize the save slots display
renderSaveSlots();

// Pre-initialize engine (load textures, setup WebGL) but don't start game loop yet
initEngine().catch(console.error);
