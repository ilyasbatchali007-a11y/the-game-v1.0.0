// SRC/engine/map-renderer/BlockVertexBufferManager.ts
// Manages WebGL buffers for block geometry (X-ray marker)

import { createCubeVertices, createCubeIndices } from '../CubeBufferFactory';

export class BlockVertexBufferManager {
  private positionBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private gl: WebGLRenderingContext | null = null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public createBuffers(blockSizeVector: { x: number; y: number; z: number }): void {
    if (!this.gl) return;

    const halfX = blockSizeVector.x / 2;
    const halfY = blockSizeVector.y / 2;
    const halfZ = blockSizeVector.z / 2;

    const vertices = createCubeVertices(halfX, halfY, halfZ);
    const indices = createCubeIndices();

    this.positionBuffer = this.gl.createBuffer();
    this.indexBuffer = this.gl.createBuffer();

    if (!this.positionBuffer || !this.indexBuffer) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
  }

  public bindBuffers(): void {
    if (!this.gl || !this.positionBuffer || !this.indexBuffer) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  public getIndexBuffer(): WebGLBuffer | null {
    return this.indexBuffer;
  }

  public getPositionBuffer(): WebGLBuffer | null {
    return this.positionBuffer;
  }

  public destroy(): void {
    if (!this.gl) return;
    if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);
    if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
    this.positionBuffer = null;
    this.indexBuffer = null;
  }
}
