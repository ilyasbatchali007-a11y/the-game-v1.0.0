// src/config/PortalManager.ts
// Manages 6-directional portal system with spatial adjacency
// Loads adjacency data and portal placement from JSON files

export interface PortalData {
  x: number;           // Tile column position
  z: number;           // Tile row position  
  direction: PortalDirection;
  tileId: number;      // 2000-2005
  targetFloor: number | null;
}

export interface BarrierData {
  x: number;           // Tile column position
  z: number;           // Tile row position
  direction: PortalDirection;  // Direction this barrier protects
  tileId: number;      // 2 (collision block) but rendered as floor
  portalTileId: number; // The portal tile this barrier protects (2000-2005)
}

export type PortalDirection = 'up' | 'down' | 'left' | 'right' | 'front' | 'back';

export const PORTAL_TILE_IDS: Record<PortalDirection, number> = {
  up: 2000,
  down: 2001,
  left: 2002,
  right: 2003,
  front: 2004,
  back: 2005
};

export const DIRECTION_NAMES: Record<number, PortalDirection> = {
  2000: 'up',
  2001: 'down',
  2002: 'left',
  2003: 'right',
  2004: 'front',
  2005: 'back'
};

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

interface PortalPlacementEntry {
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
  private static instance: PortalManager;
  
  // Map: floorId -> array of portal data for that floor
  private floorPortals: Map<number, PortalData[]> = new Map();
  
  // Map: floorId -> array of barrier data for that floor
  private floorBarriers: Map<number, BarrierData[]> = new Map();
  
  // Map: floorId -> floor dimensions (width, depth in tiles)
  private floorDimensions: Map<number, { width: number; depth: number }> = new Map();
  
  // Lookup: floorId + direction -> target floor ID
  private adjacencyLookup: Map<number, Map<string, number | null>> = new Map();
  
  private constructor() {}
  
  public static getInstance(): PortalManager {
    if (!PortalManager.instance) {
      PortalManager.instance = new PortalManager();
    }
    return PortalManager.instance;
  }
  
  /**
   * Load portal data from adjacency and placement JSON files
   * Must be called before using any other methods
   */
  public async loadPortalData(
    adjacencyUrl: string,
    placementUrl: string
  ): Promise<void> {
    console.log('[PortalManager] Loading portal data...');
    
    try {
      const [adjacencyResponse, placementResponse] = await Promise.all([
        fetch(adjacencyUrl),
        fetch(placementUrl)
      ]);
      
      if (!adjacencyResponse.ok || !placementResponse.ok) {
        throw new Error(`Failed to load portal data: ${adjacencyResponse.status} / ${placementResponse.status}`);
      }
      
      const adjacencyData: AdjacencyEntry[] = await adjacencyResponse.json();
      const placementData: PortalPlacementEntry[] = await placementResponse.json();
      
      this.buildPortalData(adjacencyData, placementData);
      console.log(`[PortalManager] Loaded portals for ${this.floorDimensions.size} floors`);
    } catch (error) {
      console.error('[PortalManager] Failed to load portal data:', error);
      throw error;
    }
  }
  
  /**
   * Build internal data structures from loaded JSON
   */
  private buildPortalData(
    adjacencyData: AdjacencyEntry[],
    placementData: PortalPlacementEntry[]
  ): void {
    this.floorPortals.clear();
    this.floorBarriers.clear();
    this.floorDimensions.clear();
    this.adjacencyLookup.clear();
    
    // Build adjacency lookup: normalize string IDs to numbers
    for (const entry of adjacencyData) {
      const floorId = entry.floor;
      const floorAdjacency = new Map<string, number | null>();
      
      // Map sides to directions (top->up, bottom->down)
      floorAdjacency.set('up', this.normalizeFloorId(entry.sides.top));
      floorAdjacency.set('down', this.normalizeFloorId(entry.sides.bottom));
      floorAdjacency.set('left', this.normalizeFloorId(entry.sides.left));
      floorAdjacency.set('right', this.normalizeFloorId(entry.sides.right));
      floorAdjacency.set('front', this.normalizeFloorId(entry.sides.front));
      floorAdjacency.set('back', this.normalizeFloorId(entry.sides.back));
      
      this.adjacencyLookup.set(floorId, floorAdjacency);
    }
    
    // Build portal placement data and dimensions
    for (const entry of placementData) {
      const floorId = entry.floor;
      // width and depth in JSON are already tile counts, not world units
      const widthTiles = entry.width;
      const depthTiles = entry.depth;
      
      this.floorDimensions.set(floorId, { width: widthTiles, depth: depthTiles });
      
      const portals: PortalData[] = [];
      const barriers: BarrierData[] = [];
      const portalsConfig = entry.portals;
      
      // Process each direction
      const directions: Array<{
        dir: PortalDirection;
        config: any;
        isLine: boolean;
      }> = [
        { dir: 'left', config: portalsConfig.left, isLine: true },
        { dir: 'right', config: portalsConfig.right, isLine: true },
        { dir: 'front', config: portalsConfig.front, isLine: true },
        { dir: 'back', config: portalsConfig.back, isLine: true },
        { dir: 'up', config: portalsConfig.up, isLine: false },
        { dir: 'down', config: portalsConfig.down, isLine: false }
      ];
      
      for (const { dir, config, isLine } of directions) {
        if (!config) continue;
        
        const targetFloor = this.getTargetFloor(floorId, dir);
        const tileId = PORTAL_TILE_IDS[dir];
        
        if (isLine) {
          // Wall-line portals (left/right/front/back)
          if (dir === 'left' || dir === 'right') {
            // Vertical line along Z axis at fixed X
            const x = config.x;
            const startZ = config.startZ;
            const endZ = config.endZ;
            
            for (let z = startZ; z <= endZ; z++) {
              portals.push({
                x,
                z,
                direction: dir,
                tileId,
                targetFloor
              });
              
              // Add barrier 1 tile inward (left: +1 X, right: -1 X)
              const barrierX = dir === 'left' ? x + 1 : x - 1;
              barriers.push({
                x: barrierX,
                z,
                direction: dir,
                tileId: 0,  // Floor tile (invisible/chessboard) - collision handled by isStatic flag
                portalTileId: tileId
              });
            }
          } else if (dir === 'front' || dir === 'back') {
            // Horizontal line along X axis at fixed Z
            const z = config.z;
            const startX = config.startX;
            const endX = config.endX;
            
            for (let x = startX; x <= endX; x++) {
              portals.push({
                x,
                z,
                direction: dir,
                tileId,
                targetFloor
              });
              
              // Add barrier 1 tile inward (front: +1 Z, back: -1 Z)
              const barrierZ = dir === 'front' ? z + 1 : z - 1;
              barriers.push({
                x,
                z: barrierZ,
                direction: dir,
                tileId: 0,  // Floor tile (invisible/chessboard) - collision handled by isStatic flag
                portalTileId: tileId
              });
            }
          }
        } else {
          // Point portals (up/down) - no barriers needed
          portals.push({
            x: config.x,
            z: config.z,
            direction: dir,
            tileId,
            targetFloor
          });
        }
      }
      
      this.floorPortals.set(floorId, portals);
      this.floorBarriers.set(floorId, barriers);
    }
  }
  
  /**
   * Normalize floor ID from string ("block_X") or number to plain number
   */
  private normalizeFloorId(value: string | number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    
    if (typeof value === 'number') {
      return value;
    }
    
    // Parse "block_X" format
    if (typeof value === 'string') {
      const match = value.match(/^block_(\d+)$/);
      if (match) {
        return parseInt(match[1], 10);
      }
      // Try parsing as plain number string
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        return numValue;
      }
    }
    
    return null;
  }
  
  /**
   * Get target floor ID for a given floor and direction
   */
  public getTargetFloor(floorId: number, direction: PortalDirection): number | null {
    const adjacency = this.adjacencyLookup.get(floorId);
    if (!adjacency) {
      return null;
    }
    const target = adjacency.get(direction);
    // Falsy-zero safety: floor 0 is valid
    return target !== undefined && target !== null ? target : null;
  }
  
  /**
   * Get all portal tiles for a specific floor
   */
  public getFloorPortals(floorId: number): PortalData[] {
    return this.floorPortals.get(floorId) || [];
  }
  
  /**
   * Get floor dimensions in tiles
   */
  public getFloorDimensions(floorId: number): { width: number; depth: number } | null {
    return this.floorDimensions.get(floorId) || null;
  }
  
  /**
   * Check if a tile position on a floor is a portal, return portal data if so
   */
  public getPortalAtPosition(floorId: number, col: number, row: number): PortalData | null {
    const portals = this.floorPortals.get(floorId);
    if (!portals) return null;
    
    for (const portal of portals) {
      if (portal.x === col && portal.z === row) {
        return portal;
      }
    }
    return null;
  }
  
  /**
   * Get all portal positions for efficient lookup (returns Set of "col,row" strings)
   */
  public getPortalPositionsSet(floorId: number): Set<string> {
    const portalSet = new Set<string>();
    const portals = this.floorPortals.get(floorId);
    if (portals) {
      for (const portal of portals) {
        portalSet.add(`${portal.x},${portal.z}`);
      }
    }
    return portalSet;
  }
  
  /**
   * Generate MAP_TILE_DATA entries for all portals on a floor
   * Returns array of {index, tileId, isStatic} for setting in MAP_TILE_DATA
   */
  public generatePortalTileData(
    floorId: number,
    mapCols: number
  ): Array<{ index: number; tileId: number; isStatic: number }> {
    const result: Array<{ index: number; tileId: number; isStatic: number }> = [];
    const portals = this.floorPortals.get(floorId);
    
    if (!portals) return result;
    
    for (const portal of portals) {
      // Validate bounds
      if (portal.x < 0 || portal.x >= mapCols || portal.z < 0) {
        console.warn(`[PortalManager] Portal out of bounds on floor ${floorId}: (${portal.x}, ${portal.z})`);
        continue;
      }
      
      const idx = (portal.z * mapCols + portal.x) * 2;
      result.push({
        index: idx,
        tileId: portal.tileId,
        isStatic: 1
      });
    }
    
    return result;
  }
  
  /**
   * Generate MAP_TILE_DATA entries for all barrier tiles on a floor
   * Barriers use tileId 2 (collision block) but should render as floor (invisible)
   * Returns array of {index, tileId, isStatic} for setting in MAP_TILE_DATA
   */
  public generateBarrierTileData(
    floorId: number,
    mapCols: number
  ): Array<{ index: number; tileId: number; isStatic: number }> {
    const result: Array<{ index: number; tileId: number; isStatic: number }> = [];
    const barriers = this.floorBarriers.get(floorId);
    
    if (!barriers) return result;
    
    for (const barrier of barriers) {
      // Validate bounds
      if (barrier.x < 0 || barrier.x >= mapCols || barrier.z < 0) {
        console.warn(`[PortalManager] Barrier out of bounds on floor ${floorId}: (${barrier.x}, ${barrier.z})`);
        continue;
      }
      
      const idx = (barrier.z * mapCols + barrier.x) * 2;
      result.push({
        index: idx,
        tileId: barrier.tileId,  // Tile ID 2 for collision
        isStatic: 1
      });
    }
    
    return result;
  }
  
  /**
   * Get all barrier data for a specific floor
   */
  public getFloorBarriers(floorId: number): BarrierData[] {
    return this.floorBarriers.get(floorId) || [];
  }
  
  /**
   * Check if a tile position is a barrier, return barrier data if so
   */
  public getBarrierAtPosition(floorId: number, col: number, row: number): BarrierData | null {
    const barriers = this.floorBarriers.get(floorId);
    if (!barriers) return null;
    
    for (const barrier of barriers) {
      if (barrier.x === col && barrier.z === row) {
        return barrier;
      }
    }
    return null;
  }
  
  /**
   * Get barrier positions set for efficient lookup (returns Set of "col,row" strings)
   */
  public getBarrierPositionsSet(floorId: number): Set<string> {
    const barrierSet = new Set<string>();
    const barriers = this.floorBarriers.get(floorId);
    if (barriers) {
      for (const barrier of barriers) {
        barrierSet.add(`${barrier.x},${barrier.z}`);
      }
    }
    return barrierSet;
  }
  
  /**
   * Get total number of floors with portal data
   */
  public getFloorCount(): number {
    return this.floorDimensions.size;
  }
  
  /**
   * Get all floor IDs that have portal data
   */
  public getAllFloorIds(): number[] {
    return Array.from(this.floorDimensions.keys()).sort((a, b) => a - b);
  }
}

// Export singleton instance
export const portalManager = PortalManager.getInstance();
