/**
 * Manages VAO and buffer setup for instanced cube rendering
 * Handles static cube geometry (36 vertices for 6 faces) and instance attribute binding
 */

export interface CubeGeometryBuffers {
  vao: WebGLVertexArrayObject;
  cubeBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
}

/**
 * Creates static cube vertex data (6 faces × 6 vertices each = 36 vertices)
 * Each vertex: x, y, z (local [0..1]), faceId packed into vec4
 * Face IDs: 0=Top, 1=Front-Right, 2=Front-Left, 3=Back-Right, 4=Back-Left, 5=Bottom
 */
export function createCubeVertexData(): Float32Array {
  return new Float32Array([
    // Top face (faceId=0) - CCW when viewed from above
    0, 0, 1, 0,   1, 0, 1, 0,   0, 1, 1, 0,
    0, 1, 1, 0,   1, 0, 1, 0,   1, 1, 1, 0,
    
    // Front-Right face (faceId=1) - CCW when viewed from front-right
    1, 0, 0, 1,   1, 1, 0, 1,   1, 0, 1, 1,
    1, 0, 1, 1,   1, 1, 0, 1,   1, 1, 1, 1,
    
    // Front-Left face (faceId=2) - CCW when viewed from front-left
    0, 0, 0, 2,   0, 0, 1, 2,   0, 1, 0, 2,
    0, 1, 0, 2,   0, 0, 1, 2,   0, 1, 1, 2,
    
    // Back-Right face (faceId=3) - CCW when viewed from back-right
    1, 1, 0, 3,   1, 1, 1, 3,   0, 1, 0, 3,
    0, 1, 0, 3,   1, 1, 1, 3,   0, 1, 1, 3,
    
    // Back-Left face (faceId=4) - CCW when viewed from back-left
    0, 1, 0, 4,   0, 1, 1, 4,   0, 0, 0, 4,
    0, 0, 0, 4,   0, 1, 1, 4,   0, 0, 1, 4,
    
    // Bottom face (faceId=5) - CCW when viewed from below
    0, 0, 0, 5,   0, 1, 0, 5,   1, 0, 0, 5,
    1, 0, 0, 5,   0, 1, 0, 5,   1, 1, 0, 5,
  ]);
}

/**
 * Creates cube VAO with all instance attributes bound
 * Stride: 7 floats × 4 bytes = 28 bytes per instance
 */
export function createCubeVAO(
  gl: WebGL2RenderingContext,
  cubeBuffer: WebGLBuffer,
  instanceBuffer: WebGLBuffer
): WebGLVertexArrayObject {
  const cubeVAO = gl.createVertexArray();
  if (!cubeVAO) throw new Error('Failed to create cube VAO');
  
  gl.bindVertexArray(cubeVAO);
  
  // Bind cube buffer for attribute 0 (vertex position + faceId)
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
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
  
  // Attribute 3: Height (cube height/z-scale)
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 28, 16);
  gl.vertexAttribDivisor(3, 1);
  
  // Attribute 4: Rotation
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4, 1, gl.FLOAT, false, 28, 20);
  gl.vertexAttribDivisor(4, 1);
  
  // Attribute 5: Elevation offset for jump rendering
  gl.enableVertexAttribArray(5);
  gl.vertexAttribPointer(5, 1, gl.FLOAT, false, 28, 24);
  gl.vertexAttribDivisor(5, 1);
  
  gl.bindVertexArray(null);
  
  return cubeVAO;
}

/**
 * Creates complete cube geometry buffers (VAO + cube buffer + instance buffer)
 */
export function createCubeGeometryBuffers(
  gl: WebGL2RenderingContext,
  maxInstances: number = 1
): CubeGeometryBuffers {
  // Create cube vertex buffer
  const cubeVertices = createCubeVertexData();
  const cubeBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
  
  // Create instance buffer
  const instanceBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, maxInstances * 28, gl.DYNAMIC_DRAW);
  
  // Create VAO with all bindings
  const vao = createCubeVAO(gl, cubeBuffer, instanceBuffer);
  
  return { vao, cubeBuffer, instanceBuffer };
}
