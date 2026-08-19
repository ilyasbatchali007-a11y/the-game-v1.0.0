// SRC/engine/map-renderer/BlockDrawer.ts
// Handles drawing blocks with indexed geometry

import { BlockTriangleRange } from '../types/MapBlockTypes';

export class BlockDrawer {
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  public drawTriangles(indexBuffer: WebGLBuffer | null, count: number, offset: number = 0): void {
    if (!indexBuffer) return;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, count, this.gl.UNSIGNED_SHORT, offset * 2);
  }

  public drawVisibleBlocks(
    indexBuffer: WebGLBuffer | null,
    triangleRanges: BlockTriangleRange[],
    visibilityMap: boolean[]
  ): void {
    if (!indexBuffer || triangleRanges.length === 0) return;

    for (let i = 0; i < triangleRanges.length; i++) {
      if (visibilityMap[i]) {
        const range = triangleRanges[i];
        this.drawTriangles(indexBuffer, range.count, range.start);
      }
    }
  }

  public drawFullModel(indexBuffer: WebGLBuffer | null, indexCount: number): void {
    if (!indexBuffer) return;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.drawElements(this.gl.TRIANGLES, indexCount, this.gl.UNSIGNED_SHORT, 0);
  }
}
