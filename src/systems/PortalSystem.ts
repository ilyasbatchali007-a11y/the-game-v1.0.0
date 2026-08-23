// PortalSystem.ts - Manages 6-directional portal teleportation
// Uses block_floors_adjacency.json for floor connectivity
// Uses list3_portal_placement.json for portal tile positions

// Directional portal tile IDs (replaces old 1000/1001 system)
export const PORTAL_TILE_IDS = {
  LEFT: 2000,   // Portal to left neighbor
  RIGHT: 2001,  // Portal to right neighbor
  FRONT: 2002,  // Portal to front neighbor
  BACK: 2003,   // Portal to back neighbor
  UP: 2004,     // Portal to upper floor (top)
  DOWN: 2005,   // Portal to lower floor (bottom)
} as const;

export type PortalDirection = keyof typeof PORTAL_TILE_IDS;

export const DIRECTION_TO_TILE_ID: Record<PortalDirection, number> = PORTAL_TILE_IDS;

// Reverse lookup: tile ID to direction
export const TILE_ID_TO_DIRECTION: Record<number, PortalDirection> = {
  2000: 'LEFT',
  2001: 'RIGHT',
  2002: 'FRONT',
  2003: 'BACK',
  2004: 'UP',
  2005: 'DOWN',
};

// Adjacency data structure matching block_floors_adjacency.json format
interface BlockSides {
  left: string | null;
  right: string | null;
  top: string | null;
  bottom: string | null;
  front: string | null;
  back: string | null;
}

interface BlockData {
  id: string;
  floor: number;
  position: { x: number; y: number; z: number };
  sides: BlockSides;
}

// Portal placement data structure matching list3_portal_placement.json format
interface PortalPlacement {
  floor: number;
  width: number;
  depth: number;
  portals: {
    left?: { buffer: number; startZ: number; endZ: number; x: number };
    right?: { buffer: number; startZ: number; endZ: number; x: number };
    front?: { buffer: number; startX: number; endX: number; z: number };
    back?: { buffer: number; startX: number; endX: number; z: number };
    up?: { x: number; z: number };
    down?: { x: number; z: number };
  };
}

// Floor adjacency lookup: floorId -> direction -> neighborFloorId (or null)
type FloorAdjacencyMap = Map<number, Record<PortalDirection, number | null>>;

// Portal placements by floor
type PortalPlacementsMap = Map<number, PortalPlacement>;

export class PortalSystem {
  private adjacencyMap: FloorAdjacencyMap = new Map();
  private placementsMap: PortalPlacementsMap = new Map();
  private loaded = false;

  /**
   * Initialize the portal system by loading adjacency and placement data
   */
  async initialize(): Promise<void> {
    if (this.loaded) return;

    try {
      // Load adjacency data
      const adjacencyResponse = await fetch('src/config/block_floors_adjacency.json');
      const adjacencyData: BlockData[] = await adjacencyResponse.json();

      // Build floor adjacency map
      for (const block of adjacencyData) {
        const floorId = block.floor;
        const sides = block.sides;

        // Convert block references to floor numbers
        // The adjacent block's floor number is the destination floor
        const adjacency: Record<PortalDirection, number | null> = {
          LEFT: sides.left !== null ? this.getBlockFloor(sides.left, adjacencyData) : null,
          RIGHT: sides.right !== null ? this.getBlockFloor(sides.right, adjacencyData) : null,
          FRONT: sides.front !== null ? this.getBlockFloor(sides.front, adjacencyData) : null,
          BACK: sides.back !== null ? this.getBlockFloor(sides.back, adjacencyData) : null,
          UP: sides.top !== null ? this.getBlockFloor(sides.top, adjacencyData) : null,
          DOWN: sides.bottom !== null ? this.getBlockFloor(sides.bottom, adjacencyData) : null,
        };

        this.adjacencyMap.set(floorId, adjacency);
      }

      // Load placement data
      const placementResponse = await fetch('src/config/list3_portal_placement.json');
      const placementData: PortalPlacement[] = await placementResponse.json();

      // Build placements map
      for (const placement of placementData) {
        this.placementsMap.set(placement.floor, placement);
      }

      this.loaded = true;
      console.log(`[PortalSystem] Loaded ${this.adjacencyMap.size} floors with adjacency data`);
    } catch (error) {
      console.error('[PortalSystem] Failed to load portal data:', error);
      throw error;
    }
  }

  /**
   * Get the floor ID for a given block reference
   */
  private getBlockFloor(blockId: string, adjacencyData: BlockData[]): number {
    const block = adjacencyData.find(b => b.id === blockId);
    return block ? block.floor : -1;
  }

  /**
   * Get the destination floor for a given floor and direction
   * Returns null if no neighbor exists in that direction
   */
  getDestinationFloor(floorId: number, direction: PortalDirection): number | null {
    const adjacency = this.adjacencyMap.get(floorId);
    if (!adjacency) return null;
    return adjacency[direction] ?? null;
  }

  /**
   * Check if a floor has a valid neighbor in the given direction
   */
  hasNeighbor(floorId: number, direction: PortalDirection): boolean {
    const destFloor = this.getDestinationFloor(floorId, direction);
    return destFloor !== null && destFloor >= 0;
  }

  /**
   * Get portal placement data for a specific floor
   */
  getPortalPlacement(floorId: number): PortalPlacement | undefined {
    return this.placementsMap.get(floorId);
  }

  /**
   * Get all portal directions that have valid neighbors for a floor
   */
  getActivePortalDirections(floorId: number): PortalDirection[] {
    const directions: PortalDirection[] = [];
    const adjacency = this.adjacencyMap.get(floorId);
    if (!adjacency) return directions;

    for (const dir of Object.keys(PORTAL_TILE_IDS) as PortalDirection[]) {
      if (adjacency[dir] !== null && adjacency[dir] !== undefined && adjacency[dir]! >= 0) {
        directions.push(dir);
      }
    }
    return directions;
  }

  /**
   * Generate portal tile positions for a floor based on placement data and adjacency
   * Returns array of {col, row, tileId} for each portal tile to place
   */
  generatePortalTiles(floorId: number, mapCols: number, mapRows: number): Array<{ col: number; row: number; tileId: number }> {
    const placement = this.placementsMap.get(floorId);
    if (!placement) return [];

    const tiles: Array<{ col: number; row: number; tileId: number }> = [];
    const adjacency = this.adjacencyMap.get(floorId);
    if (!adjacency) return tiles;

    // Helper to check if a direction has a valid neighbor
    const hasValidNeighbor = (dir: PortalDirection): boolean => {
      const dest = adjacency[dir];
      return dest !== null && dest !== undefined && dest >= 0;
    };

    // Place LEFT portal tiles (line along left wall)
    if (placement.portals.left && hasValidNeighbor('LEFT')) {
      const { x, startZ, endZ } = placement.portals.left;
      for (let z = startZ; z <= endZ; z++) {
        tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.LEFT });
      }
    }

    // Place RIGHT portal tiles (line along right wall)
    if (placement.portals.right && hasValidNeighbor('RIGHT')) {
      const { x, startZ, endZ } = placement.portals.right;
      for (let z = startZ; z <= endZ; z++) {
        tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.RIGHT });
      }
    }

    // Place FRONT portal tiles (line along front wall)
    if (placement.portals.front && hasValidNeighbor('FRONT')) {
      const { z, startX, endX } = placement.portals.front;
      for (let x = startX; x <= endX; x++) {
        tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.FRONT });
      }
    }

    // Place BACK portal tiles (line along back wall)
    if (placement.portals.back && hasValidNeighbor('BACK')) {
      const { z, startX, endX } = placement.portals.back;
      for (let x = startX; x <= endX; x++) {
        tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.BACK });
      }
    }

    // Place UP portal tile (single interior tile)
    if (placement.portals.up && hasValidNeighbor('UP')) {
      const { x, z } = placement.portals.up;
      tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.UP });
    }

    // Place DOWN portal tile (single interior tile)
    if (placement.portals.down && hasValidNeighbor('DOWN')) {
      const { x, z } = placement.portals.down;
      tiles.push({ col: x, row: z, tileId: PORTAL_TILE_IDS.DOWN });
    }

    return tiles;
  }

  /**
   * Check if the portal system has been initialized
   */
  isInitialized(): boolean {
    return this.loaded;
  }

  /**
   * Teleport player through a portal
   * @param currentFloor - Current floor ID
   * @param direction - Portal direction used
   * @returns New floor ID after teleportation
   */
  teleport(currentFloor: number, direction: PortalDirection): number | null {
    const destFloor = this.getDestinationFloor(currentFloor, direction);
    if (destFloor === null) {
      console.warn(`[PortalSystem] No destination for floor ${currentFloor} direction ${direction}`);
      return null;
    }
    console.log(`[PortalSystem] Teleported from floor ${currentFloor} (${direction}) to floor ${destFloor}`);
    return destFloor;
  }

  /**
   * Get the portal direction from a tile ID
   */
  getDirectionFromTileId(tileId: number): PortalDirection | null {
    return TILE_ID_TO_DIRECTION[tileId] || null;
  }

  /**
   * Check if a tile ID is a portal tile
   */
  isPortalTile(tileId: number): boolean {
    return tileId in TILE_ID_TO_DIRECTION;
  }
}

// Export singleton instance
export const portalSystem = new PortalSystem();
