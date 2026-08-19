/**
 * Manages VAO (Vertex Array Object) setup for instanced rendering.
 * Configures vertex attribute pointers for both static geometry and instance data.
 */
export class InstancedVAOManager {
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
  }

  /**
   * Create VAO for floor rendering (single quad with instance attributes)
   * Attribute layout:
   * - loc 0: vertex (x, y, z, faceId) from floor buffer
   * - loc 1-5: instance data (pos, size, height, rotation, elevation) from instance buffer
   */
  public createFloorVAO(
    floorBuffer: WebGLBuffer,
    instanceBuffer: WebGLBuffer,
    stride: number = 28 // 7 floats × 4 bytes
  ): WebGLVertexArrayObject {
    const vao = this.gl.createVertexArray();
    if (!vao) throw new Error('Failed to create floor VAO');

    this.gl.bindVertexArray(vao);

    // Bind floor buffer for attribute 0 (vertex: x, y, z, faceId)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, floorBuffer);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 16, 0);

    // Bind instance buffer for attributes 1-5
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, instanceBuffer);

    // Attribute 1: Position (px, py) - 2 floats
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.vertexAttribDivisor(1, 1);

    // Attribute 2: Size (width, height) - 2 floats
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 8);
    this.gl.vertexAttribDivisor(2, 1);

    // Attribute 3: Height (cubeHeight) - 1 float
    this.gl.enableVertexAttribArray(3);
    this.gl.vertexAttribPointer(3, 1, this.gl.FLOAT, false, stride, 16);
    this.gl.vertexAttribDivisor(3, 1);

    // Attribute 4: Rotation - 1 float
    this.gl.enableVertexAttribArray(4);
    this.gl.vertexAttribPointer(4, 1, this.gl.FLOAT, false, stride, 20);
    this.gl.vertexAttribDivisor(4, 1);

    // Attribute 5: Elevation - 1 float
    this.gl.enableVertexAttribArray(5);
    this.gl.vertexAttribPointer(5, 1, this.gl.FLOAT, false, stride, 24);
    this.gl.vertexAttribDivisor(5, 1);

    this.gl.bindVertexArray(null);

    return vao;
  }

  /**
   * Create VAO for cube rendering (36 vertices with instance attributes)
   * Same instance attribute layout as floor VAO
   */
  public createCubeVAO(
    cubeBuffer: WebGLBuffer,
    instanceBuffer: WebGLBuffer,
    stride: number = 28 // 7 floats × 4 bytes
  ): WebGLVertexArrayObject {
    const vao = this.gl.createVertexArray();
    if (!vao) throw new Error('Failed to create cube VAO');

    this.gl.bindVertexArray(vao);

    // Bind cube buffer for attribute 0 (vertex: x, y, z, faceId)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cubeBuffer);
    this.gl.enableVertexAttribArray(0);
    this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 16, 0);

    // Bind instance buffer for attributes 1-5
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, instanceBuffer);

    // Attribute 1: Position (px, py) - 2 floats
    this.gl.enableVertexAttribArray(1);
    this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, stride, 0);
    this.gl.vertexAttribDivisor(1, 1);

    // Attribute 2: Size (width, height) - 2 floats
    this.gl.enableVertexAttribArray(2);
    this.gl.vertexAttribPointer(2, 2, this.gl.FLOAT, false, stride, 8);
    this.gl.vertexAttribDivisor(2, 1);

    // Attribute 3: Height (cubeHeight) - 1 float
    this.gl.enableVertexAttribArray(3);
    this.gl.vertexAttribPointer(3, 1, this.gl.FLOAT, false, stride, 16);
    this.gl.vertexAttribDivisor(3, 1);

    // Attribute 4: Rotation - 1 float
    this.gl.enableVertexAttribArray(4);
    this.gl.vertexAttribPointer(4, 1, this.gl.FLOAT, false, stride, 20);
    this.gl.vertexAttribDivisor(4, 1);

    // Attribute 5: Elevation - 1 float
    this.gl.enableVertexAttribArray(5);
    this.gl.vertexAttribPointer(5, 1, this.gl.FLOAT, false, stride, 24);
    this.gl.vertexAttribDivisor(5, 1);

    this.gl.bindVertexArray(null);

    return vao;
  }

  /**
   * Delete VAOs when no longer needed
   */
  public disposeVAO(vao: WebGLVertexArrayObject): void {
    this.gl.deleteVertexArray(vao);
  }
}
