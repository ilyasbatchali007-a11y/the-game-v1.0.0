// SRC/ecs/World.ts

import { MAX_ENTITIES } from "../config/Constants";
import { LevelManager } from "./LevelManager";

export class World {
  public maxEntities: number;
  public levelManager: LevelManager;
  
  // Legacy array names for compatibility
  public active: Uint8Array;
  public x: Float32Array;
  public y: Float32Array;
  public vx: Float32Array;
  public vy: Float32Array;
  public w: Float32Array;
  public h: Float32Array;
  public speed: Float32Array;
  public health: Float32Array;
  public deadFlag: Uint8Array;
  public rotation: Float32Array;
  public z: Float32Array;
  public vz: Float32Array;
  public grounded: Uint8Array;
  
  // Aliases for renderer compatibility
  public px: Float32Array;
  public py: Float32Array;
  public width: Float32Array;
  public height: Float32Array;
  public set: { count: number; dense: number[] };

  constructor(maxEntities: number = MAX_ENTITIES) {
    this.maxEntities = maxEntities;
    this.levelManager = new LevelManager();
    this.active = new Uint8Array(maxEntities);
    this.x = new Float32Array(maxEntities);
    this.y = new Float32Array(maxEntities);
    this.vx = new Float32Array(maxEntities);
    this.vy = new Float32Array(maxEntities);
    this.w = new Float32Array(maxEntities);
    this.h = new Float32Array(maxEntities);
    this.speed = new Float32Array(maxEntities);
    this.health = new Float32Array(maxEntities);
    this.deadFlag = new Uint8Array(maxEntities);
    this.rotation = new Float32Array(maxEntities);
    this.z = new Float32Array(maxEntities);
    this.vz = new Float32Array(maxEntities);
    this.grounded = new Uint8Array(maxEntities);
    
    // Create aliases pointing to same buffers
    this.px = this.x;
    this.py = this.y;
    this.width = this.w;
    this.height = this.h;
    
    // Simple sparse set implementation
    this.set = {
      count: 0,
      dense: [] as number[]
    };
  }

  public addEntity(px: number, py: number, w: number, h: number, health: number): number {
    const id = this.set.count;
    if (id >= this.maxEntities) {
      throw new Error('Maximum entities reached');
    }
    
    this.active[id] = 1;
    this.x[id] = px;
    this.y[id] = py;
    this.w[id] = w;
    this.h[id] = h;
    this.health[id] = health;
    this.vx[id] = 0;
    this.vy[id] = 0;
    this.deadFlag[id] = 0;
    
    this.set.dense.push(id);
    this.set.count++;
    
    return id;
  }

  public getWidth(): number {
    return this.levelManager.getWidth();
  }

  public getHeight(): number {
    return this.levelManager.getHeight();
  }

  public changeFloor(direction: number): number {
    return this.levelManager.changeFloor(direction);
  }

  public getCurrentFloorId(): number {
    return this.levelManager.getCurrentFloor().id;
  }

  public getSpawnPoint(): { x: number, y: number } {
    return this.levelManager.getSpawnPoint();
  }
}