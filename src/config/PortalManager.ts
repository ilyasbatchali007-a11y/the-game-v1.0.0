// PortalManager.ts
// Manages 6-directional teleport system for dungeon floors
// Loads adjacency and placement data from JSON files, provides lookup methods

export enum PortalDirection {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  FRONT = 'front',
  BACK = 'back'
}

// Portal tile IDs (replacing old 1000/1001 system)
export const PORTAL_TILE_IDS: Record<PortalDirection, number> = {
  [PortalDirection.UP]: 2000,
  [PortalDirection.DOWN]: 2001,
  [PortalDirection.LEFT]: 2002,
  [PortalDirection.RIGHT]: 2003,
  [PortalDirection.FRONT]: 2004,
  [PortalDirection.BACK]: 2005
};

// Reverse mapping: tile ID -> direction
export const TILE_ID_TO_DIRECTION: Record<number, PortalDirection> = {
  2000: PortalDirection.UP,
  2001: PortalDirection.DOWN,
  2002: PortalDirection.LEFT,
  2003: PortalDirection.RIGHT,
  2004: PortalDirection.FRONT,
  2005: PortalDirection.BACK
};

export interface PortalPlacement {
  x: number;
  z: number;
  direction: PortalDirection;
  tileId: number;
  targetFloor: number | null; // null if no connection in this direction
}

interface AdjacencyEntry {
  id: string;
  floor: number;
  position: { x: number; y: number; z: number };
  sides: {
    left: string | null;
    right: string | null;
    top: string | null;
    bottom: string | null;
    front: string | null;
    back: string | null;
  };
}

interface PlacementEntry {
  floor: number;
  width: number;
  depth: number;
  portals: {
    left: { buffer: number; startZ: number; endZ: number; x: number } | null;
    right: { buffer: number; startZ: number; endZ: number; x: number } | null;
    front: { buffer: number; startX: number; endX: number; z: number } | null;
    back: { buffer: number; startX: number; endX: number; z: number } | null;
    up: { x: number; z: number } | null;
    down: { x: number; z: number } | null;
  };
}

export class PortalManager {
  private static instance: PortalManager | null = null;
  
  // Map: floorId -> array of portal placements
  private floorPortals: Map<number, PortalPlacement[]> = new Map();
  
  // Map: floorId -> adjacency lookup (direction -> target floor ID)
  private floorAdjacency: Map<number, Record<string, number | null>> = new Map();
  
  // Map: blockId string -> numeric floor ID
  private blockIdToFloor: Map<string, number> = new Map();
  
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): PortalManager {
    if (!PortalManager.instance) {
      PortalManager.instance = new PortalManager();
    }
    return PortalManager.instance;
  }

  /**
   * Initialize the PortalManager with adjacency and placement data
   * Must be called before any other methods
   */
  public async initialize(
    adjacencyData: AdjacencyEntry[],
    placementData: PlacementEntry[]
  ): Promise<void> {
    if (this.initialized) {
      console.warn('[PortalManager] Already initialized, skipping');
      return;
    }

    // Step 1: Build blockId -> floorId mapping from adjacency data
    for (const entry of adjacencyData) {
      // Safely handle floor ID - must check for undefined/null explicitly
      if (entry.floor !== undefined && entry.floor !== null) {
        this.blockIdToFloor.set(entry.id, entry.floor);
      }
    }

    // Step 2: Build adjacency lookup for each floor
    // Direction mapping: top->up, bottom->down (normalize to placement naming)
    for (const entry of adjacencyData) {
      const floorId = entry.floor;
      if (floorId === undefined || floorId === null) continue;

      const adjacency: Record<string, number | null> = {};
      
      // Process each direction, handling null values safely
      adjacency[PortalDirection.LEFT] = this.resolveBlockIdToFloor(entry.sides.left);
      adjacency[PortalDirection.RIGHT] = this.resolveBlockIdToFloor(entry.sides.right);
      adjacency[PortalDirection.FRONT] = this.resolveBlockIdToFloor(entry.sides.front);
      adjacency[PortalDirection.BACK] = this.resolveBlockIdToFloor(entry.sides.back);
      // Map top->UP, bottom->DOWN
      adjacency[PortalDirection.UP] = this.resolveBlockIdToFloor(entry.sides.top);
      adjacency[PortalDirection.DOWN] = this.resolveBlockIdToFloor(entry.sides.bottom);

      this.floorAdjacency.set(floorId, adjacency);
    }

    // Step 3: Build portal placements for each floor
    for (const entry of placementData) {
      const floorId = entry.floor;
      if (floorId === undefined || floorId === null) continue;

      const portals: PortalPlacement[] = [];
      const portalsData = entry.portals;

      // Process each direction - always present but may be null
      this.addPortalFromPlacement(portals, floorId, PortalDirection.LEFT, portalsData.left);
      this.addPortalFromPlacement(portals, floorId, PortalDirection.RIGHT, portalsData.right);
      this.addPortalFromPlacement(portals, floorId, PortalDirection.FRONT, portalsData.front);
      this.addPortalFromPlacement(portals, floorId, PortalDirection.BACK, portalsData.back);
      this.addPortalFromPlacement(portals, floorId, PortalDirection.UP, portalsData.up);
      this.addPortalFromPlacement(portals, floorId, PortalDirection.DOWN, portalsData.down);

      this.floorPortals.set(floorId, portals);
    }

    this.initialized = true;
    console.log(`[PortalManager] Initialized with ${this.floorPortals.size} floors`);
  }

  /**
   * Resolve a block ID string (e.g., "block_1") to its numeric floor ID
   * Returns null if the block ID is null/undefined or not found
   */
  private resolveBlockIdToFloor(blockId: string | null): number | null {
    if (blockId === null || blockId === undefined) {
      return null;
    }
    const floorId = this.blockIdToFloor.get(blockId);
    // Explicitly check for undefined - floor 0 is valid!
    if (floorId === undefined) {
      console.warn(`[PortalManager] Block ID "${blockId}" not found in mapping`);
      return null;
    }
    return floorId;
  }

  /**
   * Add portal placements from placement data
   * Handles both wall-line spans (L/R/F/B) and point portals (U/D)
   */
  private addPortalFromPlacement(
    portals: PortalPlacement[],
    floorId: number,
    direction: PortalDirection,
    placementData: { buffer?: number; startZ?: number; endZ?: number; startX?: number; endX?: number; x?: number; z?: number } | null
  ): void {
    if (placementData === null || placementData === undefined) {
      // No portal in this direction - still record it with null target
      // Get target floor from adjacency data
      const adjacency = this.floorAdjacency.get(floorId);
      const targetFloor = adjacency ? adjacency[direction] ?? null : null;
      
      // For null placements, we don't add any tiles - the direction simply has no portal
      return;
    }

    const tileId = PORTAL_TILE_IDS[direction];
    const adjacency = this.floorAdjacency.get(floorId);
    const targetFloor = adjacency ? adjacency[direction] ?? null : null;

    // Check if this is a point portal (up/down) or wall-line portal (left/right/front/back)
    if ('startX' in placementData && placementData.startX !== undefined) {
      // Wall-line portal along X axis (front/back walls)
      const z = placementData.z!;
      const startX = Math.min(placementData.startX!, placementData.endX!);
      const endX = Math.max(placementData.startX!, placementData.endX!);
      
      for (let x = startX; x <= endX; x++) {
        portals.push({ x, z, direction, tileId, targetFloor });
      }
    } else if ('startZ' in placementData && placementData.startZ !== undefined) {
      // Wall-line portal along Z axis (left/right walls)
      const x = placementData.x!;
      const startZ = Math.min(placementData.startZ!, placementData.endZ!);
      const endZ = Math.max(placementData.startZ!, placementData.endZ!);
      
      for (let z = startZ; z <= endZ; z++) {
        portals.push({ x, z, direction, tileId, targetFloor });
      }
    } else {
      // Point portal (up/down)
      const x = placementData.x!;
      const z = placementData.z!;
      portals.push({ x, z, direction, tileId, targetFloor });
    }
  }

  /**
   * Get all portal placements for a specific floor
   * Returns empty array if floor not found
   */
  public getPortalsForFloor(floorId: number): PortalPlacement[] {
    if (floorId === undefined || floorId === null) {
      return [];
    }
    return this.floorPortals.get(floorId) ?? [];
  }

  /**
   * Get the target floor ID when using a portal in a specific direction from a given floor
   * Returns null if no connection exists in that direction
   */
  public getTargetFloor(fromFloor: number, direction: PortalDirection): number | null {
    if (fromFloor === undefined || fromFloor === null) {
      return null;
    }
    const adjacency = this.floorAdjacency.get(fromFloor);
    if (!adjacency) {
      return null;
    }
    // Safe access - explicitly check for undefined
    const target = adjacency[direction];
    return target !== undefined ? target : null;
  }

  /**
   * Get the target floor ID for a specific portal tile
   * Searches all portals on the given floor to find matching coordinates
   */
  public getTargetFloorForTile(floorId: number, tileCol: number, tileRow: number): number | null {
    if (floorId === undefined || floorId === null) {
      return null;
    }
    
    const portals = this.getPortalsForFloor(floorId);
    for (const portal of portals) {
      // Note: portal x/z are in tile coordinates already
      if (portal.x === tileCol && portal.z === tileRow) {
        return portal.targetFloor;
      }
    }
    return null;
  }

  /**
   * Check if a tile at given coordinates is a portal
   * Returns the portal direction if it is, null otherwise
   */
  public getPortalDirectionAt(floorId: number, tileCol: number, tileRow: number): PortalDirection | null {
    if (floorId === undefined || floorId === null) {
      return null;
    }
    
    const portals = this.getPortalsForFloor(floorId);
    for (const portal of portals) {
      if (portal.x === tileCol && portal.z === tileRow) {
        return portal.direction;
      }
    }
    return null;
  }

  /**
   * Get the portal tile ID at given coordinates
   * Returns 0 if not a portal tile
   */
  public getPortalTileIdAt(floorId: number, tileCol: number, tileRow: number): number {
    const direction = this.getPortalDirectionAt(floorId, tileCol, tileRow);
    if (direction === null) {
      return 0;
    }
    return PORTAL_TILE_IDS[direction];
  }

  /**
   * Check if the PortalManager has been initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the PortalManager (for testing/reinitialization)
   */
  public reset(): void {
    this.floorPortals.clear();
    this.floorAdjacency.clear();
    this.blockIdToFloor.clear();
    this.initialized = false;
  }
}

// Export singleton instance for convenience
export const portalManager = PortalManager.getInstance();
