// SRC/engine/map-renderer/MapModelManager.ts
// Manages 3D model loading, bounds calculation, and buffer creation

import { OBJLoader, OBJModel } from '../OBJLoader';
import { calculateModelBounds } from '../ModelBoundsCalculator';
import { MapBlock, BlockPosition } from '../types/MapBlockTypes';

export class MapModelManager {
  private model: OBJModel | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private gl: WebGLRenderingContext | null = null;
  private modelBounds: { minY: number; maxY: number } | null = null;
  private gridCoordinates: BlockPosition[] = [];
  private blockTriangleRanges: { start: number; count: number }[] = [];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public getModel(): OBJModel | null {
    return this.model;
  }

  public async loadFromURL(url: string): Promise<void> {
    try {
      this.model = await OBJLoader.loadFromURL(url);
      console.log('[MapModelManager] Model loaded:', this.model.vertexCount, 'vertices');
      if (this.gl && this.model) {
        this.calculateModelBoundsInternal();
        this.createBuffersFromModel();
      }
    } catch (error) {
      console.error('[MapModelManager] Failed to load OBJ:', error);
    }
  }

  public loadModel(model: OBJModel): void {
    try {
      this.model = model;
      console.log('[MapModelManager] Model loaded:', this.model.vertexCount, 'vertices');
      if (this.gl && this.model) {
        this.calculateModelBoundsInternal();
        this.createBuffersFromModel();
      }
    } catch (error) {
      console.error('[MapModelManager] Failed to load model:', error);
    }
  }

  private calculateModelBoundsInternal(): void {
    if (!this.model || !this.model.vertices || this.model.vertices.length === 0) {
      console.error("[MapModelManager] Cannot calculate bounds on empty mesh.");
      this.modelBounds = null;
      return;
    }
    const bounds = calculateModelBounds(this.model.vertices);
    this.modelBounds = bounds ? { minY: bounds.minY, maxY: bounds.maxY } : null;
    if (this.modelBounds) {
      console.log(`[MapModelManager] Model bounds: Y[${this.modelBounds.minY.toFixed(2)}, ${this.modelBounds.maxY.toFixed(2)}]`);
    }
  }

  private createBuffersFromModel(): void {
    if (!this.gl || !this.model) return;

    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.vertices, this.gl.STATIC_DRAW);

    this.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.normals, this.gl.STATIC_DRAW);

    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indices, this.gl.STATIC_DRAW);
  }

  public setMapBlocks(blocks: MapBlock[]): void {
    console.log('[SETUP: PRE-FUSION BLOCK METADATA] setMapBlocks()');
    if (!this.model || !this.model.originalBounds || !this.model.scaleFactor) {
      console.error('[MapModelManager] Model not initialized');
      return;
    }

    const originalBounds = this.model.originalBounds;
    const scale = this.model.scaleFactor;
    const centerX = (originalBounds.minX + originalBounds.maxX) / 2;
    const centerY = (originalBounds.minY + originalBounds.maxY) / 2;
    const centerZ = (originalBounds.minZ + originalBounds.maxZ) / 2;

    console.log(`[MapModelManager] Converting ${blocks.length} blocks to normalized space`);

    this.gridCoordinates = blocks.map(block => ({
      x: (block.position.x - centerX) * scale,
      y: (block.position.y - centerY) * scale,
      z: (block.position.z - centerZ) * scale
    }));

    // Process triangle ranges
    if (this.model.blockTriangleRanges?.length === blocks.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges;
    } else if (this.model.blockTriangleRanges?.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges.slice(0, blocks.length);
    } else {
      this.blockTriangleRanges = blocks.map((_, i) => ({ start: i * 36, count: 36 }));
    }

    console.log(`[MapModelManager] Grid populated with ${this.gridCoordinates.length} blocks`);
  }

  public getGridCoordinates(): BlockPosition[] {
    return [...this.gridCoordinates];
  }

  public getBlockTriangleRanges(): { start: number; count: number }[] {
    return [...this.blockTriangleRanges];
  }

  public getModelBounds(): { minY: number; maxY: number } | null {
    return this.modelBounds;
  }

  public getVertexBuffer(): WebGLBuffer | null {
    return this.vertexBuffer;
  }

  public getNormalBuffer(): WebGLBuffer | null {
    return this.normalBuffer;
  }

  public getIndexBuffer(): WebGLBuffer | null {
    return this.indexBuffer;
  }

  public destroy(): void {
    if (!this.gl) return;
    if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
    if (this.normalBuffer) this.gl.deleteBuffer(this.normalBuffer);
    if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
    this.vertexBuffer = null;
    this.normalBuffer = null;
    this.indexBuffer = null;
  }
}
