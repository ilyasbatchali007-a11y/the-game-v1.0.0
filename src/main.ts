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

// UI Elements
const startMenu = document.getElementById('start-menu') as HTMLElement;
const saveModal = document.getElementById('save-modal') as HTMLElement;
const modalTitle = document.getElementById('modal-title') as HTMLElement;
const loadControls = document.getElementById('load-controls') as HTMLElement;
const saveControls = document.getElementById('save-controls') as HTMLElement;
const loadSaveList = document.getElementById('load-save-list') as HTMLElement;
const saveSaveList = document.getElementById('save-save-list') as HTMLElement;
const emptyMessage = document.getElementById('empty-message') as HTMLElement;
const btnNewGame = document.getElementById('btn-new-game') as HTMLButtonElement;
const btnLoadGame = document.getElementById('btn-load-game') as HTMLButtonElement;
const btnSaveGame = document.getElementById('btn-save-game') as HTMLButtonElement;
const btnCloseModal = document.getElementById('btn-close-modal') as HTMLButtonElement;

let currentMode: 'load' | 'save' = 'load';

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
  saveModal.classList.remove('active');
  
  // Reset input state
  inputState = {};
}

function stopGame() {
  gameRunning = false;
  startMenu.classList.remove('hidden');
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
  
  // Quick save/load shortcuts (S and L with Ctrl)
  if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
    e.preventDefault();
    // Quick save to slot 0
    if (world) {
      SaveSlotManager.saveToSlot(world, 0, 'Quick Save');
      console.log('[UI] Quick saved!');
    }
  } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    // Quick load from slot 0
    const buffer = SaveSlotManager.loadFromSlot(0);
    if (buffer && world) {
      SaveManager.loadWorld(world, buffer);
      console.log('[UI] Quick loaded!');
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
btnNewGame.addEventListener('click', () => {
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
});

btnLoadGame.addEventListener('click', () => {
  currentMode = 'load';
  modalTitle.textContent = 'Load Game';
  loadControls.style.display = 'block';
  saveControls.style.display = 'none';
  saveModal.classList.add('active');
  saveModal.classList.add('mode-load');
  saveModal.classList.remove('mode-save');
  renderSaveList('load');
});

btnSaveGame.addEventListener('click', () => {
  if (!gameRunning || !world) {
    alert('Start a game first!');
    return;
  }
  currentMode = 'save';
  modalTitle.textContent = 'Save Game';
  loadControls.style.display = 'none';
  saveControls.style.display = 'block';
  saveModal.classList.add('active');
  saveModal.classList.add('mode-save');
  saveModal.classList.remove('mode-load');
  renderSaveList('save');
});

btnCloseModal.addEventListener('click', () => {
  saveModal.classList.remove('active');
});

// Close modal when clicking outside
saveModal.addEventListener('click', (e) => {
  if (e.target === saveModal) {
    saveModal.classList.remove('active');
  }
});

function renderSaveList(mode: 'load' | 'save') {
  const slots = SaveSlotManager.getSaveSlots();
  const container = mode === 'load' ? loadSaveList : saveSaveList;
  container.innerHTML = '';
  
  if (slots.length === 0) {
    emptyMessage.style.display = 'block';
  } else {
    emptyMessage.style.display = 'none';
    
    slots.forEach(slot => {
      const item = document.createElement('div');
      item.className = 'save-item';
      
      const info = document.createElement('div');
      info.className = 'save-item-info';
      
      const name = document.createElement('div');
      name.className = 'save-item-name';
      name.textContent = slot.name;
      
      const date = document.createElement('div');
      date.className = 'save-item-date';
      date.textContent = SaveSlotManager.formatDate(slot.timestamp);
      
      info.appendChild(name);
      info.appendChild(date);
      
      const actions = document.createElement('div');
      actions.className = 'save-item-actions';
      
      if (mode === 'load') {
        const loadBtn = document.createElement('button');
        loadBtn.className = 'action-btn';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const buffer = SaveSlotManager.loadFromSlot(slot.id);
          if (buffer && world) {
            SaveManager.loadWorld(world, buffer);
            console.log(`[UI] Loaded save slot ${slot.id}`);
            saveModal.classList.remove('active');
            if (!gameRunning) {
              startGame();
            }
          }
        });
        actions.appendChild(loadBtn);
      } else {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'action-btn';
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (world) {
            SaveSlotManager.saveToSlot(world, slot.id, slot.name);
            console.log(`[UI] Saved to slot ${slot.id}`);
            renderSaveList('save');
          }
        });
        actions.appendChild(saveBtn);
      }
      
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        SaveSlotManager.deleteSlot(slot.id);
        console.log(`[UI] Deleted slot ${slot.id}`);
        renderSaveList(mode);
      });
      actions.appendChild(deleteBtn);
      
      item.appendChild(info);
      item.appendChild(actions);
      
      if (mode === 'load') {
        item.addEventListener('click', () => {
          const buffer = SaveSlotManager.loadFromSlot(slot.id);
          if (buffer && world) {
            SaveManager.loadWorld(world, buffer);
            console.log(`[UI] Loaded save slot ${slot.id}`);
            saveModal.classList.remove('active');
            if (!gameRunning) {
              startGame();
            }
          }
        });
      }
      
      container.appendChild(item);
    });
  }
}

initEngine().catch(console.error);
