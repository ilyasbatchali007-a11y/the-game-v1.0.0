// SRC/engine/map-window-renderer/MainModelRenderer.ts
// Handles rendering of the main 3D model (dungeon blocks)

import { BlockTriangleRange } from './MapWindowTypes';
import { createMVPMatrix, createNormalMatrix, hasExtremeValues } from './MatrixCalculator';

export class MainModelRenderer {
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  render(
    program: WebGLProgram,
    vertexBuffer: WebGLBuffer | null,
    normalBuffer: WebGLBuffer | null,
    indexBuffer: WebGLBuffer | null,
    triangleRanges: BlockTriangleRange[],
    visibility: boolean[],
    matrixLocation: WebGLUniformLocation | null,
    normalMatrixLocation: WebGLUniformLocation | null,
    colorLocation: WebGLUniformLocation | null,
    lightDirLocation: WebGLUniformLocation | null,
    useLightingLocation: WebGLUniformLocation | null,
    rotationY: number,
    rotationX: number,
    aspect: number,
    zoom: number,
    focusPoint: { x: number; y: number; z: number }
  ): void {
    const gl = this.gl;

    // Set up vertex attributes
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normal');

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Calculate matrices
    const matrix = createMVPMatrix(rotationY, rotationX, aspect, zoom, focusPoint);
    const normalMatrix = createNormalMatrix(rotationY, rotationX);

    if (hasExtremeValues(matrix)) {
      console.error('[MainModelRenderer] MVP Matrix contains invalid values!');
    }

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform4f(colorLocation, 0.5, 0.5, 0.5, 1.0);
    gl.uniform3f(lightDirLocation, 0.5, 1.0, 0.3);
    gl.uniform1i(useLightingLocation, 1);

    // Draw visible blocks
    if (triangleRanges.length > 0) {
      for (let i = 0; i < triangleRanges.length; i++) {
        if (visibility[i]) {
          const range = triangleRanges[i];
          gl.drawElements(gl.TRIANGLES, range.count, gl.UNSIGNED_SHORT, range.start * 2);
        }
      }
    } else {
      gl.drawElements(gl.TRIANGLES, 36000, gl.UNSIGNED_SHORT, 0);
    }
  }
}
