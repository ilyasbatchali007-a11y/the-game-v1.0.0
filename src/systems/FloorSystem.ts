import { Vector2 } from '../math/Vector2';

// --- Configuration Interfaces ---

export interface FloorTileConfig {
    id: number;
    name: string;
    textureIndex: number; // Index in the atlas
    walkable: boolean;
    transparent: boolean;
    lightLevel?: number;
}

export interface FloorDimensionConfig {
    width: number;      // Width in pixels
    height: number;     // Height in pixels (depth)
    tileCountX: number; // Width in tiles
    tileCountY: number; // Height in tiles
    entranceX: number;
    entranceY: number;
    exitX: number;
    exitY: number;
    useAtlas: boolean;  // Whether to use atlas texture or procedural
}

// --- Constants & Data (The "Single Source of Truth") ---

const FLOOR_ATLAS_COLS = 32;
const FLOOR_ATLAS_ROWS = 32;
export const TILE_SIZE = 64;

// Tile ID mappings
export const TILE_IDS = {
    VOID: 0,
    FLOOR: 1,
    WALL: 2,
    PORTAL_NEXT: 1000,
    PORTAL_PREV: 1001,
    ATLAS_BASE: 100
};

// Dimension configurations for different floor levels (consolidated from FloorMap.ts)
export const FLOOR_DIMENSIONS: Record<number, FloorDimensionConfig> = {
    0: { 
        width: 10240, height: 10240, tileCountX: 160, tileCountY: 160,
        entranceX: 80, entranceY: 78, exitX: 80, exitY: 82,
        useAtlas: true 
    },
    1: { 
        width: 1536, height: 1536, tileCountX: 24, tileCountY: 24,
        entranceX: 12, entranceY: 10, exitX: 12, exitY: 14,
        useAtlas: false 
    },
    2: { 
        width: 3072, height: 3072, tileCountX: 48, tileCountY: 48,
        entranceX: 24, entranceY: 22, exitX: 24, exitY: 26,
        useAtlas: false 
    },
    3: { 
        width: 3072, height: 1536, tileCountX: 48, tileCountY: 24,
        entranceX: 24, entranceY: 10, exitX: 24, exitY: 14,
        useAtlas: false 
    },
    4: { 
        width: 1536, height: 3072, tileCountX: 24, tileCountY: 48,
        entranceX: 12, entranceY: 22, exitX: 12, exitY: 26,
        useAtlas: false 
    },
    5: { 
        width: 1920, height: 1920, tileCountX: 30, tileCountY: 30,
        entranceX: 15, entranceY: 13, exitX: 15, exitY: 17,
        useAtlas: false 
    },
    6: { 
        width: 2304, height: 2304, tileCountX: 36, tileCountY: 36,
        entranceX: 18, entranceY: 16, exitX: 18, exitY: 20,
        useAtlas: false 
    },
    7: { 
        width: 2880, height: 2880, tileCountX: 45, tileCountY: 45,
        entranceX: 22, entranceY: 20, exitX: 22, exitY: 25,
        useAtlas: false 
    },
    8: { 
        width: 3072, height: 1536, tileCountX: 48, tileCountY: 24,
        entranceX: 24, entranceY: 10, exitX: 24, exitY: 14,
        useAtlas: false 
    },
    9: { 
        width: 1792, height: 1792, tileCountX: 28, tileCountY: 28,
        entranceX: 14, entranceY: 12, exitX: 14, exitY: 16,
        useAtlas: false 
    },
    10: { 
        width: 2688, height: 1664, tileCountX: 42, tileCountY: 26,
        entranceX: 21, entranceY: 11, exitX: 21, exitY: 15,
        useAtlas: false 
    },
    11: { 
        width: 1664, height: 2688, tileCountX: 26, tileCountY: 42,
        entranceX: 13, entranceY: 19, exitX: 13, exitY: 23,
        useAtlas: false 
    },
    12: { 
        width: 2048, height: 2048, tileCountX: 32, tileCountY: 32,
        entranceX: 16, entranceY: 14, exitX: 16, exitY: 18,
        useAtlas: false 
    },
    13: { 
        width: 2560, height: 2560, tileCountX: 40, tileCountY: 40,
        entranceX: 20, entranceY: 18, exitX: 20, exitY: 22,
        useAtlas: false 
    },
    14: { 
        width: 3072, height: 3072, tileCountX: 48, tileCountY: 48,
        entranceX: 24, entranceY: 22, exitX: 24, exitY: 26,
        useAtlas: false 
    },
    15: { 
        width: 3072, height: 1536, tileCountX: 48, tileCountY: 24,
        entranceX: 24, entranceY: 10, exitX: 24, exitY: 14,
        useAtlas: false 
    },
    16: { 
        width: 1536, height: 3072, tileCountX: 24, tileCountY: 48,
        entranceX: 12, entranceY: 22, exitX: 12, exitY: 26,
        useAtlas: false 
    },
    17: { 
        width: 1536, height: 1536, tileCountX: 24, tileCountY: 24,
        entranceX: 12, entranceY: 10, exitX: 12, exitY: 14,
        useAtlas: false 
    },
    18: { 
        width: 2816, height: 2816, tileCountX: 44, tileCountY: 44,
        entranceX: 22, entranceY: 20, exitX: 22, exitY: 24,
        useAtlas: false 
    },
    19: { 
        width: 2432, height: 1920, tileCountX: 38, tileCountY: 30,
        entranceX: 19, entranceY: 13, exitX: 19, exitY: 17,
        useAtlas: false 
    },
};

// --- System State ---

class FloorSystemState {
    public currentFloorId: number = 0;
    public mapData: Uint8Array | null = null;
    public tileData: Float32Array | null = null; // For atlas rendering [tileId, isStatic, ...]
    public width: number = 0;   // in tiles
    public height: number = 0;  // in tiles
    public pixelWidth: number = 0;
    public pixelHeight: number = 0;
    public useAtlas: boolean = false;
    public isInitialized: boolean = false;
}

export const FloorSystem = new class {
    private state = new FloorSystemState();

    /**
     * Initialize a specific floor level
     */
    public init(floorId: number): void {
        const dim = FLOOR_DIMENSIONS[floorId];
        if (!dim) {
            console.error(`FloorSystem: No dimensions defined for floor ${floorId}`);
            return;
        }

        this.state.currentFloorId = floorId;
        this.state.width = dim.tileCountX;
        this.state.height = dim.tileCountY;
        this.state.pixelWidth = dim.width;
        this.state.pixelHeight = dim.height;
        this.state.useAtlas = dim.useAtlas;
        
        // Generate map data
        this.state.mapData = this.generateMapData(dim);
        this.state.tileData = this.generateTileData(dim);
        this.state.isInitialized = true;

        console.log(`FloorSystem: Initialized Floor ${floorId} (${dim.tileCountX}x${dim.tileCountY} tiles, ${dim.width}x${dim.height}px)`);
    }

    /**
     * Internal map generation logic
     */
    private generateMapData(dim: FloorDimensionConfig): Uint8Array {
        const size = dim.tileCountX * dim.tileCountY;
        const data = new Uint8Array(size);

        // Fill with default floor (passable)
        data.fill(TILE_IDS.FLOOR); 

        // Simple border walls (blocking)
        for (let x = 0; x < dim.tileCountX; x++) {
            data[x] = TILE_IDS.WALL; // Top
            data[(dim.tileCountY - 1) * dim.tileCountX + x] = TILE_IDS.WALL; // Bottom
        }
        for (let y = 0; y < dim.tileCountY; y++) {
            data[y * dim.tileCountX] = TILE_IDS.WALL; // Left
            data[y * dim.tileCountX + (dim.tileCountX - 1)] = TILE_IDS.WALL; // Right
        }

        return data;
    }

    /**
     * Generate tile data for atlas rendering
     */
    private generateTileData(dim: FloorDimensionConfig): Float32Array {
        const size = dim.tileCountX * dim.tileCountY;
        const data = new Float32Array(size * 2); // [tileId, isStatic, ...]

        if (dim.useAtlas) {
            // Floor 0 - Atlas texture
            for (let i = 0; i < size; i++) {
                data[i * 2] = TILE_IDS.ATLAS_BASE;    // Atlas tile ID
                data[i * 2 + 1] = 0;                  // isStatic = false (use variation)
            }
            
            // Place portals
            this.placePortal(data, dim.entranceX, dim.entranceY, dim.tileCountX, TILE_IDS.PORTAL_NEXT, true);
            this.placePortal(data, dim.exitX, dim.exitY, dim.tileCountX, TILE_IDS.PORTAL_PREV, true);
        } else {
            // Other floors - Chessboard pattern
            for (let row = 0; row < dim.tileCountY; row++) {
                for (let col = 0; col < dim.tileCountX; col++) {
                    const idx = row * dim.tileCountX + col;
                    data[idx * 2] = 0;      // Tile ID 0 (chessboard shader)
                    data[idx * 2 + 1] = 1;  // isStatic = true
                }
            }
            
            // Place portals on all floors
            this.placePortal(data, dim.entranceX, dim.entranceY, dim.tileCountX, TILE_IDS.PORTAL_NEXT, true);
            this.placePortal(data, dim.exitX, dim.exitY, dim.tileCountX, TILE_IDS.PORTAL_PREV, true);
        }

        return data;
    }

    private placePortal(data: Float32Array, x: number, y: number, width: number, portalId: number, isStatic: boolean): void {
        if (x >= 0 && x < this.state.width && y >= 0 && y < this.state.height) {
            const idx = (y * width + x) * 2;
            data[idx] = portalId;
            data[idx + 1] = isStatic ? 1 : 0;
        }
    }

    /**
     * Get tile ID at local coordinates
     */
    public getTile(x: number, y: number): number {
        if (!this.state.mapData || x < 0 || x >= this.state.width || y < 0 || y >= this.state.height) {
            return TILE_IDS.VOID;
        }
        return this.state.mapData[y * this.state.width + x];
    }

    /**
     * Set tile ID at local coordinates
     */
    public setTile(x: number, y: number, tileId: number): void {
        if (!this.state.mapData || x < 0 || x >= this.state.width || y < 0 || y >= this.state.height) {
            return;
        }
        this.state.mapData[y * this.state.width + x] = tileId;
    }

    /**
     * Get tile data for atlas rendering
     */
    public getTileData(col: number, row: number): { tileId: number; isStatic: number } {
        if (!this.state.tileData || col < 0 || col >= this.state.width || row < 0 || row >= this.state.height) {
            return { tileId: 0, isStatic: 1 };
        }
        const idx = (row * this.state.width + col) * 2;
        return {
            tileId: this.state.tileData[idx],
            isStatic: this.state.tileData[idx + 1]
        };
    }

    /**
     * Check if a tile is blocking (wall)
     */
    public isTileBlocking(col: number, row: number): boolean {
        if (col < 0 || col >= this.state.width || row < 0 || row >= this.state.height) {
            return true;
        }
        return this.getTile(col, row) === TILE_IDS.WALL;
    }

    /**
     * Check if a tile is walkable
     */
    public isWalkable(x: number, y: number): boolean {
        return !this.isTileBlocking(x, y);
    }

    /**
     * Get position at world coordinates
     */
    public getTileAtPosition(worldX: number, worldY: number): { col: number; row: number } {
        return {
            col: Math.floor(worldX / TILE_SIZE),
            row: Math.floor(worldY / TILE_SIZE)
        };
    }

    /**
     * Check if a world position is blocking
     */
    public isPositionBlocking(worldX: number, worldY: number): boolean {
        const { col, row } = this.getTileAtPosition(worldX, worldY);
        return this.isTileBlocking(col, row);
    }

    /**
     * Get UV coordinates for rendering based on tile ID
     */
    public getTileUV(tileId: number): { u: number; v: number } | null {
        if (tileId < TILE_IDS.ATLAS_BASE) return null;
        
        const atlasId = tileId - TILE_IDS.ATLAS_BASE;
        const col = atlasId % FLOOR_ATLAS_COLS;
        const row = Math.floor(atlasId / FLOOR_ATLAS_COLS);
        
        return {
            u: col / FLOOR_ATLAS_COLS,
            v: row / FLOOR_ATLAS_ROWS
        };
    }

    /**
     * Get tile UV size
     */
    public getTileUVSize(): { uSize: number; vSize: number } {
        return {
            uSize: 1.0 / FLOOR_ATLAS_COLS,
            vSize: 1.0 / FLOOR_ATLAS_ROWS
        };
    }

    /**
     * Get raw map data for renderer
     */
    public getMapData(): Uint8Array | null {
        return this.state.mapData;
    }

    /**
     * Get raw tile data for renderer
     */
    public getTileDataArray(): Float32Array | null {
        return this.state.tileData;
    }

    /**
     * Get current dimensions in tiles
     */
    public getDimensions(): { width: number; height: number } {
        return { width: this.state.width, height: this.state.height };
    }

    /**
     * Get current pixel dimensions
     */
    public getPixelDimensions(): { width: number; height: number } {
        return { width: this.state.pixelWidth, height: this.state.pixelHeight };
    }

    /**
     * Get current world dimensions
     */
    public getWorldWidth(): number {
        return this.state.pixelWidth;
    }

    public getWorldHeight(): number {
        return this.state.pixelHeight;
    }

    /**
     * Get current map dimensions in tiles
     */
    public getMapCols(): number {
        return this.state.width;
    }

    public getMapRows(): number {
        return this.state.height;
    }

    /**
     * Get current floor ID
     */
    public getCurrentFloorId(): number {
        return this.state.currentFloorId;
    }

    /**
     * Get the current floor data object
     */
    public getCurrentFloorData(): FloorSystemState {
        return this.state;
    }

    /**
     * Check if using atlas
     */
    public isUsingAtlas(): boolean {
        return this.state.useAtlas;
    }

    /**
     * Get total number of floors
     */
    public getFloorCount(): number {
        return Object.keys(FLOOR_DIMENSIONS).length;
    }

    /**
     * Switch to a new floor
     */
    public switchFloor(newFloorId: number): boolean {
        if (newFloorId < 0 || newFloorId >= this.getFloorCount()) {
            console.warn(`Invalid floor ID: ${newFloorId}`);
            return false;
        }
        if (newFloorId === this.state.currentFloorId) return true;
        this.init(newFloorId);
        return true;
    }
};

// Export helper functions for backwards compatibility
export const generateTestMap = () => FloorSystem.init(0);
export const getCurrentWorldWidth = () => FloorSystem.getWorldWidth();
export const getCurrentWorldHeight = () => FloorSystem.getWorldHeight();
export const getCurrentMapCols = () => FloorSystem.getMapCols();
export const getCurrentMapRows = () => FloorSystem.getMapRows();
export const getFloorCount = () => FloorSystem.getFloorCount();
export const switchFloor = (floorId: number) => FloorSystem.switchFloor(floorId);
export const getCurrentFloorId = () => FloorSystem.getCurrentFloorId();
