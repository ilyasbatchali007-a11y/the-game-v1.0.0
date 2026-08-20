import { MapWindow3DRenderer } from '../engine/MapWindow3DRenderer';
import { generateDungeon } from '../engine/DungeonGenerator';
import { saveDungeon, loadDungeon, hasDungeon, getDefaultMapId, setCurrentMapId, exportDungeonFiles, deleteDungeon } from '../engine/MapPersistence';
import { OBJLoader } from '../engine/OBJLoader';

export interface DungeonMapState {
  map3DRenderer: MapWindow3DRenderer | null;
  currentMapId: string | null;
  dungeonGenerated: boolean;
  mapVisible: boolean;
}

/**
 * Generates a new dungeon map with cubes and saves mesh + block data
 */
export async function generateNewDungeon(state: DungeonMapState): Promise<void> {
  if (!state.map3DRenderer) return;

  state.currentMapId = getDefaultMapId();
  setCurrentMapId(state.currentMapId);

  console.log(`[Main] Generating new dungeon with ID: ${state.currentMapId}`);

  const result = generateDungeon(state.currentMapId);

  try {
    await saveDungeon(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
    alert(errorMsg);
    console.error('[Main] Dungeon generation aborted due to save failure:', error);
    return;
  }

  try {
    const model = OBJLoader.parseOBJ(result.objContent);
    state.map3DRenderer.loadModel(model);
    state.map3DRenderer.setMapBlocks(result.blocks);
    state.map3DRenderer.toggleGridAnimation(true);
    state.dungeonGenerated = true;
    console.log(`[Main] Dungeon generated and loaded: ${result.blocks.length} blocks, ${result.objContent.length} bytes OBJ`);
  } catch (err) {
    console.error('[Main] Failed to load generated dungeon:', err);
  }
}

/**
 * Loads existing saved dungeon by map ID
 */
export async function loadSavedDungeon(state: DungeonMapState, mapId: string): Promise<boolean> {
  if (!state.map3DRenderer) return false;

  const savedData = await loadDungeon(mapId);
  if (!savedData) {
    console.log(`[Main] No saved dungeon found for ID: ${mapId}`);
    return false;
  }

  state.currentMapId = mapId;
  setCurrentMapId(mapId);

  try {
    const model = OBJLoader.parseOBJ(savedData.objContent);
    state.map3DRenderer.loadModel(model);
    state.map3DRenderer.setMapBlocks(savedData.blocks);
    state.map3DRenderer.toggleGridAnimation(true);
    state.dungeonGenerated = true;
    console.log(`[Main] Loaded saved dungeon ${mapId}: ${savedData.blocks.length} blocks`);
    return true;
  } catch (err) {
    console.error('[Main] Failed to load saved dungeon:', err);
    return false;
  }
}

/**
 * Initialize or load dungeon - checks for saved map first, generates if not found
 */
export async function initOrLoadDungeon(state: DungeonMapState): Promise<void> {
  if (!state.map3DRenderer) return;

  const defaultMapId = getDefaultMapId();
  const loaded = await loadSavedDungeon(state, defaultMapId);

  if (!loaded) {
    await generateNewDungeon(state);
  }
}

/**
 * Load existing dungeon from the blocks.json file in src/3d-objects folder
 */
export async function loadExistingDungeonFromFile(state: DungeonMapState): Promise<void> {
  if (!state.map3DRenderer) return;

  try {
    const response = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.blocks.json');
    if (!response.ok) {
      console.log('[Main] No blocks.json file found in src/3d-objects folder');
      return;
    }

    const blocks = await response.json();

    const objResponse = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.obj');
    if (!objResponse.ok) {
      console.log('[Main] No .obj file found in src/3d-objects folder');
      return;
    }

    const objContent = await objResponse.text();

    const model = OBJLoader.parseOBJ(objContent);
    state.map3DRenderer.loadModel(model);
    state.map3DRenderer.setMapBlocks(blocks);
    state.map3DRenderer.toggleGridAnimation(true);
    state.dungeonGenerated = true;
    state.currentMapId = 'dungeon_1787048292379';
    console.log(`[Main] Loaded dungeon from file: ${blocks.length} blocks`);
  } catch (err) {
    console.error('[Main] Failed to load dungeon from file:', err);
  }
}

/**
 * Initializes the map canvas and 3D renderer
 */
export function initMapCanvas(state: DungeonMapState): void {
  const mapCanvas = document.getElementById('map-canvas') as HTMLCanvasElement;
  const mapContainer = document.getElementById('map-container') as HTMLElement;
  
  if (!mapCanvas || !mapContainer) return;

  const rect = mapContainer.getBoundingClientRect();
  const width = rect.width || 400;
  const height = rect.height || window.innerHeight;

  mapCanvas.width = Math.floor(width);
  mapCanvas.height = Math.floor(height);

  if (!state.map3DRenderer) {
    state.map3DRenderer = new MapWindow3DRenderer(mapCanvas);
    console.log('[Main] Map canvas initialized. Press G to generate/load dungeon.');
  } else {
    state.map3DRenderer.resize();
  }
}

/**
 * Toggles map visibility
 */
export function toggleMap(state: DungeonMapState): void {
  const mapContainer = document.getElementById('map-container') as HTMLElement;
  if (!mapContainer) return;

  state.mapVisible = !state.mapVisible;
  if (state.mapVisible) {
    mapContainer.classList.add('visible');
    initMapCanvas(state);
    loadExistingDungeonFromFile(state);
  } else {
    mapContainer.classList.remove('visible');
  }
}

/**
 * Handles keyboard input for map/floor controls
 */
export function setupMapInputHandlers(
  state: DungeonMapState,
  mapRenderer: any,
  world: any,
  camera: any,
  renderer: any,
  gameRunningCheck: () => boolean
): void {
  let floorSwitchCooldown = false;

  window.addEventListener('keydown', (e) => {
    // Toggle map with M key - works only in game, not in menu
    if (e.key === 'm' || e.key === 'M') {
      if (!gameRunningCheck()) return;
      toggleMap(state);
      return;
    }

    // Export dungeon files with X key
    if ((e.key === 'x' || e.key === 'X') && state.mapVisible && state.currentMapId) {
      if (!gameRunningCheck()) return;
      console.log('[Main] X key pressed - exporting dungeon files');
      loadDungeon(state.currentMapId).then(savedData => {
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

    // Delete current dungeon with D key
    if ((e.key === 'd' || e.key === 'D') && state.mapVisible && state.currentMapId) {
      if (!gameRunningCheck()) return;
      console.log('[Main] D key pressed - deleting current dungeon');
      deleteDungeon(state.currentMapId);
      state.dungeonGenerated = false;
      state.currentMapId = null;
      console.log('[Main] Dungeon deleted. Press G to generate a new one.');
      return;
    }

    if (!gameRunningCheck()) return;

    // Floor switching with T (previous) and G (next)
    handleFloorSwitch(e, floorSwitchCooldown, mapRenderer, world, camera, renderer);
    
    // Portal interaction with E key
    if ((e.key === 'e' || e.key === 'E') && !floorSwitchCooldown && world) {
      handlePortalInteraction(e, floorSwitchCooldown, mapRenderer, world, camera, renderer);
    }
  });
}

function handleFloorSwitch(
  e: KeyboardEvent,
  cooldown: boolean,
  mapRenderer: any,
  world: any,
  camera: any,
  renderer: any
): void {
  if (cooldown) return;

  // Floor switching logic is handled in main.ts due to import dependencies
}

function handlePortalInteraction(
  e: KeyboardEvent,
  cooldown: boolean,
  mapRenderer: any,
  world: any,
  camera: any,
  renderer: any
): void {
  // Implemented in main file due to complex imports
}
