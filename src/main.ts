// 1. Ensure CELL_SIZE is exported from './config/Constants'
import { MAP_DATA, getCurrentWorldWidth, getCurrentWorldHeight, TILE_SIZE, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA, mapData } from './config/MapData';
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
import { getFloorCount } from './config/FloorMap';
import { MapWindow3DRenderer } from './engine/MapWindow3DRenderer';
import { generateDungeon } from './engine/DungeonGenerator';
import { saveDungeon, loadDungeon, hasDungeon, getDefaultMapId, setCurrentMapId, exportDungeonFiles, deleteDungeon } from './engine/MapPersistence';
import { initializeGameEngine, type EngineContext } from './main/GameEngineInitializer';
import { UIManager } from './main/UIManager/UIManager';
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
let uiManager: UIManager | null = null;
let currentSlotId: number | null = null;

async function initEngine() {
  // Use the extracted GameEngineInitializer module
  const context = await initializeGameEngine();
  
  // Extract context values into module-level variables for backward compatibility
  canvas = context.canvas;
  ctx = context.ctx;
  world = context.world;
  movementSystem = context.movementSystem;
  collisionSystem = context.collisionSystem;
  renderer = context.renderer;
  camera = context.camera;
  texture = context.texture;
  
  // Initialize UI Manager with callbacks
  uiManager = new UIManager({
    world,
    initNewGameCallback: initNewGame,
    startGameCallback: startGame
  });
  
  // Start the game loop
  startGameLoop();
}

function startGame() {
  gameRunning = true;
  if (uiManager) {
    // UIManager handles hiding start menu internally
  }
  
  // Reset input state
  inputState = {};
}

function stopGame() {
  gameRunning = false;
  if (uiManager) {
    uiManager.stopGame();
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
    const result = generateDungeon();
    mapData.blocks = result.blocks;
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

// Add keyboard controls for floor switching (T and G keys) and map toggle (M key), dungeon generation (G key when map visible)
let floorSwitchCooldown = false;

// Map Canvas Setup
const mapContainer = document.getElementById('map-container') as HTMLElement;
const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
let mapCtx: CanvasRenderingContext2D | null = null;
let mapVisible = false;
let map3DRenderer: MapWindow3DRenderer | null = null;
let currentMapId: string | null = null;
let dungeonGenerated = false;

/**
 * Generate new dungeon map with 100 cubes, save both mesh and block data
 */
async function generateNewDungeon(): Promise<void> {
  if (!map3DRenderer) return;
  
  // Generate unique map ID for this session
  currentMapId = getDefaultMapId();
  setCurrentMapId(currentMapId);
  
  console.log(`[Main] Generating new dungeon with ID: ${currentMapId}`);
  
  // Generate dungeon (blocks + fused mesh)
  const result = generateDungeon(currentMapId);
  
  // Save to persistent storage
  try {
    await saveDungeon(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(errorMsg);
    console.error('[Main] Dungeon generation aborted due to save failure:', error);
    return; // Do not proceed to load the model if save failed
  }
  
  // Load into 3D renderer
  try {
    // Parse OBJ content directly (no file load needed)
    const { OBJLoader } = await import('./engine/OBJLoader');
    const model = OBJLoader.parseOBJ(result.objContent);
    map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    map3DRenderer.setMapBlocks(result.blocks);
    
    // Start the glowing block animation through all positions
    map3DRenderer.toggleGridAnimation(true);
    
    dungeonGenerated = true;
    console.log(`[Main] Dungeon generated and loaded: ${result.blocks.length} blocks, ${result.objContent.length} bytes OBJ`);
  } catch (err) {
    console.error('[Main] Failed to load generated dungeon:', err);
  }
}

/**
 * Load existing saved dungeon by map ID
 */
async function loadSavedDungeon(mapId: string): Promise<boolean> {
  if (!map3DRenderer) return false;
  
  const savedData = await loadDungeon(mapId);
  if (!savedData) {
    console.log(`[Main] No saved dungeon found for ID: ${mapId}`);
    return false;
  }
  
  currentMapId = mapId;
  setCurrentMapId(mapId);
  
  try {
    // Parse OBJ content directly
    const { OBJLoader } = await import('./engine/OBJLoader');
    const model = OBJLoader.parseOBJ(savedData.objContent);
    map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    map3DRenderer.setMapBlocks(savedData.blocks);
    
    // Start the glowing block animation through all positions
    map3DRenderer.toggleGridAnimation(true);
    
    dungeonGenerated = true;
    console.log(`[Main] Loaded saved dungeon ${mapId}: ${savedData.blocks.length} blocks`);
    return true;
  } catch (err) {
    console.error('[Main] Failed to load saved dungeon:', err);
    return false;
  }
}

/**
 * Initialize or load dungeon map - checks for saved map first, generates if not found
 */
async function initOrLoadDungeon(): Promise<void> {
  if (!map3DRenderer) return;
  
  // Try to load existing saved map first
  const defaultMapId = getDefaultMapId();
  const loaded = await loadSavedDungeon(defaultMapId);
  
  if (!loaded) {
    // No saved map exists, generate new one
    await generateNewDungeon();
  }
}

/**
 * Load existing dungeon from the blocks.json file in src/3d-objects folder
 */
async function loadExistingDungeonFromFile(): Promise<void> {
  if (!map3DRenderer) return;
  
  try {
    // Load the blocks JSON file directly from the project folder
    const response = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.blocks.json');
    if (!response.ok) {
      console.log('[Main] No blocks.json file found in src/3d-objects folder');
      return;
    }
    
    const blocks = await response.json();
    
    // Also load the OBJ file
    const objResponse = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.obj');
    if (!objResponse.ok) {
      console.log('[Main] No .obj file found in src/3d-objects folder');
      return;
    }
    
    const objContent = await objResponse.text();
    
    // Parse OBJ content
    const { OBJLoader } = await import('./engine/OBJLoader');
    const model = OBJLoader.parseOBJ(objContent);
    map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    map3DRenderer.setMapBlocks(blocks);
    
    // Start the glowing block animation through all positions
    map3DRenderer.toggleGridAnimation(true);
    
    dungeonGenerated = true;
    currentMapId = 'dungeon_1787048292379';
    console.log(`[Main] Loaded dungeon from file: ${blocks.length} blocks`);
  } catch (err) {
    console.error('[Main] Failed to load dungeon from file:', err);
  }
}

function initMapCanvas() {
  if (!mapCanvas || !mapContainer) return;
  
  // Get actual container dimensions (works even if just made visible)
  const rect = mapContainer.getBoundingClientRect();
  const width = rect.width || 400;
  const height = rect.height || window.innerHeight;
  
  // Set canvas size to match container display size
  mapCanvas.width = Math.floor(width);
  mapCanvas.height = Math.floor(height);
  
  // Initialize 3D renderer for the map window
  if (!map3DRenderer) {
    map3DRenderer = new MapWindow3DRenderer(mapCanvas);
    // Don't auto-load/generate - wait for user to press G key
    console.log('[Main] Map canvas initialized. Press G to generate/load dungeon.');
  } else {
    map3DRenderer.resize();
  }
}

function toggleMap() {
  mapVisible = !mapVisible;
  if (mapVisible) {
    mapContainer.classList.add('visible');
    // Initialize canvas immediately with fixed dimensions
    initMapCanvas();
    // Load existing dungeon from file when map is opened
    loadExistingDungeonFromFile();
  } else {
    mapContainer.classList.remove('visible');
  }
}
window.addEventListener('keydown', (e) => {
  // Toggle map with M key - works only in game, not in menu
  if (e.key === 'm' || e.key === 'M') {
    if (!gameRunning) return; // Only allow map toggle during gameplay
    toggleMap();
    return; // Don't process other inputs when toggling map
  }

  // G key is now disabled for dungeon generation - only M key loads the existing model

  // Export dungeon files with X key - works only when map is visible
  if ((e.key === 'x' || e.key === 'X') && mapVisible && currentMapId) {
    if (!gameRunning) return;
    console.log('[Main] X key pressed - exporting dungeon files');
    loadDungeon(currentMapId).then(savedData => {
      if (savedData) {
        exportDungeonFiles({
          mapId: savedData.mapId,
          objContent: savedData.objContent,
          blocks: savedData.blocks
        });
      }
    });
    return;
  }

  // Delete current dungeon with D key - works only when map is visible
  if ((e.key === 'd' || e.key === 'D') && mapVisible && currentMapId) {
    if (!gameRunning) return;
    console.log('[Main] D key pressed - deleting current dungeon');
    deleteDungeon(currentMapId);
    dungeonGenerated = false;
    currentMapId = null;
    // Clear the 3D view
    if (map3DRenderer) {
      // Optionally reload empty or show message
      console.log('[Main] Dungeon deleted. Press G to generate a new one.');
    }
    return;
  }

  if (!gameRunning) return;

  // Floor switching with T (previous) and G (next) - also respawn player at center of new floor
  if ((e.key === 't' || e.key === 'T') && !floorSwitchCooldown) {
    floorSwitchCooldown = true;
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
    mapRenderer.switchFloor(newFloor);
    
    // Update renderer's map data texture after floor switch
    if (renderer) {
      renderer.updateMapDataTexture();
    }
    
    // Teleport player to center of new floor and update camera
    if (world) {
      world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
      world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
      world.vx[PLAYER_ID] = 0;
      world.vy[PLAYER_ID] = 0;
      if (camera) {
        camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
        camera.snapToTarget();
      }
    }
    
    setTimeout(() => { floorSwitchCooldown = false; }, 200);
  }
  
  if ((e.key === 'g' || e.key === 'G') && !floorSwitchCooldown) {
    floorSwitchCooldown = true;
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
    mapRenderer.switchFloor(newFloor);
    
    // Update renderer's map data texture after floor switch
    if (renderer) {
      renderer.updateMapDataTexture();
    }
    
    // Teleport player to center of new floor and update camera
    if (world) {
      world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
      world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
      world.vx[PLAYER_ID] = 0;
      world.vy[PLAYER_ID] = 0;
      if (camera) {
        camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
        camera.snapToTarget();
      }
    }
    
    setTimeout(() => { floorSwitchCooldown = false; }, 200);
  }
  
  // Portal interaction with E key
  if ((e.key === 'e' || e.key === 'E') && !floorSwitchCooldown && world) {
    // Get player's current tile position
    const playerCol = Math.floor(world.x[PLAYER_ID] / TILE_SIZE);
    const playerRow = Math.floor(world.y[PLAYER_ID] / TILE_SIZE);
    
    // Check surrounding tiles (including current tile) for portal
    let foundPortal = false;
    for (let dRow = -1; dRow <= 1 && !foundPortal; dRow++) {
      for (let dCol = -1; dCol <= 1 && !foundPortal; dCol++) {
        const checkCol = playerCol + dCol;
        const checkRow = playerRow + dRow;
        
        if (checkCol >= 0 && checkCol < getCurrentMapCols() && 
            checkRow >= 0 && checkRow < getCurrentMapRows()) {
          const idx = (checkRow * getCurrentMapCols() + checkCol) * 2;
          const tileId = MAP_TILE_DATA[idx];
          
          // Check if this is a portal tile
          if (tileId === 1000 || tileId === 1001) {
            floorSwitchCooldown = true;
            foundPortal = true;
            
            const currentFloor = mapRenderer.getCurrentFloorId();
            let newFloor: number;
            
            if (tileId === 1000) {
              // Next floor portal (blue)
              newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
            } else {
              // Previous floor portal (red)
              newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
            }
            
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
            if (camera) {
              camera.setTarget({ x: world.x[PLAYER_ID], y: world.y[PLAYER_ID] });
              camera.snapToTarget();
            }
            
            console.log(`[Portal] Stepped on ${tileId === 1000 ? 'NEXT' : 'PREVIOUS'} floor portal, switched to floor ${newFloor}`);
            
            setTimeout(() => { floorSwitchCooldown = false; }, 300);
          }
        }
      }
    }
  }
  
  inputState[e.key] = true;
  
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

initEngine().catch(console.error);
