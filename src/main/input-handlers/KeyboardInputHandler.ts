/**
 * Keyboard input handler for floor switching, portal interaction, and map toggle
 * Manages T/G keys for floor navigation, E key for portals, M for map visibility
 */

import { World } from '../../ecs/World';
import { Camera } from '../../engine/Camera';
import { GLInstancedRenderer } from '../../render/GLInstancedRenderer';
import { MapRenderer } from '../../render/MapRenderer';
import { MapWindow3DRenderer } from '../../engine/MapWindow3DRenderer';
import { getFloorCount } from '../../config/FloorMap';
import { getCurrentWorldWidth, getCurrentWorldHeight } from '../../config/MapData';
import { loadDungeon, exportDungeonFiles, deleteDungeon } from '../../engine/MapPersistence';
import { switchToFloor, handlePortalInteraction, setFloorSwitchCooldown, getFloorSwitchCooldown } from '../game-loop/GameLoopOrchestrator';

export interface DungeonMapState {
  mapVisible: boolean;
  dungeonGenerated: boolean;
  currentMapId: string | null;
  map3DRenderer: MapWindow3DRenderer | null;
}

let dungeonMapState: DungeonMapState = {
  mapVisible: false,
  dungeonGenerated: false,
  currentMapId: null,
  map3DRenderer: null
};

export function getDungeonMapState(): DungeonMapState {
  return dungeonMapState;
}

export function setDungeonMapState(state: Partial<DungeonMapState>): void {
  dungeonMapState = { ...dungeonMapState, ...state };
}

/**
 * Initialize the 3D map canvas and renderer
 */
export function initMapCanvas(
  mapCanvas: HTMLCanvasElement | null,
  mapContainer: HTMLElement | null
): MapWindow3DRenderer | null {
  if (!mapCanvas || !mapContainer) return null;
  
  // Get actual container dimensions (works even if just made visible)
  const rect = mapContainer.getBoundingClientRect();
  const width = rect.width || 400;
  const height = rect.height || window.innerHeight;
  
  // Set canvas size to match container display size
  mapCanvas.width = Math.floor(width);
  mapCanvas.height = Math.floor(height);
  
  // Initialize 3D renderer for the map window
  if (!dungeonMapState.map3DRenderer) {
    const renderer = new MapWindow3DRenderer(mapCanvas);
    dungeonMapState.map3DRenderer = renderer;
    console.log('[Main] Map canvas initialized. Press G to generate/load dungeon.');
    return renderer;
  } else {
    dungeonMapState.map3DRenderer.resize();
    return dungeonMapState.map3DRenderer;
  }
}

/**
 * Toggle map visibility and load dungeon on open
 */
export function toggleMap(
  mapContainer: HTMLElement | null,
  mapCanvas: HTMLCanvasElement | null
): void {
  dungeonMapState.mapVisible = !dungeonMapState.mapVisible;
  
  if (dungeonMapState.mapVisible) {
    mapContainer?.classList.add('visible');
    initMapCanvas(mapCanvas, mapContainer);
    // Load existing dungeon from file when map is opened
    import('../dungeon-map/DungeonMapLoader').then(({ loadExistingDungeonFromFile }) => {
      loadExistingDungeonFromFile(dungeonMapState.map3DRenderer);
    });
  } else {
    mapContainer?.classList.remove('visible');
  }
}

/**
 * Handle keyboard input for map-related actions
 */
export function handleKeyDownEvent(
  e: KeyboardEvent,
  world: World,
  camera: Camera,
  renderer: GLInstancedRenderer | null,
  mapRenderer: MapRenderer,
  gameRunning: boolean,
  inputState: Record<string, boolean>
): void {
  const { mapVisible, currentMapId, map3DRenderer } = dungeonMapState;

  // Toggle map with M key - works only in game, not in menu
  if (e.key === 'm' || e.key === 'M') {
    if (!gameRunning) return; // Only allow map toggle during gameplay
    toggleMap(document.getElementById('map-container'), document.getElementById('map-canvas') as HTMLCanvasElement);
    return; // Don't process other inputs when toggling map
  }

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
    dungeonMapState.dungeonGenerated = false;
    dungeonMapState.currentMapId = null;
    console.log('[Main] Dungeon deleted. Press G to generate a new one.');
    return;
  }

  if (!gameRunning) return;

  // Floor switching with T (previous) and G (next) - also respawn player at center of new floor
  if ((e.key === 't' || e.key === 'T') && !getFloorSwitchCooldown()) {
    setFloorSwitchCooldown(true);
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor > 0 ? currentFloor - 1 : getFloorCount() - 1;
    switchToFloor(newFloor, world, camera, renderer, mapRenderer);
    setTimeout(() => { setFloorSwitchCooldown(false); }, 200);
  }
  
  if ((e.key === 'g' || e.key === 'G') && !getFloorSwitchCooldown()) {
    setFloorSwitchCooldown(true);
    const currentFloor = mapRenderer.getCurrentFloorId();
    const newFloor = currentFloor < getFloorCount() - 1 ? currentFloor + 1 : 0;
    switchToFloor(newFloor, world, camera, renderer, mapRenderer);
    setTimeout(() => { setFloorSwitchCooldown(false); }, 200);
  }
  
  // Portal interaction with E key
  if ((e.key === 'e' || e.key === 'E') && !getFloorSwitchCooldown() && world) {
    handlePortalInteraction(world, camera, renderer, mapRenderer);
    setTimeout(() => { setFloorSwitchCooldown(false); }, 300);
  }
  
  // Update input state for movement
  inputState[e.key] = true;
}

/**
 * Handle keyup events to reset input state
 */
export function handleKeyUpEvent(
  e: KeyboardEvent,
  gameRunning: boolean,
  inputState: Record<string, boolean>
): void {
  if (!gameRunning) return;
  inputState[e.key] = false;
}
