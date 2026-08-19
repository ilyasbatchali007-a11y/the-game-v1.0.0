/**
 * Creates and manages static geometry buffers for WebGL instanced rendering.
 * Provides pre-built cube and floor quad vertex data.
 */
export class StaticGeometryFactory {
  /**
   * Create cube geometry buffer (36 vertices: 6 faces × 2 triangles × 3 vertices)
   * Each vertex: x, y, z (local [0..1]), faceId (float) packed into vec4
   * Face IDs: 0=Top, 1=Front-Right, 2=Front-Left, 3=Back-Right, 4=Back-Left, 5=Bottom
   */
  public static createCubeBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const cubeVertices = new Float32Array([
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

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create cube buffer');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    
    return buffer;
  }

  /**
   * Create floor quad buffer (6 vertices for a single quad covering [0,0] to [1,1])
   * Each vertex: x, y, z=0, faceId=0 packed into vec4
   */
  public static createFloorQuadBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const floorVertices = new Float32Array([
      // Single quad covering [0,0] to [1,1]
      0, 0, 0, 0,   1, 0, 0, 0,   0, 1, 0, 0,
      0, 1, 0, 0,   1, 0, 0, 0,   1, 1, 0, 0,
    ]);

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create floor buffer');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, floorVertices, gl.STATIC_DRAW);
    
    return buffer;
  }

  /**
   * Create dynamic instance buffer with initial allocation
   */
  public static createInstanceBuffer(
    gl: WebGL2RenderingContext,
    maxInstances: number,
    floatsPerInstance: number = 7
  ): WebGLBuffer {
    const bufferSize = maxInstances * floatsPerInstance * 4; // 4 bytes per float
    
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create instance buffer');
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferSize, gl.DYNAMIC_DRAW);
    
    return buffer;
  }
}
