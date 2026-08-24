/**
 * PortalManager - Handles 6-directional floor teleport system
 * 
 * Loads adjacency data (block_floors_adjacency.json) and portal placement data (list3_portal_placement.json)
 * Normalizes string IDs to numbers, maps top/bottom to up/down
 * Provides lookup methods for portal tiles and target floors
 */

// Direction constants for portal tile IDs
export const PORTAL_TILE_IDS = {
  UP: 2000,      // was "top" in adjacency file
  DOWN: 2001,    // was "bottom" in adjacency file
  LEFT: 2002,
  RIGHT: 2003,
  FRONT: 2004,
  BACK: 2005,
} as const;

export type PortalDirection = 'up' | 'down' | 'left' | 'right' | 'front' | 'back';

export interface PortalPlacement {
  x: number;
  z: number;
  direction: PortalDirection;
  tileId: number;
  targetFloor: number | null;
  isSpan: boolean;        // true for wall portals (left/right/front/back), false for up/down
  spanStart?: number;     // For wall spans: start coordinate
  spanEnd?: number;       // For wall spans: end coordinate
  fixedCoord?: number;    // For wall spans: the fixed x or z coordinate
}

export interface FloorDimensions {
  floorId: number;
  width: number;   // in tiles
  depth: number;   // in tiles
}

export interface AdjacencyData {
  floorId: number;
  up: number | null;
  down: number | null;
  left: number | null;
  right: number | null;
  front: number | null;
  back: number | null;
}

class PortalManagerClass {
  private adjacencies: Map<number, AdjacencyData> = new Map();
  private placements: Map<number, PortalPlacement[]> = new Map();
  private dimensions: Map<number, FloorDimensions> = new Map();
  private loaded: boolean = false;

  /**
   * Load both JSON files and normalize data
   * Must be called before any other methods
   */
  async load(): Promise<void> {
    if (this.loaded) {
      console.log('[PortalManager] Already loaded, skipping');
      return;
    }

    try {
      // Load adjacency data (List 2)
      const adjacencyResponse = await fetch('src/config/block_floors_adjacency.json');
      if (!adjacencyResponse.ok) {
        throw new Error(`Failed to load adjacency data: ${adjacencyResponse.status}`);
      }
      const adjacencyRaw = await adjacencyResponse.json();
      
      // Load portal placement data (List 3)
      const placementResponse = await fetch('src/config/list3_portal_placement (3).json');
      if (!placementResponse.ok) {
        throw new Error(`Failed to load placement data: ${placementResponse.status}`);
      }
      const placementRaw = await placementResponse.json();

      this.normalizeAdjacencyData(adjacencyRaw);
      this.normalizePlacementData(placementRaw);
      
      this.loaded = true;
      console.log(`[PortalManager] Loaded ${this.adjacencies.size} floors with adjacency data`);
      console.log(`[PortalManager] Loaded ${this.placements.size} floors with placement data`);
    } catch (error) {
      console.error('[PortalManager] Failed to load portal data:', error);
      throw error;
    }
  }

  /**
   * Normalize adjacency data from List 2
   * - Convert string IDs like "block_29" to numeric floor IDs
   * - Map "top" -> "up", "bottom" -> "down"
   * - Handle null values safely
   */
  private normalizeAdjacencyData(rawData: any[]): void {
    for (const entry of rawData) {
      const floorId = this.extractFloorId(entry.id);
      if (floorId === null || floorId === undefined) {
        console.warn('[PortalManager] Skipping entry with invalid ID:', entry.id);
        continue;
      }

      const sides = entry.sides || {};
      
      // Map top->up, bottom->down, keep others as-is
      const adjacencies: AdjacencyData = {
        floorId,
        up: this.normalizeTargetFloor(sides.top),      // was "top"
        down: this.normalizeTargetFloor(sides.bottom), // was "bottom"
        left: this.normalizeTargetFloor(sides.left),
        right: this.normalizeTargetFloor(sides.right),
        front: this.normalizeTargetFloor(sides.front),
        back: this.normalizeTargetFloor(sides.back),
      };

      this.adjacencies.set(floorId, adjacencies);
    }
  }

  /**
   * Normalize portal placement data from List 3
   * - Generate individual tile coordinates for wall spans
   * - Handle null portals (direction has no portal on this floor)
   * - Store floor dimensions
   */
  private normalizePlacementData(rawData: any[]): void {
    for (const entry of rawData) {
      const floorId = entry.floor;
      if (typeof floorId !== 'number' || floorId < 0) {
        console.warn('[PortalManager] Skipping entry with invalid floor:', entry.floor);
        continue;
      }

      const width = entry.width || 32;
      const depth = entry.depth || 32;
      
      // Store dimensions
      this.dimensions.set(floorId, { floorId, width, depth });

      const portals = entry.portals || {};
      const placements: PortalPlacement[] = [];

      // Process each direction - all 6 keys should exist (may be null)
      const directions: Array<{key: string, dir: PortalDirection, tileId: number}> = [
        { key: 'up', dir: 'up', tileId: PORTAL_TILE_IDS.UP },
        { key: 'down', dir: 'down', tileId: PORTAL_TILE_IDS.DOWN },
        { key: 'left', dir: 'left', tileId: PORTAL_TILE_IDS.LEFT },
        { key: 'right', dir: 'right', tileId: PORTAL_TILE_IDS.RIGHT },
        { key: 'front', dir: 'front', tileId: PORTAL_TILE_IDS.FRONT },
        { key: 'back', dir: 'back', tileId: PORTAL_TILE_IDS.BACK },
      ];

      for (const { key, dir, tileId } of directions) {
        const portalData = portals[key];
        
        // Skip if null or undefined - no portal in this direction
        if (!portalData) {
          continue;
        }

        // Get target floor from adjacency data
        const adj = this.adjacencies.get(floorId);
        let targetFloor: number | null = null;
        if (adj) {
          targetFloor = adj[dir] ?? null;
        }

        if (dir === 'up' || dir === 'down') {
          // Single tile portal
          placements.push({
            x: portalData.x,
            z: portalData.z,
            direction: dir,
            tileId,
            targetFloor,
            isSpan: false,
          });
        } else if (dir === 'left' || dir === 'right') {
          // Wall span along Z axis at fixed X
          // Iterate from startZ to endZ inclusive
          const startX = portalData.x;
          const startZ = portalData.startZ ?? 0;
          const endZ = portalData.endZ ?? 0;
          
          for (let z = startZ; z <= endZ; z++) {
            placements.push({
              x: startX,
              z: z,
              direction: dir,
              tileId,
              targetFloor,
              isSpan: true,
              spanStart: startZ,
              spanEnd: endZ,
              fixedCoord: startX,
            });
          }
        } else if (dir === 'front' || dir === 'back') {
          // Wall span along X axis at fixed Z
          // Iterate from startX to endX inclusive
          const startZ = portalData.z;
          const startX = portalData.startX ?? 0;
          const endX = portalData.endX ?? 0;
          
          for (let x = startX; x <= endX; x++) {
            placements.push({
              x: x,
              z: startZ,
              direction: dir,
              tileId,
              targetFloor,
              isSpan: true,
              spanStart: startX,
              spanEnd: endX,
              fixedCoord: startZ,
            });
          }
        }
      }

      this.placements.set(floorId, placements);
    }
  }

  /**
   * Extract numeric floor ID from string like "block_29"
   */
  private extractFloorId(idString: string | number): number | null {
    if (typeof idString === 'number') {
      return idString;
    }
    if (typeof idString === 'string') {
      const match = idString.match(/block_(\d+)/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    return null;
  }

  /**
   * Normalize target floor reference to number
   */
  private normalizeTargetFloor(target: string | number | null | undefined): number | null {
    if (target === null || target === undefined) {
      return null;
    }
    return this.extractFloorId(target);
  }

  /**
   * Get adjacency data for a floor
   * Returns null if floor not found
   */
  getAdjacency(floorId: number): AdjacencyData | null {
    return this.adjacencies.get(floorId) || null;
  }

  /**
   * Get target floor for a specific direction
   * Use this instead of floorId ± 1
   */
  getTargetFloor(floorId: number, direction: PortalDirection): number | null {
    const adj = this.adjacencies.get(floorId);
    if (!adj) {
      return null;
    }
    // Falsy-zero bug prevention: check explicitly for null/undefined
    const target = adj[direction];
    return (target !== null && target !== undefined) ? target : null;
  }

  /**
   * Get all portal placements for a floor
   * Returns array of {x, z, direction, tileId, targetFloor} objects
   */
  getPlacements(floorId: number): PortalPlacement[] {
    return this.placements.get(floorId) || [];
  }

  /**
   * Get floor dimensions (width/depth in tiles)
   * Use this instead of fixed dimensions
   */
  getDimensions(floorId: number): FloorDimensions | null {
    return this.dimensions.get(floorId) || null;
  }

  /**
   * Check if a tile at given coordinates is a portal
   * Returns portal info if found, null otherwise
   */
  getPortalAt(floorId: number, tileCol: number, tileRow: number): PortalPlacement | null {
    const placements = this.placements.get(floorId);
    if (!placements) {
      return null;
    }
    
    for (const p of placements) {
      if (p.x === tileCol && p.z === tileRow) {
        return p;
      }
    }
    return null;
  }

  /**
   * Get tile ID at a position (for checking in 3×3 area)
   * Returns 0 if not a portal tile
   */
  getTileIdAt(floorId: number, tileCol: number, tileRow: number): number {
    const portal = this.getPortalAt(floorId, tileCol, tileRow);
    return portal ? portal.tileId : 0;
  }

  /**
   * Check if manager is loaded and ready
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get total number of floors with data
   */
  getFloorCount(): number {
    return this.adjacencies.size;
  }
}

// Singleton instance
export const PortalManager = new PortalManagerClass();
