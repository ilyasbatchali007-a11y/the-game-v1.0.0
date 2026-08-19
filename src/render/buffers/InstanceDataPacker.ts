import { World } from '../../ecs/World';
import { PLAYER_ID } from '../../config/Constants';

/**
 * Packs entity transform data from World into a contiguous Float32Array for instanced rendering.
 * Handles both flat entities (floor) and 3D cube entities (player).
 */
export class InstanceDataPacker {
  private instanceData: Float32Array;

  constructor(maxEntities: number) {
    // 7 floats per instance: px, py, width, height, cubeHeight, rotation, elevation
    this.instanceData = new Float32Array(maxEntities * 7);
  }

  /**
   * Pack multiple flat entities for floor rendering
   */
  public packFlatEntities(world: World): Float32Array | null {
    const worldAny = world as any;
    
    if (!worldAny || !worldAny.set) return null;
    
    const count = worldAny.set.count;
    if (!count || count === 0) return null;

    const dense = worldAny.set.dense;
    if (!dense) return null;

    let offset = 0;
    for (let i = 0; i < count; i++) {
      const id = dense[i];
      this.instanceData[offset++] = worldAny.px[id];
      this.instanceData[offset++] = worldAny.py[id];
      this.instanceData[offset++] = worldAny.width[id];
      this.instanceData[offset++] = worldAny.height[id];
      this.instanceData[offset++] = 0.0; // cubeHeight = 0 for flat entities
      this.instanceData[offset++] = 0.0; // rotation = 0 for flat entities
      this.instanceData[offset++] = 0.0; // elevation = 0 for floor/flat entities
    }

    return this.instanceData.subarray(0, count * 7);
  }

  /**
   * Pack single player entity as a 3D cube
   */
  public packPlayerCube(world: World): Float32Array | null {
    const worldAny = world as any;
    
    if (!worldAny || !worldAny.active || !worldAny.active[PLAYER_ID]) return null;
    
    // Pack single player entity: px, py, width, height, cubeHeight, rotation, elevation
    const cubeHeight = (worldAny.height && worldAny.height[PLAYER_ID]) 
      ? worldAny.height[PLAYER_ID] * 2.0 
      : 64.0;
    const elevation = worldAny.z ? worldAny.z[PLAYER_ID] : 0.0;
    
    this.instanceData[0] = worldAny.px[PLAYER_ID];
    this.instanceData[1] = worldAny.py[PLAYER_ID];
    this.instanceData[2] = worldAny.width[PLAYER_ID];
    this.instanceData[3] = worldAny.height[PLAYER_ID];
    this.instanceData[4] = cubeHeight;
    this.instanceData[5] = worldAny.rotation ? worldAny.rotation[PLAYER_ID] : 0;
    this.instanceData[6] = elevation;

    return this.instanceData.subarray(0, 7);
  }

  /**
   * Pack floor quad data for single-instance rendering
   */
  public packFloorQuad(
    x: number,
    y: number,
    width: number,
    height: number
  ): Float32Array {
    this.instanceData[0] = x;
    this.instanceData[1] = y;
    this.instanceData[2] = width;
    this.instanceData[3] = height;
    this.instanceData[4] = 0.0; // cubeHeight = 0 for floor
    this.instanceData[5] = 0.0; // rotation = 0 for floor
    this.instanceData[6] = 0.0; // elevation = 0 for floor

    return this.instanceData.subarray(0, 7);
  }

  /**
   * Get raw instance data array for direct manipulation
   */
  public getData(): Float32Array {
    return this.instanceData;
  }
}
