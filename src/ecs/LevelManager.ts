import { Entity } from './Entity';
import { Player } from './Player';

export interface FloorConfig {
  id: number;
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
}

export class LevelManager {
  private floors: FloorConfig[] = [];
  private currentFloorId: number = 0;
  private worldWidth: number = 0;
  private worldHeight: number = 0;

  constructor() {
    this.generateFloors();
  }

  private generateFloors() {
    // Generate 10 floors with randomized but fixed sizes for demonstration
    for (let i = 0; i < 10; i++) {
      const width = 10 + Math.floor(Math.random() * 10); // 10-20 tiles wide
      const height = 10 + Math.floor(Math.random() * 10); // 10-20 tiles tall
      
      this.floors.push({
        id: i,
        width,
        height,
        spawnX: Math.floor(width / 2),
        spawnY: Math.floor(height / 2)
      });
    }
    
    // Set initial world bounds to the first floor
    this.updateWorldBounds(this.floors[0]);
  }

  public getFloor(id: number): FloorConfig | undefined {
    return this.floors.find(f => f.id === id);
  }

  public getCurrentFloor(): FloorConfig {
    return this.floors[this.currentFloorId];
  }

  public changeFloor(direction: number): number {
    const newId = this.currentFloorId + direction;
    
    if (newId >= 0 && newId < this.floors.length) {
      this.currentFloorId = newId;
      const newFloor = this.floors[newId];
      this.updateWorldBounds(newFloor);
      console.log(`Transitioned to Floor ${newId} (${newFloor.width}x${newFloor.height})`);
      return newId;
    }
    return this.currentFloorId;
  }

  private updateWorldBounds(floor: FloorConfig) {
    this.worldWidth = floor.width;
    this.worldHeight = floor.height;
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

  // Simulate loading floor data (tiles, entities)
  public async loadFloorData(floorId: number): Promise<void> {
    // In a real scenario, this would fetch JSON from Tiled
    // For now, we simulate a tiny delay for "loading" feel if needed
    return Promise.resolve();
  }
}
