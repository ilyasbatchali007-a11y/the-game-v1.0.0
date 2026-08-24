/**
 * PortalManager - Handles 6-directional teleport system
 * 
 * Tile IDs:
 *   2000 = UP portal (to floor above)
 *   2001 = DOWN portal (to floor below)
 *   2002 = LEFT portal
 *   2003 = RIGHT portal
 *   2004 = FRONT portal
 *   2005 = BACK portal
 */

export enum PortalDirection {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
  FRONT = 4,
  BACK = 5
}

export const PORTAL_TILE_IDS: Record<PortalDirection, number> = {
  [PortalDirection.UP]: 2000,
  [PortalDirection.DOWN]: 2001,
  [PortalDirection.LEFT]: 2002,
  [PortalDirection.RIGHT]: 2003,
  [PortalDirection.FRONT]: 2004,
  [PortalDirection.BACK]: 2005
};

export const DIRECTION_KEYS = ['up', 'down', 'left', 'right', 'front', 'back'] as const;
type DirectionKey = typeof DIRECTION_KEYS[number];

export interface PortalPlacement {
  floorId: number;
  x: number;        // tile column
  z: number;        // tile row
  direction: PortalDirection;
  tileId: number;   // 2000-2005
  targetFloor: number | null;
}

interface AdjacencyEntry {
  id: string;
  floor: number;
  sides: {
    left?: string | null;
    right?: string | null;
    top?: string | null;
    bottom?: string | null;
    front?: string | null;
    back?: string | null;
  };
}

interface PortalPlacementEntry {
  floor: number;
  width: number;
  depth: number;
  portals: {
    left?: { buffer: number; startZ: number; endZ: number; x: number } | null;
    right?: { buffer: number; startZ: number; endZ: number; x: number } | null;
    front?: { buffer: number; startX: number; endX: number; z: number } | null;
    back?: { buffer: number; startX: number; endX: number; z: number } | null;
    up?: { x: number; z: number } | null;
    down?: { x: number; z: number } | null;
  };
}

class PortalManagerClass {
  private adjacencyMap: Map<number, Record<PortalDirection, number | null>> = new Map();
  private placements: PortalPlacement[] = [];
  private loaded = false;

  /**
   * Extract numeric floor ID from string like "block_29" -> 29
   */
  private parseBlockId(blockId: string | null | undefined): number | null {
    if (!blockId || typeof blockId !== 'string') return null;
    const match = blockId.match(/block_(\d+)/);
    if (!match) return null;
    return parseInt(match[1], 10);
  }

  /**
   * Map side name to PortalDirection enum
   */
  private sideToDirection(side: string): PortalDirection | null {
    switch (side) {
      case 'top': return PortalDirection.UP;
      case 'bottom': return PortalDirection.DOWN;
      case 'left': return PortalDirection.LEFT;
      case 'right': return PortalDirection.RIGHT;
      case 'front': return PortalDirection.FRONT;
      case 'back': return PortalDirection.BACK;
      default: return null;
    }
  }

  /**
   * Map direction key string to PortalDirection enum
   */
  private keyToDirection(key: DirectionKey): PortalDirection {
    switch (key) {
      case 'up': return PortalDirection.UP;
      case 'down': return PortalDirection.DOWN;
      case 'left': return PortalDirection.LEFT;
      case 'right': return PortalDirection.RIGHT;
      case 'front': return PortalDirection.FRONT;
      case 'back': return PortalDirection.BACK;
    }
  }

  /**
   * Load and normalize adjacency data from JSON
   */
  private loadAdjacency(data: AdjacencyEntry[]): void {
    for (const entry of data) {
      const floorId = entry.floor;
      if (floorId === undefined || floorId === null) continue;

      const directions: Record<PortalDirection, number | null> = {
        [PortalDirection.UP]: null,
        [PortalDirection.DOWN]: null,
        [PortalDirection.LEFT]: null,
        [PortalDirection.RIGHT]: null,
        [PortalDirection.FRONT]: null,
        [PortalDirection.BACK]: null
      };

      const sides = entry.sides || {};
      for (const [sideKey, sideValue] of Object.entries(sides)) {
        const dir = this.sideToDirection(sideKey);
        if (dir !== null) {
          directions[dir] = this.parseBlockId(sideValue as string | null);
        }
      }

      this.adjacencyMap.set(floorId, directions);
    }
  }

  /**
   * Load portal placements from JSON and generate tile coordinates
   */
  private loadPlacements(data: PortalPlacementEntry[]): void {
    this.placements = [];

    for (const entry of data) {
      const floorId = entry.floor;
      if (floorId === undefined || floorId === null) continue;

      const portals = entry.portals || {};

      // Process each direction
      for (const key of DIRECTION_KEYS) {
        const portalData = portals[key];
        if (portalData === null || portalData === undefined) continue;

        const direction = this.keyToDirection(key);
        const targetFloor = this.getTargetFloor(floorId, direction);

        // Up/Down are single tiles
        if (key === 'up' || key === 'down') {
          const pos = portalData as { x: number; z: number };
          if (pos.x !== undefined && pos.z !== undefined) {
            this.placements.push({
              floorId,
              x: pos.x,
              z: pos.z,
              direction,
              tileId: PORTAL_TILE_IDS[direction],
              targetFloor
            });
          }
        }
        // Left/Right/Front/Back are line spans
        else if (key === 'left' || key === 'right') {
          const span = portalData as { buffer: number; startZ: number; endZ: number; x: number };
          if (span.x !== undefined && span.startZ !== undefined && span.endZ !== undefined) {
            const minX = Math.min(span.startZ, span.endZ);
            const maxX = Math.max(span.startZ, span.endZ);
            for (let z = minX; z <= maxX; z++) {
              this.placements.push({
                floorId,
                x: span.x,
                z,
                direction,
                tileId: PORTAL_TILE_IDS[direction],
                targetFloor
              });
            }
          }
        }
        else if (key === 'front' || key === 'back') {
          const span = portalData as { buffer: number; startX: number; endX: number; z: number };
          if (span.z !== undefined && span.startX !== undefined && span.endX !== undefined) {
            const minX = Math.min(span.startX, span.endX);
            const maxX = Math.max(span.startX, span.endX);
            for (let x = minX; x <= maxX; x++) {
              this.placements.push({
                floorId,
                x,
                z: span.z,
                direction,
                tileId: PORTAL_TILE_IDS[direction],
                targetFloor
              });
            }
          }
        }
      }
    }
  }

  /**
   * Initialize the PortalManager by loading both JSON files
   */
  async initialize(): Promise<void> {
    if (this.loaded) return;

    try {
      // Load adjacency data
      const adjResponse = await fetch('src/config/block_floors_adjacency.json');
      const adjData: AdjacencyEntry[] = await adjResponse.json();
      this.loadAdjacency(adjData);

      // Load placement data
      const placementResponse = await fetch('src/config/list3_portal_placement (2).json');
      const placementData: PortalPlacementEntry[] = await placementResponse.json();
      this.loadPlacements(placementData);

      this.loaded = true;
      console.log('[PortalManager] Initialized with', this.placements.length, 'portal placements');
    } catch (error) {
      console.error('[PortalManager] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Get target floor ID for a given floor and direction
   * Returns null if no connection exists in that direction
   */
  getTargetFloor(floorId: number, direction: PortalDirection): number | null {
    const adj = this.adjacencyMap.get(floorId);
    if (!adj) return null;
    // Use explicit null check - floor 0 is valid!
    const target = adj[direction];
    return target !== undefined && target !== null ? target : null;
  }

  /**
   * Get all portal placements for a specific floor
   */
  getPlacementsForFloor(floorId: number): PortalPlacement[] {
    return this.placements.filter(p => p.floorId === floorId);
  }

  /**
   * Get all portal placements (for bulk operations)
   */
  getAllPlacements(): PortalPlacement[] {
    return this.placements;
  }

  /**
   * Check if a tile at given position on a floor is a portal
   * Returns the portal info if it is, null otherwise
   */
  getPortalAt(floorId: number, x: number, z: number): PortalPlacement | null {
    for (const p of this.placements) {
      if (p.floorId === floorId && p.x === x && p.z === z) {
        return p;
      }
    }
    return null;
  }

  /**
   * Check if a tile ID is a portal tile
   */
  isPortalTile(tileId: number): boolean {
    return tileId >= 2000 && tileId <= 2005;
  }

  /**
   * Get direction from tile ID
   */
  getDirectionFromTileId(tileId: number): PortalDirection | null {
    for (const [dir, id] of Object.entries(PORTAL_TILE_IDS)) {
      if (id === tileId) {
        return parseInt(dir, 10) as PortalDirection;
      }
    }
    return null;
  }
}

// Singleton instance
export const PortalManager = new PortalManagerClass();
