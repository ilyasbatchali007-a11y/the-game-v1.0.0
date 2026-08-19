/**
 * Manages VAO and buffer setup for instanced floor rendering
 * Handles static floor quad geometry (6 vertices) and instance attribute binding
 */

export interface FloorGeometryBuffers {
  vao: WebGLVertexArrayObject;
  floorBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
}

/**
 * Creates static floor quad vertex data (6 vertices for single quad covering [0,0] to [1,1])
 * Each vertex: x, y, z=0, faceId=0 packed into vec4
 */
export function createFloorVertexData(): Float32Array {
  return new Float32Array([
    // Single quad covering [0,0] to [1,1]
    0, 0, 0, 0,   1, 0, 0, 0,   0, 1, 0, 0,
    0, 1, 0, 0,   1, 0, 0, 0,   1, 1, 0, 0,
  ]);
}

/**
 * Creates floor VAO with all instance attributes bound
 * Stride: 7 floats × 4 bytes = 28 bytes per instance
 */
export function createFloorVAO(
  gl: WebGL2RenderingContext,
  floorBuffer: WebGLBuffer,
  instanceBuffer: WebGLBuffer
): WebGLVertexArrayObject {
  const floorVAO = gl.createVertexArray();
  if (!floorVAO) throw new Error('Failed to create floor VAO');
  
  gl.bindVertexArray(floorVAO);
  
  // Bind floor buffer for attribute 0
  gl.bindBuffer(gl.ARRAY_BUFFER, floorBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
  
  // Attribute 1: Position (px, py)
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 28, 0);
  gl.vertexAttribDivisor(1, 1);
  
  // Attribute 2: Size (width, height)
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 28, 8);
  gl.vertexAttribDivisor(2, 1);
  
  // Attribute 3: Height (not used for floor, but set up)
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 28, 16);
  gl.vertexAttribDivisor(3, 1);
  
  // Attribute 4: Rotation (unused for floor, defaults to 0)
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 28, 20);
  gl.vertexAttribDivisor(4, 1);
  
  // Attribute 5: Elevation offset (unused for floor, defaults to 0)
  gl.enableVertexAttribArray(5);
  gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 28, 24);
  gl.vertexAttribDivisor(5, 1);
  
  gl.bindVertexArray(null);
  
  return floorVAO;
}

/**
 * Creates complete floor geometry buffers (VAO + floor buffer + instance buffer)
 */
export function createFloorGeometryBuffers(
  gl: WebGL2RenderingContext,
  maxInstances: number = 1
): FloorGeometryBuffers {
  // Create floor vertex buffer
  const floorVertices = createFloorVertexData();
  const floorBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, floorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);
  
  // Create instance buffer
  const instanceBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, maxInstances * 28, gl.DYNAMIC_DRAW);
  
  // Create VAO with all bindings
  const vao = createFloorVAO(gl, floorBuffer, instanceBuffer);
  
  return { vao, floorBuffer, instanceBuffer };
}
