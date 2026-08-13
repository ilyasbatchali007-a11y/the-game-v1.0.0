// 1. Ensure CELL_SIZE is exported from './config/Constants'
import { generateTestMap, getFloorDimensions, getCurrentFloor, setCurrentFloor } from './config/MapData';
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

const NUM_SLOTS = 3;
let currentSlotId: number | null = null; // The slot used for the current session

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
  const dims = getFloorDimensions(getCurrentFloor());
  console.log('[Engine] Map generated, size:', dims.cols, 'x', dims.rows, '=', dims.cols * dims.rows, 'tiles');
  
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
  renderSlots(); // Re-render slots to update their state
}

function renderSlots() {
  // Clear existing slots but keep the overlay
  const overlay = document.getElementById('slots-overlay');
  slotsContainer.innerHTML = '';
  if (overlay) {
    slotsContainer.appendChild(overlay);
  }
  
  for (let i = 0; i < NUM_SLOTS; i++) {
    const slotData = SaveSlotManager.loadFromSlot(i);
    const slotEl = document.createElement('div');
    slotEl.className = 'save-slot';
    
    if (slotData) {
      // Slot has a save
      const parsed = JSON.parse(localStorage.getItem(`ecs_save_${i}`) || '{}');
      const timestamp = parsed.timestamp || 0;
      
      slotEl.classList.remove('empty');
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'slot-info';
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'slot-name';
      nameDiv.textContent = parsed.name || `Save ${i + 1}`;
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'slot-date';
      dateDiv.textContent = SaveSlotManager.formatDate(timestamp);
      
      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(dateDiv);
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'X';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SaveSlotManager.deleteSlot(i);
        renderSlots();
      });
      
      slotEl.appendChild(infoDiv);
      slotEl.appendChild(deleteBtn);
      
      // Click on slot loads the game
      slotEl.addEventListener('click', () => {
        const buffer = SaveSlotManager.loadFromSlot(i);
        if (buffer && world) {
          SaveManager.loadWorld(world, buffer);
          currentSlotId = i;
          console.log(`[UI] Loaded save slot ${i}`);
          startGame();
        }
      });
    } else {
      // Slot is empty
      slotEl.classList.add('empty');
      
      const infoDiv = document.createElement('div');
      infoDiv.className = 'slot-info';
      
      const nameDiv = document.createElement('div');
      nameDiv.className = 'slot-name';
      nameDiv.textContent = `Empty Slot ${i + 1}`;
      
      const dateDiv = document.createElement('div');
      dateDiv.className = 'slot-date';
      dateDiv.textContent = 'Click to start New Game';
      
      infoDiv.appendChild(nameDiv);
      infoDiv.appendChild(dateDiv);
      
      slotEl.appendChild(infoDiv);
      
      // Click on empty slot starts new game
      slotEl.addEventListener('click', () => {
        currentSlotId = i;
        initNewGame();
        startGame();
      });
    }
    
    slotsContainer.appendChild(slotEl);
  }
  
  // Re-append the overlay after slots
  if (overlay) {
    slotsContainer.appendChild(overlay);
  }
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
}

let inputState: Record<string, boolean> = {};
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
  
  // Floor switching: T = go up, G = go down
  if (e.key === 't' || e.key === 'T') {
    const newFloor = getCurrentFloor() + 1;
    setCurrentFloor(newFloor);
    console.log(`[Floor] Changed to floor ${getCurrentFloor()}`);
    // Update the renderer's floor texture
    if (renderer) {
      renderer.updateFloorTexture();
    }
  } else if (e.key === 'g' || e.key === 'G') {
    const newFloor = getCurrentFloor() - 1;
    setCurrentFloor(newFloor);
    console.log(`[Floor] Changed to floor ${getCurrentFloor()}`);
    // Update the renderer's floor texture
    if (renderer) {
      renderer.updateFloorTexture();
    }
  }
  
  // Quick save ONLY with Ctrl+S - saves to the slot used to start this session
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
