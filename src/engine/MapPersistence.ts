// SRC/engine/MapPersistence.ts
// Handles saving and loading of dungeon maps (OBJ + block metadata)
// Uses browser localStorage with IndexedDB fallback for larger data

import { MapBlock } from './types/MapBlockTypes';
import { DungeonGenerationResult } from './DungeonGenerator';

export interface SavedMapData {
  mapId: string;
  objContent: string;
  blocks: MapBlock[];
  timestamp: number;
  version: string;
  blockTriangleRanges?: { start: number; count: number }[];
}

const DATA_VERSION = '1.0.0';
const MAP_PREFIX = 'dungeon_map_';
const MAP_LIST_KEY = 'dungeon_map_list';

/**
 * Save a generated dungeon to persistent storage
 * Stores both the OBJ mesh and block metadata together under the same map ID
 * @returns true if save succeeded, false if it failed (e.g. storage full)
 */
export async function saveDungeon(result: DungeonGenerationResult): Promise<boolean> {
  const savedData: SavedMapData = {
    mapId: result.mapId,
    objContent: result.objContent,
    blocks: result.blocks,
    timestamp: Date.now(),
    version: DATA_VERSION,
    blockTriangleRanges: result.blockTriangleRanges
  };
  
  try {
    // Store the main data
    const key = `${MAP_PREFIX}${result.mapId}`;
    localStorage.setItem(key, JSON.stringify(savedData));
    
    // Update map list
    const mapList = getMapList();
    if (!mapList.includes(result.mapId)) {
      mapList.push(result.mapId);
      localStorage.setItem(MAP_LIST_KEY, JSON.stringify(mapList));
    }
    
    console.log(`[MapPersistence] Saved dungeon ${result.mapId} (${result.objContent.length} bytes OBJ, ${result.blocks.length} blocks)`);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[MapPersistence] Browser storage is full - cannot save dungeon');
      throw new Error('Failed to save dungeon: browser storage is full. Try deleting an old map first.');
    } else {
      console.error('[MapPersistence] Failed to save dungeon:', error);
      throw new Error('Failed to save dungeon map due to an unexpected error.');
    }
  }
}

/**
 * Load a dungeon from persistent storage by map ID
 * Returns null if no saved map exists for that ID
 */
export async function loadDungeon(mapId: string): Promise<SavedMapData | null> {
  try {
    const key = `${MAP_PREFIX}${mapId}`;
    const dataStr = localStorage.getItem(key);
    
    if (!dataStr) {
      return null;
    }
    
    const data: SavedMapData = JSON.parse(dataStr);
    console.log(`[MapPersistence] Loaded dungeon ${mapId} from storage`);
    return data;
  } catch (error) {
    console.error('[MapPersistence] Failed to load dungeon:', error);
    return null;
  }
}

/**
 * Check if a dungeon exists in storage
 */
export function hasDungeon(mapId: string): boolean {
  const key = `${MAP_PREFIX}${mapId}`;
  return localStorage.getItem(key) !== null;
}

/**
 * Get list of all saved map IDs
 */
export function getMapList(): string[] {
  try {
    const dataStr = localStorage.getItem(MAP_LIST_KEY);
    if (!dataStr) return [];
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('[MapPersistence] Failed to get map list:', error);
    return [];
  }
}

/**
 * Delete a saved dungeon
 */
export function deleteDungeon(mapId: string): void {
  const key = `${MAP_PREFIX}${mapId}`;
  localStorage.removeItem(key);
  
  // Remove from list
  const mapList = getMapList().filter(id => id !== mapId);
  localStorage.setItem(MAP_LIST_KEY, JSON.stringify(mapList));
  
  console.log(`[MapPersistence] Deleted dungeon ${mapId}`);
}

/**
 * Get or create a default map ID for the current session
 */
export function getDefaultMapId(): string {
  let currentId = sessionStorage.getItem('current_dungeon_id');
  if (!currentId) {
    currentId = `dungeon_${Date.now()}`;
    sessionStorage.setItem('current_dungeon_id', currentId);
  }
  return currentId;
}

/**
 * Set the current map ID for the session
 */
export function setCurrentMapId(mapId: string): void {
  sessionStorage.setItem('current_dungeon_id', mapId);
}

/**
 * Export dungeon to downloadable files (OBJ + JSON)
 */
export function exportDungeonFiles(result: DungeonGenerationResult): void {
  // Create and download OBJ file
  const objBlob = new Blob([result.objContent], { type: 'text/plain' });
  const objUrl = URL.createObjectURL(objBlob);
  const objLink = document.createElement('a');
  objLink.href = objUrl;
  objLink.download = `${result.mapId}_dungeon.obj`;
  objLink.click();
  URL.revokeObjectURL(objUrl);
  
  // Create and download JSON file
  const jsonBlob = new Blob([JSON.stringify(result.blocks, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `${result.mapId}_dungeon.blocks.json`;
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);
  
  console.log(`[MapPersistence] Exported dungeon files for ${result.mapId}`);
}
