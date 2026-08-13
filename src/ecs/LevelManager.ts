import { FLOORS, FloorConfig } from '../config/FloorMap';

export interface FloorData extends FloorConfig {
  spawnX: number;
  spawnY: number;
}

export class LevelManager {
  private floors: FloorData[] = [];
  private currentFloorId: number = 0;
  private worldWidth: number = 0;
  private worldHeight: number = 0;

  constructor() {
    this.generateFloors();
  }

  private generateFloors() {
    // Convert FLOORS config to extended format with spawn points
    for (let i = 0; i < FLOORS.length; i++) {
      const floor = FLOORS[i];
      const tileSize = floor.tileSize || 64;
      const widthTiles = Math.floor(floor.width / tileSize);
      const heightTiles = Math.floor(floor.depth / tileSize);
      
      const centerX = Math.floor(widthTiles / 2);
      const centerY = Math.floor(heightTiles / 2);
      
      this.floors.push({
        ...floor,
        spawnX: centerX,
        spawnY: centerY
      });
    }
    
    // Set initial world bounds to the first floor
    this.updateWorldBounds(this.floors[0]);
  }

  public getFloor(id: number): FloorData | undefined {
    return this.floors.find(f => f.id === id);
  }

  public getCurrentFloor(): FloorData {
    return this.floors[this.currentFloorId];
  }

  public changeFloor(direction: number): number {
    const newId = this.currentFloorId + direction;
    
    if (newId >= 0 && newId < this.floors.length) {
      this.currentFloorId = newId;
      const newFloor = this.floors[newId];
      this.updateWorldBounds(newFloor);
      console.log(`Transitioned to Floor ${newId} (${newFloor.width}x${newFloor.depth})`);
      return newId;
    }
    return this.currentFloorId;
  }

  private updateWorldBounds(floor: FloorData) {
    this.worldWidth = floor.width;
    this.worldHeight = floor.depth;
  }

  public getWidth(): number {
    return this.worldWidth;
  }

  public getHeight(): number {
    return this.worldHeight;
  }

  public getSpawnPoint(): { x: number, y: number } {
    const floor = this.getCurrentFloor();
    return { x: floor.spawnX, y: floor.spawnY };
  }

  public async loadFloorData(floorId: number): Promise<void> {
    return Promise.resolve();
  }
}
