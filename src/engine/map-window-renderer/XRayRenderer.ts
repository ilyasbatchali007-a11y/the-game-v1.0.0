// SRC/engine/map-window-renderer/XRayRenderer.ts
// Handles rendering of the X-ray marker overlay

import { XRayMarker } from '../XRayMarker';
import { MatrixCalculator } from './MatrixCalculator';
import { FocusPoint } from './MapWindowTypes';

interface BlockVertexBuffers {
  position: WebGLBuffer | null;
  index: WebGLBuffer | null;
}

export class XRayRenderer {
  private gl: WebGLRenderingContext;
  private blockVertexBuffers: BlockVertexBuffers | null = null;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }

  createBlockBuffers(xRayMarker: XRayMarker): void {
    const halfX = xRayMarker.blockSizeVector.x / 2;
    const halfY = xRayMarker.blockSizeVector.y / 2;
    const halfZ = xRayMarker.blockSizeVector.z / 2;

    const vertices = this.createCubeVertices(halfX, halfY, halfZ);
    const indices = this.createCubeIndices();

    const positionBuffer = this.gl.createBuffer();
    const indexBuffer = this.gl.createBuffer();

    if (!positionBuffer || !indexBuffer) return;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    this.blockVertexBuffers = { position: positionBuffer, index: indexBuffer };
  }

  render(
    xRayMarker: XRayMarker,
    program: WebGLProgram,
    rotationY: number,
    rotationX: number,
    aspect: number,
    zoom: number
  ): void {
    if (!xRayMarker.visible || !this.blockVertexBuffers) return;
    if (!this.blockVertexBuffers.position || !this.blockVertexBuffers.index) return;

    const gl = this.gl;

    // Save state and enable transparency
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Calculate transformation matrix
    const baseMatrix = MatrixCalculator.createMVPMatrix(
      rotationY,
      rotationX,
      aspect,
      zoom,
      xRayMarker.position
    );

    const translationMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      xRayMarker.position.x,
      xRayMarker.position.y,
      xRayMarker.position.z,
      1
    ]);

    const finalMatrix = MatrixCalculator.multiplyMatrices(baseMatrix, translationMatrix);

    // Get locations
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    const useLightingLocation = gl.getUniformLocation(program, 'u_useLighting');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    // Bind buffers and set attributes
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockVertexBuffers.position);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.blockVertexBuffers.index);

    // Set uniforms
    gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
    gl.uniform1i(useLightingLocation, 0);

    const [r, g, b, a] = xRayMarker.color;
    gl.uniform4f(colorLocation, r, g, b, a);

    // Draw
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

    // Restore state
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.uniform1i(useLightingLocation, 1);
  }

  private createCubeVertices(halfX: number, halfY: number, halfZ: number): Float32Array {
    return new Float32Array([
      // Front face
      -halfX, -halfY, halfZ,
      halfX, -halfY, halfZ,
      halfX, halfY, halfZ,
      -halfX, halfY, halfZ,
      // Back face
      -halfX, -halfY, -halfZ,
      -halfX, halfY, -halfZ,
      halfX, halfY, -halfZ,
      halfX, -halfY, -halfZ,
      // Top face
      -halfX, halfY, -halfZ,
      -halfX, halfY, halfZ,
      halfX, halfY, halfZ,
      halfX, halfY, -halfZ,
      // Bottom face
      -halfX, -halfY, -halfZ,
      halfX, -halfY, -halfZ,
      halfX, -halfY, halfZ,
      -halfX, -halfY, halfZ,
      // Right face
      halfX, -halfY, -halfZ,
      halfX, halfY, -halfZ,
      halfX, halfY, halfZ,
      halfX, -halfY, halfZ,
      // Left face
      -halfX, -halfY, -halfZ,
      -halfX, -halfY, halfZ,
      -halfX, halfY, halfZ,
      -halfX, halfY, -halfZ,
    ]);
  }

  private createCubeIndices(): Uint16Array {
    return new Uint16Array([
      0, 1, 2, 0, 2, 3, // Front
      4, 5, 6, 4, 6, 7, // Back
      8, 9, 10, 8, 10, 11, // Top
      12, 13, 14, 12, 14, 15, // Bottom
      16, 17, 18, 16, 18, 19, // Right
      20, 21, 22, 20, 22, 23, // Left
    ]);
  }
}
