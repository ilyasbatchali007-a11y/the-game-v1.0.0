/// src/config/PortalManager.ts
// Manages 6-directional portal system using adjacency (List 2) and placement (List 3) data

import adjacencyData from './block_floors_adjacency.json';
import placementData from './list3_portal_placement.json';

// New portal tile IDs replacing old 1000/1001 system
export const PORTAL_TILE_IDS = {
  UP: 2001,      // Teleport to floor above (via top connection)
  DOWN: 2002,    // Teleport to floor below (via bottom connection)
  LEFT: 2003,    // Teleport to left neighbor block
  RIGHT: 2004,   // Teleport to right neighbor block
  FRONT: 2005,   // Teleport to front neighbor block
  BACK: 2006     // Teleport to back neighbor block
};

// Direction name mapping for consistency
export const DIRECTION_NAMES = ['up', 'down', 'left', 'right', 'front', 'back'] as const;
export type Direction = typeof DIRECTION_NAMES[number];

// Adjacency map: floorId -> direction -> targetBlockId
interface AdjacencyMap {
  [floorId: number]: {
    [direction: string]: string | null;
  };
}

// Placement map: floorId -> direction -> placement coords
interface PlacementMap {
  [floorId: number]: {
    [direction: string]: {
      buffer?: number;
      startX?: number;
      endX?: number;
      startZ?: number;
      endZ?: number;
      x?: number;
      z?: number;
    } | undefined;
  };
}

class PortalManagerClass {
  private adjacencyMap: AdjacencyMap = {};
  private placementMap: PlacementMap = {};
  private blockToFloor: Map<string, number> = new Map();

  constructor() {
    this.buildAdjacencyMap();
    this.buildPlacementMap();
    this.buildBlockToFloorMap();
  }

  private buildAdjacencyMap(): void {
    for (const block of adjacencyData) {
      const floorId = block.floor;
      this.adjacencyMap[floorId] = {};
      
      // Map sides to our direction names
      // Note: In the adjacency data, "top" = up, "bottom" = down
      this.adjacencyMap[floorId]['up'] = block.sides.top || null;
      this.adjacencyMap[floorId]['down'] = block.sides.bottom || null;
      this.adjacencyMap[floorId]['left'] = block.sides.left || null;
      this.adjacencyMap[floorId]['right'] = block.sides.right || null;
      this.adjacencyMap[floorId]['front'] = block.sides.front || null;
      this.adjacencyMap[floorId]['back'] = block.sides.back || null;
    }
  }

  private buildPlacementMap(): void {
    for (const floorConfig of placementData) {
      const floorId = floorConfig.floor;
      this.placementMap[floorId] = floorConfig.portals || {};
    }
  }

  private buildBlockToFloorMap(): void {
    for (const block of adjacencyData) {
      this.blockToFloor.set(block.id, block.floor);
    }
  }

  /**
   * Get the target floor ID when using a portal in a given direction from a source floor
   * @param sourceFloor - The current floor ID
   * @param direction - The direction of the portal (up/down/left/right/front/back)
   * @returns The target floor ID, or -1 if no connection exists
   */
  getTargetFloor(sourceFloor: number, direction: Direction): number {
    const adj = this.adjacencyMap[sourceFloor];
    if (!adj) return -1;
    
    const targetBlockId = adj[direction];
    if (!targetBlockId) return -1;
    
    const targetFloor = this.blockToFloor.get(targetBlockId);
    return targetFloor !== undefined ? targetFloor : -1;
  }

  /**
   * Check if a portal exists in a given direction from a source floor
   * @param sourceFloor - The current floor ID
   * @param direction - The direction to check
   * @returns true if a portal connection exists
   */
  hasPortal(sourceFloor: number, direction: Direction): boolean {
    return this.getTargetFloor(sourceFloor, direction) !== -1;
  }

  /**
   * Get placement coordinates for a portal on a specific floor
   * @param floorId - The floor ID
   * @param direction - The portal direction
   * @returns Placement config object, or undefined if no portal defined
   */
  getPlacement(floorId: number, direction: Direction) {
    const floorPlacement = this.placementMap[floorId];
    if (!floorPlacement) return undefined;
    return floorPlacement[direction];
  }

  /**
   * Get all portal placements for a floor
   * @param floorId - The floor ID
   * @returns Array of {direction, placement} tuples
   */
  getAllPlacements(floorId: number): Array<{direction: Direction, placement: any}> {
    const floorPlacement = this.placementMap[floorId];
    if (!floorPlacement) return [];
    
    const result: Array<{direction: Direction, placement: any}> = [];
    for (const dir of DIRECTION_NAMES) {
      if (floorPlacement[dir]) {
        result.push({ direction: dir, placement: floorPlacement[dir] });
      }
    }
    return result;
  }

  /**
   * Get the tile ID for a portal direction
   * @param direction - The portal direction
   * @returns The tile ID for rendering
   */
  getTileIdForDirection(direction: Direction): number {
    return PORTAL_TILE_IDS[direction.toUpperCase() as keyof typeof PORTAL_TILE_IDS];
  }

  /**
   * Get the direction from a tile ID
   * @param tileId - The portal tile ID
   * @returns The direction, or undefined if not a portal tile
   */
  getDirectionFromTileId(tileId: number): Direction | undefined {
    for (const [dir, id] of Object.entries(PORTAL_TILE_IDS)) {
      if (id === tileId) {
        return dir.toLowerCase() as Direction;
      }
    }
    return undefined;
  }
}

// Singleton instance
export const PortalManager = new PortalManagerClass();

// Expose globally for lazy access from MapData.ts
(globalThis as any).__PortalManager = PortalManager;
