// SRC/render/MapRenderer.ts
// Optimized single-quad floor renderer - renders entire floor as ONE rectangle
// Reduces draw calls from 1024+ to 1 for maximum performance
// Supports 100 independent floors with customized sizes that can be switched at runtime
// Uses green chessboard pattern texture for all floors except Floor 0 (atlas)
// Integrated with PortalManager for 6-directional teleport system

import { ARENA_FLOOR, FloorConfig, FLOORS, getFloorById, getFloorCount } from '../config/FloorMap';
import { generateTestMap, MAP_TILE_DATA, getCurrentMapCols, getCurrentMapRows } from '../config/MapData';
import { portalManager, PORTAL_TILE_IDS, PortalDirection } from '../config/PortalManager';
import adjacencyData from '../config/block_floors_adjacency.json';
import placementData from '../config/list3_portal_placement (2).json';

export interface IFloorRenderData {
  x: number;
  y: number;
  width: number;
  height: number;
  texturePath: string;
  repeatX: number;
  repeatZ: number;
  floorId: number;  // Current floor ID for reference
  useAtlas: boolean;  // Whether to use atlas texture or chessboard pattern
}

export class MapRenderer {
  private currentFloorId: number = 0;
  private floorConfig: FloorConfig;
  private portalManagerInitialized: boolean = false;

  constructor(floorConfig: FloorConfig = ARENA_FLOOR) {
    this.floorConfig = floorConfig;
  }

  /**
   * Initialize the PortalManager with adjacency and placement data
   * Called automatically on first floor switch if not already initialized
   */
  private async ensurePortalManagerInitialized(): Promise<void> {
    if (this.portalManagerInitialized) {
      return;
    }

    try {
      await portalManager.initialize(adjacencyData, placementData);
      this.portalManagerInitialized = true;
      console.log('[MapRenderer] PortalManager initialized');
    } catch (error) {
      console.error('[MapRenderer] Failed to initialize PortalManager:', error);
      throw error;
    }
  }

  /**
   * Place portal tiles on the current floor based on PortalManager data
   * Must be called after generateTestMap for each floor
   */
  private placePortalTiles(): void {
    if (!portalManager.isInitialized()) {
      console.warn('[MapRenderer] PortalManager not initialized, skipping portal placement');
      return;
    }

    const portals = portalManager.getPortalsForFloor(this.currentFloorId);
    const cols = getCurrentMapCols();
    const rows = getCurrentMapRows();

    for (const portal of portals) {
      // Check if portal coordinates are within map bounds
      if (portal.x >= 0 && portal.x < cols && portal.z >= 0 && portal.z < rows) {
        const idx = (portal.z * cols + portal.x) * 2;
        MAP_TILE_DATA[idx] = portal.tileId;
        MAP_TILE_DATA[idx + 1] = 1; // isStatic = true
      }
    }
  }

  /**
   * Switch to a different floor by ID (0-99)
   * @param floorId - The floor ID to switch to (0-99)
   * @returns true if successful, false if invalid floor ID
   */
  public async switchFloor(floorId: number): Promise<boolean> {
    if (floorId === undefined || floorId === null || floorId < 0 || floorId >= getFloorCount()) {
      console.warn(`Invalid floor ID: ${floorId}. Must be between 0 and ${getFloorCount() - 1}`);
      return false;
    }
    
    // Ensure PortalManager is initialized before first floor switch
    await this.ensurePortalManagerInitialized();
    
    this.currentFloorId = floorId;
    this.floorConfig = getFloorById(floorId);
    
    // Regenerate the map data with new dimensions and texture settings
    const cols = Math.floor(this.floorConfig.width / 64);
    const rows = Math.floor(this.floorConfig.depth / 64);
    generateTestMap({
      cols,
      rows,
      useAtlas: this.floorConfig.useAtlas
    });
    
    // Place portal tiles based on PortalManager data
    this.placePortalTiles();
    
    console.log(`[MapRenderer] Switched to Floor ${floorId} (${cols}x${rows} tiles, ${this.floorConfig.width}x${this.floorConfig.depth}px)`);
    return true;
  }

  /**
   * Get the current floor ID
   */
  public getCurrentFloorId(): number {
    return this.currentFloorId;
  }

  /**
   * Get all available floor configurations
   */
  public getAvailableFloors(): FloorConfig[] {
    return FLOORS;
  }

  /**
   * Get configuration for a specific floor
   */
  public getFloorConfig(floorId: number): FloorConfig | null {
    if (floorId < 0 || floorId >= getFloorCount()) {
      return null;
    }
    return getFloorById(floorId);
  }

  /**
   * Returns a single floor rectangle covering the entire visible area
   * This replaces the tile-by-tile rendering with one seamless quad
   */
  public getFloorData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): IFloorRenderData {
    // Return the entire world as one seamless floor rectangle
    // Camera offset is applied by the renderer/camera system
    return {
      x: 0,
      y: 0,
      width: this.floorConfig.width,
      height: this.floorConfig.depth,
      texturePath: this.floorConfig.texturePath,
      repeatX: this.floorConfig.repeatX,
      repeatZ: this.floorConfig.repeatZ,
      floorId: this.currentFloorId,
      useAtlas: this.floorConfig.useAtlas
    };
  }

  /**
   * Legacy method kept for compatibility - now returns empty data
   * since we render the floor as a single quad instead of tiles
   */
  public getVisibleTileData(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): { buffer: Float32Array; count: number } {
    // Return empty - floor is now rendered as a single quad
    return { buffer: new Float32Array(0), count: 0 };
  }
}