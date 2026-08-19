/**
 * Dungeon map loading and generation logic
 * Handles loading from files, generating new dungeons, and persisting to storage
 */

import { MapWindow3DRenderer } from '../../engine/MapWindow3DRenderer';
import { generateDungeon } from '../../engine/DungeonGenerator';
import { saveDungeon, loadDungeon, hasDungeon, getDefaultMapId, setCurrentMapId } from '../../engine/MapPersistence';
import { getDungeonMapState, setDungeonMapState } from '../input-handlers/KeyboardInputHandler';

/**
 * Generate new dungeon map with 100 cubes, save both mesh and block data
 */
export async function generateNewDungeon(): Promise<void> {
  const state = getDungeonMapState();
  if (!state.map3DRenderer) return;
  
  // Generate unique map ID for this session
  const currentMapId = getDefaultMapId();
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
    const { OBJLoader } = await import('../../engine/OBJLoader');
    const model = OBJLoader.parseOBJ(result.objContent);
    state.map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    state.map3DRenderer.setMapBlocks(result.blocks);
    
    // Start the glowing block animation through all positions
    state.map3DRenderer.toggleGridAnimation(true);
    
    setDungeonMapState({ dungeonGenerated: true, currentMapId });
    console.log(`[Main] Dungeon generated and loaded: ${result.blocks.length} blocks, ${result.objContent.length} bytes OBJ`);
  } catch (err) {
    console.error('[Main] Failed to load generated dungeon:', err);
  }
}

/**
 * Load existing saved dungeon by map ID
 */
export async function loadSavedDungeon(mapId: string): Promise<boolean> {
  const state = getDungeonMapState();
  if (!state.map3DRenderer) return false;
  
  const savedData = await loadDungeon(mapId);
  if (!savedData) {
    console.log(`[Main] No saved dungeon found for ID: ${mapId}`);
    return false;
  }
  
  setCurrentMapId(mapId);
  
  try {
    // Parse OBJ content directly
    const { OBJLoader } = await import('../../engine/OBJLoader');
    const model = OBJLoader.parseOBJ(savedData.objContent);
    state.map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    state.map3DRenderer.setMapBlocks(savedData.blocks);
    
    // Start the glowing block animation through all positions
    state.map3DRenderer.toggleGridAnimation(true);
    
    setDungeonMapState({ dungeonGenerated: true, currentMapId: mapId });
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
export async function initOrLoadDungeon(): Promise<void> {
  const state = getDungeonMapState();
  if (!state.map3DRenderer) return;
  
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
export async function loadExistingDungeonFromFile(
  map3DRenderer: MapWindow3DRenderer | null
): Promise<void> {
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
    const { OBJLoader } = await import('../../engine/OBJLoader');
    const model = OBJLoader.parseOBJ(objContent);
    map3DRenderer.loadModel(model);
    
    // Set block metadata for accurate grid coordinates
    map3DRenderer.setMapBlocks(blocks);
    
    // Start the glowing block animation through all positions
    map3DRenderer.toggleGridAnimation(true);
    
    setDungeonMapState({ 
      dungeonGenerated: true, 
      currentMapId: 'dungeon_1787048292379',
      map3DRenderer 
    });
    console.log(`[Main] Loaded dungeon from file: ${blocks.length} blocks`);
  } catch (err) {
    console.error('[Main] Failed to load dungeon from file:', err);
  }
}
