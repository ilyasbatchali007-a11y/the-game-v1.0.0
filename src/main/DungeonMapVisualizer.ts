import { MapWindow3DRenderer } from '../engine/MapWindow3DRenderer';
import { generateDungeon } from '../engine/DungeonGenerator';
import { saveDungeon, loadDungeon, getDefaultMapId, setCurrentMapId, exportDungeonFiles, deleteDungeon } from '../engine/MapPersistence';

/**
 * Manages 3D dungeon map visualization in the map window.
 * Handles loading, generating, and displaying dungeon models.
 */
export class DungeonMapVisualizer {
  private map3DRenderer: MapWindow3DRenderer | null = null;
  private currentMapId: string | null = null;
  private dungeonGenerated: boolean = false;

  constructor() {}

  /**
   * Initialize the 3D renderer with a canvas
   */
  initialize(canvas: HTMLCanvasElement): void {
    if (!this.map3DRenderer) {
      this.map3DRenderer = new MapWindow3DRenderer(canvas);
      console.log('[DungeonMapVisualizer] 3D renderer initialized');
    } else {
      this.map3DRenderer.resize();
    }
  }

  /**
   * Get the 3D renderer instance
   */
  getRenderer(): MapWindow3DRenderer | null {
    return this.map3DRenderer;
  }

  /**
   * Generate a new dungeon with random layout
   */
  async generateNewDungeon(): Promise<void> {
    if (!this.map3DRenderer) return;

    // Generate unique map ID for this session
    this.currentMapId = getDefaultMapId();
    setCurrentMapId(this.currentMapId);

    console.log(`[DungeonMapVisualizer] Generating new dungeon with ID: ${this.currentMapId}`);

    // Generate dungeon (blocks + fused mesh)
    const result = generateDungeon(this.currentMapId);

    // Save to persistent storage
    try {
      await saveDungeon(result);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(errorMsg);
      console.error('[DungeonMapVisualizer] Dungeon generation aborted due to save failure:', error);
      return;
    }

    // Load into 3D renderer
    try {
      const { OBJLoader } = await import('../engine/OBJLoader');
      const model = OBJLoader.parseOBJ(result.objContent);
      this.map3DRenderer.loadModel(model);

      // Set block metadata for accurate grid coordinates
      this.map3DRenderer.setMapBlocks(result.blocks);

      // Start the glowing block animation through all positions
      this.map3DRenderer.toggleGridAnimation(true);

      this.dungeonGenerated = true;
      console.log(`[DungeonMapVisualizer] Dungeon generated and loaded: ${result.blocks.length} blocks, ${result.objContent.length} bytes OBJ`);
    } catch (err) {
      console.error('[DungeonMapVisualizer] Failed to load generated dungeon:', err);
    }
  }

  /**
   * Load existing saved dungeon by map ID
   */
  async loadSavedDungeon(mapId: string): Promise<boolean> {
    if (!this.map3DRenderer) return false;

    const savedData = await loadDungeon(mapId);
    if (!savedData) {
      console.log(`[DungeonMapVisualizer] No saved dungeon found for ID: ${mapId}`);
      return false;
    }

    this.currentMapId = mapId;
    setCurrentMapId(mapId);

    try {
      const { OBJLoader } = await import('../engine/OBJLoader');
      const model = OBJLoader.parseOBJ(savedData.objContent);
      this.map3DRenderer.loadModel(model);

      // Set block metadata for accurate grid coordinates
      this.map3DRenderer.setMapBlocks(savedData.blocks);

      // Start the glowing block animation through all positions
      this.map3DRenderer.toggleGridAnimation(true);

      this.dungeonGenerated = true;
      console.log(`[DungeonMapVisualizer] Loaded saved dungeon ${mapId}: ${savedData.blocks.length} blocks`);
      return true;
    } catch (err) {
      console.error('[DungeonMapVisualizer] Failed to load saved dungeon:', err);
      return false;
    }
  }

  /**
   * Initialize or load dungeon - checks for saved map first, generates if not found
   */
  async initOrLoadDungeon(): Promise<void> {
    if (!this.map3DRenderer) return;

    // Try to load existing saved map first
    const defaultMapId = getDefaultMapId();
    const loaded = await this.loadSavedDungeon(defaultMapId);

    if (!loaded) {
      // No saved map exists, generate new one
      await this.generateNewDungeon();
    }
  }

  /**
   * Load dungeon from static files in src/3d-objects folder
   */
  async loadDungeonFromFile(): Promise<void> {
    if (!this.map3DRenderer) return;

    try {
      // Load the blocks JSON file directly from the project folder
      const response = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.blocks.json');
      if (!response.ok) {
        console.log('[DungeonMapVisualizer] No blocks.json file found in src/3d-objects folder');
        return;
      }

      const blocks = await response.json();

      // Also load the OBJ file
      const objResponse = await fetch('src/3d-objects/dungeon_1787048292379_dungeon.obj');
      if (!objResponse.ok) {
        console.log('[DungeonMapVisualizer] No .obj file found in src/3d-objects folder');
        return;
      }

      const objContent = await objResponse.text();

      // Parse OBJ content
      const { OBJLoader } = await import('../engine/OBJLoader');
      const model = OBJLoader.parseOBJ(objContent);
      this.map3DRenderer.loadModel(model);

      // Set block metadata for accurate grid coordinates
      this.map3DRenderer.setMapBlocks(blocks);

      // Start the glowing block animation through all positions
      this.map3DRenderer.toggleGridAnimation(true);

      this.dungeonGenerated = true;
      this.currentMapId = 'dungeon_1787048292379';
      console.log(`[DungeonMapVisualizer] Loaded dungeon from file: ${blocks.length} blocks`);
    } catch (err) {
      console.error('[DungeonMapVisualizer] Failed to load dungeon from file:', err);
    }
  }

  /**
   * Export current dungeon to files
   */
  async exportCurrentDungeon(): Promise<void> {
    if (!this.currentMapId) return;

    const savedData = await loadDungeon(this.currentMapId);
    if (savedData) {
      exportDungeonFiles({
        mapId: savedData.mapId,
        objContent: savedData.objContent,
        blocks: savedData.blocks
      });
    }
  }

  /**
   * Delete current dungeon
   */
  deleteCurrentDungeon(): void {
    if (this.currentMapId) {
      deleteDungeon(this.currentMapId);
      this.dungeonGenerated = false;
      this.currentMapId = null;
      console.log('[DungeonMapVisualizer] Dungeon deleted');
    }
  }

  /**
   * Check if a dungeon is currently loaded/generated
   */
  hasDungeon(): boolean {
    return this.dungeonGenerated;
  }

  /**
   * Get current map ID
   */
  getCurrentMapId(): string | null {
    return this.currentMapId;
  }

  /**
   * Set whether dungeon is generated (for external control)
   */
  setDungeonGenerated(value: boolean): void {
    this.dungeonGenerated = value;
  }
}
