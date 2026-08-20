// Main entry point - orchestrates game initialization using modular components
import { initializeGameEngine, exposeFloorSwitchingAPI, EngineContext } from './main/GameEngineInitializer';
import { startGameLoop as runGameLoop, setupInputHandlers, LoopState, LoopDependencies } from './main/GameLoop';
import { renderSlots as renderSlotUI, quickSave, SlotUIState, NUM_SLOTS } from './main/SaveSlotUI';
import { SaveSlotManager } from './serialization/SaveSlotManager';
import { World } from './ecs/World';
import { generateTestMap, getCurrentWorldWidth, getCurrentWorldHeight, TILE_SIZE, getCurrentMapCols, getCurrentMapRows, MAP_TILE_DATA } from './config/MapData';
import { PLAYER_ID } from './config/Constants';
import { getFloorCount } from './config/FloorMap';
import { MapRenderer } from './render/MapRenderer';
import { MapWindow3DRenderer } from './engine/MapWindow3DRenderer';
import { generateDungeon as generateDungeonBlocks, DungeonGenerationResult } from './engine/DungeonGenerator';
import { saveDungeon, loadDungeon, exportDungeonFiles, deleteDungeon, getDefaultMapId, setCurrentMapId } from './engine/MapPersistence';
import { OBJLoader } from './engine/OBJLoader';

// Global state
let engineContext: EngineContext | null = null;
const loopState: LoopState = {
  gameRunning: false,
  accumulator: 0,
  lastTime: 0,
  inputState: {}
};
const slotUIState: SlotUIState = {
  currentSlotId: null
};

// Dungeon map state
let map3DRenderer: MapWindow3DRenderer | null = null;
let currentMapId: string | null = null;
let dungeonGenerated = false;
let mapVisible = false;
let floorSwitchCooldown = false;

// UI Elements
let startMenu: HTMLElement;
let slotsContainer: HTMLElement;
let slotsOverlay: HTMLElement;
let btnStart: HTMLButtonElement;
let btnCloseSlots: HTMLButtonElement;
let mapCanvas: HTMLCanvasElement;
let mapContainer: HTMLElement;

/**
 * Initialize the game engine and context
 */
async function initEngine() {
  try {
    engineContext = await initializeGameEngine();
    
    // Expose floor switching API globally
    exposeFloorSwitchingAPI(engineContext.mapRenderer);
    
    // Setup input handlers
    setupInputHandlers(loopState);
    setupKeyboardHandlers();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Initialize UI elements
    initUIElements();
    
    console.log('[Main] Engine initialized successfully');
  } catch (error) {
    console.error('[Main] Failed to initialize engine:', error);
    throw error;
  }
}

function handleResize() {
  if (!engineContext?.canvas || !engineContext.ctx || !engineContext.camera) return;
  engineContext.canvas.width = window.innerWidth;
  engineContext.canvas.height = window.innerHeight;
  engineContext.ctx.viewport(0, 0, engineContext.canvas.width, engineContext.canvas.height);
  engineContext.camera.setViewport(engineContext.canvas.width, engineContext.canvas.height);
}

function initUIElements() {
  startMenu = document.getElementById('start-menu') as HTMLElement;
  slotsContainer = document.getElementById('slots-container') as HTMLElement;
  slotsOverlay = document.getElementById('slots-overlay') as HTMLElement;
  btnStart = document.getElementById('btn-start') as HTMLButtonElement;
  btnCloseSlots = document.getElementById('btn-close-slots') as HTMLButtonElement;
  mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
  mapContainer = document.getElementById('map-container') as HTMLElement;
  
  setupMenuButtons();
  slotsContainer.classList.remove('visible');
}

function setupMenuButtons() {
  btnStart.addEventListener('click', () => {
    btnStart.classList.add('hidden');
    const settingsPanel = btnStart.parentElement;
    if (settingsPanel) settingsPanel.classList.add('hidden');
    slotsOverlay.classList.add('active');
    slotsContainer.classList.add('visible');
    renderSlotUI(slotUIState, startGame);
  });

  btnCloseSlots.addEventListener('click', () => {
    slotsOverlay.classList.remove('active');
    slotsContainer.classList.remove('visible');
    btnStart.classList.remove('hidden');
    const settingsPanel = btnStart.parentElement;
    if (settingsPanel) settingsPanel.classList.remove('hidden');
  });
  
  const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;
  const btnCredits = document.getElementById('btn-credits') as HTMLButtonElement;
  
  btnSettings?.addEventListener('click', () => console.log('[UI] Settings clicked'));
  btnCredits?.addEventListener('click', () => console.log('[UI] Credits clicked'));
  
  ['link-1', 'link-2', 'link-3'].forEach((linkId, index) => {
    const link = document.getElementById(linkId) as HTMLAnchorElement;
    link?.addEventListener('click', (e) => {
      e.preventDefault();
      console.log(`[UI] Link ${index + 1} clicked`);
    });
  });
}

function startGame() {
  loopState.gameRunning = true;
  startMenu.classList.add('hidden');
  loopState.inputState = {};
  
  if (engineContext) {
    const loopDeps: LoopDependencies = {
      world: engineContext.world,
      renderer: engineContext.renderer,
      camera: engineContext.camera,
      ctx: engineContext.ctx,
      canvas: engineContext.canvas,
      movementSystem: engineContext.movementSystem,
      collisionSystem: engineContext.collisionSystem,
      texture: engineContext.texture,
      mapRenderer: engineContext.mapRenderer
    };
    runGameLoop(loopState, loopDeps);
  }
}

function stopGame() {
  loopState.gameRunning = false;
  startMenu.classList.remove('hidden');
  renderSlotUI(slotUIState, startGame);
}

function initNewGame() {
  if (engineContext?.renderer) {
    (engineContext.renderer as any).sessionSeed = Math.random() * 10000.0;
  }
  
  if (engineContext?.world) {
    engineContext.world = new World();
    generateTestMap();
    engineContext.renderer.updateMapDataTexture();
    
    const playerX = getCurrentWorldWidth() / 2;
    const playerY = getCurrentWorldHeight() / 2;
    engineContext.world.active[PLAYER_ID] = 1;
    engineContext.world.x[PLAYER_ID] = playerX;
    engineContext.world.y[PLAYER_ID] = playerY;
    engineContext.world.w[PLAYER_ID] = 32;
    engineContext.world.h[PLAYER_ID] = 32;
    engineContext.world.speed[PLAYER_ID] = 200;
    engineContext.world.vx[PLAYER_ID] = 0;
    engineContext.world.vy[PLAYER_ID] = 0;
    engineContext.world.rotation[PLAYER_ID] = 0;
    engineContext.world.set.count = 1;
    engineContext.world.set.dense[0] = PLAYER_ID;
    
    engineContext.camera.setTarget({ x: playerX, y: playerY });
    engineContext.camera.snapToTarget();
  }
}

// Dungeon management functions
async function generateNewDungeon(): Promise<void> {
  if (!map3DRenderer || !engineContext) return;
  
  currentMapId = getDefaultMapId();
  setCurrentMapId(currentMapId);
  
  console.log(`[Main] Generating new dungeon with ID: ${currentMapId}`);
  const result = generateDungeon(currentMapId);
  
  try {
    await saveDungeon(result);
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Unknown error');
    console.error('[Main] Dungeon generation aborted:', error);
    return;
  }
  
  try {
    const model = OBJLoader.parseOBJ(result.objContent);
    map3DRenderer.loadModel(model);
    map3DRenderer.setMapBlocks(result.blocks);
    map3DRenderer.toggleGridAnimation(true);
    dungeonGenerated = true;
    console.log(`[Main] Dungeon generated: ${result.blocks.length} blocks`);
  } catch (err) {
    console.error('[Main] Failed to load generated dungeon:', err);
  }
}

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
    const model = OBJLoader.parseOBJ(savedData.objContent);
    map3DRenderer.loadModel(model);
    map3DRenderer.setMapBlocks(savedData.blocks);
    map3DRenderer.toggleGridAnimation(true);
    dungeonGenerated = true;
    console.log(`[Main] Loaded saved dungeon ${mapId}: ${savedData.blocks.length} blocks`);
    return true;
  } catch (err) {
    console.error('[Main] Failed to load saved dungeon:', err);
    return false;
  }
}

async function loadExistingDungeonFromFile(): Promise<void> {
  if (!map3DRenderer) return;
  
  try {
    const response = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.blocks.json');
    if (!response.ok) {
      console.log('[Main] No blocks.json file found');
      return;
    }
    
    const blocks = await response.json();
    const objResponse = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.obj');
    if (!objResponse.ok) {
      console.log('[Main] No .obj file found');
      return;
    }
    
    const objContent = await objResponse.text();
    const model = OBJLoader.parseOBJ(objContent);
    map3DRenderer.loadModel(model);
    map3DRenderer.setMapBlocks(blocks);
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
  
  const rect = mapContainer.getBoundingClientRect();
  const width = rect.width || 400;
  const height = rect.height || window.innerHeight;
  
  mapCanvas.width = Math.floor(width);
  mapCanvas.height = Math.floor(height);
  
  if (!map3DRenderer) {
    map3DRenderer = new MapWindow3DRenderer(mapCanvas);
    console.log('[Main] Map canvas initialized. Press G to generate/load dungeon.');
  } else {
    map3DRenderer.resize();
  }
}

function toggleMap() {
  mapVisible = !mapVisible;
  if (mapVisible) {
    mapContainer.classList.add('visible');
    initMapCanvas();
    loadExistingDungeonFromFile();
  } else {
    mapContainer.classList.remove('visible');
  }
}

function setupKeyboardHandlers() {
  window.addEventListener('keydown', (e) => {
    // Toggle map with M key
    if (e.key === 'm' || e.key === 'M') {
      if (!loopState.gameRunning) return;
      toggleMap();
      return;
    }

    // Export dungeon with X key
    if ((e.key === 'x' || e.key === 'X') && mapVisible && currentMapId) {
      if (!loopState.gameRunning) return;
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

    // Delete dungeon with D key
    if ((e.key === 'd' || e.key === 'D') && mapVisible && currentMapId) {
      if (!loopState.gameRunning) return;
      deleteDungeon(currentMapId);
      dungeonGenerated = false;
      currentMapId = null;
      console.log('[Main] Dungeon deleted. Press G to generate a new one.');
      return;
    }

    if (!loopState.gameRunning) return;

    // Floor switching with T (previous) and G (next)
    handleFloorSwitch(e);
    
    // Portal interaction with E key
    if ((e.key === 'e' || e.key === 'E') && !floorSwitchCooldown && engineContext?.world) {
      handlePortalInteraction(e);
    }
    
    // Quick save with Ctrl+S
    if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      if (engineContext?.world && slotUIState.currentSlotId !== null) {
        SaveSlotManager.saveToSlot(engineContext.world, slotUIState.currentSlotId, `Save ${slotUIState.currentSlotId + 1}`);
        console.log(`[UI] Saved to slot ${slotUIState.currentSlotId}!`);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (!loopState.gameRunning) return;
    loopState.inputState[e.key] = false;
  });
}

function handleFloorSwitch(e: KeyboardEvent) {
  if (floorSwitchCooldown || !engineContext) return;

  if (e.key === 't' || e.key === 'T') {
    floorSwitchCooldown = true;
    const currentFloor = engineContext.mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
    engineContext.mapRenderer.switchFloor(newFloor);
    engineContext.renderer.updateMapDataTexture();
    
    engineContext.world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
    engineContext.world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
    engineContext.world.vx[PLAYER_ID] = 0;
    engineContext.world.vy[PLAYER_ID] = 0;
    engineContext.camera.setTarget({ x: engineContext.world.x[PLAYER_ID], y: engineContext.world.y[PLAYER_ID] });
    engineContext.camera.snapToTarget();
    
    setTimeout(() => { floorSwitchCooldown = false; }, 200);
  }
  
  if (e.key === 'g' || e.key === 'G') {
    floorSwitchCooldown = true;
    const currentFloor = engineContext.mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
    engineContext.mapRenderer.switchFloor(newFloor);
    engineContext.renderer.updateMapDataTexture();
    
    engineContext.world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
    engineContext.world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
    engineContext.world.vx[PLAYER_ID] = 0;
    engineContext.world.vy[PLAYER_ID] = 0;
    engineContext.camera.setTarget({ x: engineContext.world.x[PLAYER_ID], y: engineContext.world.y[PLAYER_ID] });
    engineContext.camera.snapToTarget();
    
    setTimeout(() => { floorSwitchCooldown = false; }, 200);
  }
}

function handlePortalInteraction(e: KeyboardEvent) {
  if (!engineContext?.world) return;
  
  const playerCol = Math.floor(engineContext.world.x[PLAYER_ID] / TILE_SIZE);
  const playerRow = Math.floor(engineContext.world.y[PLAYER_ID] / TILE_SIZE);
  
  let foundPortal = false;
  for (let dRow = -1; dRow <= 1 && !foundPortal; dRow++) {
    for (let dCol = -1; dCol <= 1 && !foundPortal; dCol++) {
      const checkCol = playerCol + dCol;
      const checkRow = playerRow + dRow;
      
      if (checkCol >= 0 && checkCol < getCurrentMapCols() && 
          checkRow >= 0 && checkRow < getCurrentMapRows()) {
        const idx = (checkRow * getCurrentMapCols() + checkCol) * 2;
        const tileId = MAP_TILE_DATA[idx];
        
        if (tileId === 1000 || tileId === 1001) {
          floorSwitchCooldown = true;
          foundPortal = true;
          
          const currentFloor = engineContext.mapRenderer.getCurrentFloorId();
          const newFloor = tileId === 1000 
            ? (currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0)
            : (currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1);
          
          engineContext.mapRenderer.switchFloor(newFloor);
          engineContext.renderer.updateMapDataTexture();
          
          engineContext.world.x[PLAYER_ID] = getCurrentWorldWidth() / 2;
          engineContext.world.y[PLAYER_ID] = getCurrentWorldHeight() / 2;
          engineContext.world.vx[PLAYER_ID] = 0;
          engineContext.world.vy[PLAYER_ID] = 0;
          engineContext.camera.setTarget({ x: engineContext.world.x[PLAYER_ID], y: engineContext.world.y[PLAYER_ID] });
          engineContext.camera.snapToTarget();
          
          console.log(`[Portal] Switched to floor ${newFloor}`);
          setTimeout(() => { floorSwitchCooldown = false; }, 300);
        }
      }
    }
  }
}

// Initialize engine on load
initEngine().catch(console.error);
