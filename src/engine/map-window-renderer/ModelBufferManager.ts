// SRC/engine/map-window-renderer/ModelBufferManager.ts
// Manages WebGL buffers for 3D models - handles creation, binding, and coordinate calculations

import { OBJModel } from '../OBJLoader';
import { MapBlock } from '../types/MapBlockTypes';

interface ModelBuffers {
  vertex: WebGLBuffer | null;
  normal: WebGLBuffer | null;
  index: WebGLBuffer | null;
}

export class ModelBufferManager {
  private gl: WebGLRenderingContext;
  private model: OBJModel | null = null;
  private buffers: ModelBuffers = { vertex: null, normal: null, index: null };

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public loadModel(model: OBJModel): void {
    this.model = model;
    this.createBuffers();
  }

  public hasModel(): boolean {
    return this.model !== null;
  }

  public getModel(): OBJModel | null {
    return this.model;
  }

  public getBuffers(): ModelBuffers {
    return this.buffers;
  }

  private createBuffers(): void {
    if (!this.gl || !this.model) return;

    this.buffers.vertex = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertex);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.vertices, this.gl.STATIC_DRAW);

    this.buffers.normal = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.normals, this.gl.STATIC_DRAW);

    this.buffers.index = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indices, this.gl.STATIC_DRAW);
  }

  public calculateGridCoordinates(blocks: MapBlock[]): { x: number; y: number; z: number }[] {
    if (!this.model || !this.model.originalBounds || !this.model.scaleFactor) {
      console.error('[ModelBufferManager] Model not initialized for coordinate calculation');
      return [];
    }

    const originalBounds = this.model.originalBounds;
    const scale = this.model.scaleFactor;
    const centerX = (originalBounds.minX + originalBounds.maxX) / 2;
    const centerY = (originalBounds.minY + originalBounds.maxY) / 2;
    const centerZ = (originalBounds.minZ + originalBounds.maxZ) / 2;

    return blocks.map(block => ({
      x: (block.position.x - centerX) * scale,
      y: (block.position.y - centerY) * scale,
      z: (block.position.z - centerZ) * scale
    }));
  }

  public getBlockSizeVector(block: MapBlock): [number, number, number] {
    if (!this.model || !this.model.scaleFactor) {
      return [1, 1, 1];
    }

    const scale = this.model.scaleFactor;
    const sf = 0.9;
    return [
      block.size.x * scale * sf,
      block.size.y * scale * sf,
      block.size.z * scale * sf
    ];
  }
}
