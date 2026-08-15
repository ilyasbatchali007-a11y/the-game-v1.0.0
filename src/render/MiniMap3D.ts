// SRC/render/MiniMap3D.ts
// 3D Mini-map renderer using WebGL
// Loads single mesh OBJ file with 100 unit cubes representing floors
// Highlights current floor cube with X-ray glow effect and red dot indicator

import { getFloorCount } from '../config/FloorMap';

export interface CubeInstance {
  cubeIndex: number;
  x: number;
  y: number;
  z: number;
}

export class MiniMap3D {
  private gl: WebGL2RenderingContext | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private instanceBuffer: WebGLBuffer | null = null;
  
  private cubeVertices: Float32Array | null = null;
  private cubeIndices: Uint16Array | null = null;
  private cubeCount: number = 0;
  
  private currentFloorId: number = 0;
  private totalFloors: number = 100;
  
  // Uniform locations
  private uModelViewProjection: WebGLUniformLocation | null = null;
  private uColor: WebGLUniformLocation | null = null;
  private uGlowIntensity: WebGLUniformLocation | null = null;
  private uIsHighlighted: WebGLUniformLocation | null = null;
  
  // Attribute locations for instanced rendering
  private instancePosLoc: number = -1;
  private highlightLoc: number = -1;
  
  // Camera state
  private rotationX: number = Math.PI / 4; // 45 degrees
  private rotationY: number = Math.PI / 4; // 45 degrees
  private zoom: number = 150.0;
  private targetZoom: number = 150.0;
  
  // Grid layout for 100 cubes (10x10 grid)
  private gridCols: number = 10;
  private gridRows: number = 10;
  private cubeSize: number = 1.0;
  private spacing: number = 0.1;

  constructor() {}

  /**
   * Initialize the 3D mini-map renderer
   */
  public async initialize(canvas: HTMLCanvasElement): Promise<boolean> {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('[MiniMap3D] WebGL2 not supported');
      return false;
    }
    this.gl = gl;

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    } else {
      canvas.width = 200;
      canvas.height = 200;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Load and parse OBJ file
    await this.loadOBJFile('src/3d-objects/root_dungeon_single_mesh.obj');

    // Compile shaders and create program
    if (!this.createShaderProgram()) {
      return false;
    }

    // Setup geometry
    this.setupGeometry();

    // Setup instance data for all 100 cubes
    this.setupInstanceData();

    console.log('[MiniMap3D] Initialized successfully with', this.cubeCount, 'cubes');
    return true;
  }

  /**
   * Load and parse OBJ file to extract individual cubes
   */
  private async loadOBJFile(path: string): Promise<void> {
    try {
      const response = await fetch(path);
      const text = await response.text();
      this.parseOBJ(text);
    } catch (error) {
      console.error('[MiniMap3D] Failed to load OBJ file:', error);
      // Fallback: generate procedural cubes
      this.generateProceduralCubes();
    }
  }

  /**
   * Parse OBJ file content and extract cube geometry
   * The OBJ contains 100 separate cubes (each with 8 vertices and 12 faces)
   */
  private parseOBJ(objText: string): void {
    const lines = objText.split('\n');
    const vertices: [number, number, number][] = [];
    const faces: number[][] = [];
    
    let currentVertexOffset = 0;
    const cubeBoundaries: number[] = []; // Store vertex indices where each cube starts
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('v ')) {
        const parts = trimmed.split(/\s+/);
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        vertices.push([x, y, z]);
      } else if (trimmed.startsWith('f ')) {
        const parts = trimmed.split(/\s+/);
        const faceVertices = parts.slice(1).map(p => {
          // Handle vertex/texture/normal format
          const vertexIndex = parseInt(p.split('/')[0]) - 1; // OBJ uses 1-based indexing
          return vertexIndex;
        });
        faces.push(faceVertices);
        
        // Detect cube boundaries by checking if we have 12 faces (one cube)
        if (faces.length % 12 === 0) {
          cubeBoundaries.push(vertices.length);
        }
      }
    }
    
    // Calculate how many complete cubes we have
    this.cubeCount = Math.floor(faces.length / 12);
    console.log('[MiniMap3D] Parsed OBJ:', vertices.length, 'vertices,', faces.length, 'faces,', this.cubeCount, 'cubes');
    
    // If we found cubes in OBJ, use them; otherwise generate procedurally
    if (this.cubeCount > 0) {
      // Build indexed geometry for instanced rendering
      this.buildCubeGeometry(vertices, faces);
    } else {
      this.generateProceduralCubes();
    }
  }

  /**
   * Build optimized geometry from parsed OBJ data
   */
  private buildCubeGeometry(vertices: [number, number, number][], faces: number[][]): void {
    // For instanced rendering, we need a single prototype cube
    // Extract the first cube's vertices (first 8 unique vertices)
    const prototypeVertices: number[] = [];
    const seenVertices = new Set<string>();
    
    for (let i = 0; i < vertices.length && prototypeVertices.length < 24; i++) {
      const v = vertices[i];
      const key = `${v[0].toFixed(2)},${v[1].toFixed(2)},${v[2].toFixed(2)}`;
      if (!seenVertices.has(key)) {
        seenVertices.add(key);
        prototypeVertices.push(v[0], v[1], v[2]);
      }
    }
    
    // Build indices for the prototype cube (first 12 faces)
    const prototypeIndices: number[] = [];
    for (let i = 0; i < 12 && i * 3 < faces[0]?.length; i++) {
      const face = faces[i];
      if (face) {
        // Remap to prototype vertex indices
        for (const vi of face) {
          if (vi < 8) {
            prototypeIndices.push(vi);
          }
        }
      }
    }
    
    // Use standard unit cube if parsing failed
    if (prototypeVertices.length < 24) {
      this.generateProceduralCubes();
      return;
    }
    
    this.cubeVertices = new Float32Array(prototypeVertices);
    this.cubeIndices = new Uint16Array(prototypeIndices);
  }

  /**
   * Generate procedural unit cube geometry as fallback
   */
  private generateProceduralCubes(): void {
    // Unit cube centered at origin, size 1
    const s = 0.5; // half-size
    const vertices = [
      // Front face
      -s, -s,  s,   s, -s,  s,   s,  s,  s,  -s,  s,  s,
      // Back face
      -s, -s, -s,  -s,  s, -s,   s,  s, -s,   s, -s, -s,
      // Top face
      -s,  s, -s,  -s,  s,  s,   s,  s,  s,   s,  s, -s,
      // Bottom face
      -s, -s, -s,   s, -s, -s,   s, -s,  s,  -s, -s,  s,
      // Right face
       s, -s, -s,   s,  s, -s,   s,  s,  s,   s, -s,  s,
      // Left face
      -s, -s, -s,  -s, -s,  s,  -s,  s,  s,  -s,  s, -s,
    ];
    
    this.cubeVertices = new Float32Array(vertices);
    
    // Indices for 6 faces (2 triangles each)
    const indices = [
      0, 1, 2,    0, 2, 3,    // Front
      4, 5, 6,    4, 6, 7,    // Back
      8, 9, 10,   8, 10, 11,  // Top
      12, 13, 14, 12, 14, 15, // Bottom
      16, 17, 18, 16, 18, 19, // Right
      20, 21, 22, 20, 22, 23, // Left
    ];
    
    this.cubeIndices = new Uint16Array(indices);
    this.cubeCount = 100; // We'll render 100 instances
  }

  /**
   * Create shader program
   */
  private createShaderProgram(): boolean {
    if (!this.gl) return false;
    const gl = this.gl;

    const vsSource = `#version 300 es
      precision mediump float;
      
      in vec3 aPosition;
      in vec3 aInstancePos;
      in float aIsHighlighted;
      
      uniform mat4 uMVP;
      uniform float uTime;
      
      out vec3 vWorldPos;
      out float vIsHighlighted;
      out vec3 vNormal;
      
      void main() {
        vec3 worldPos = aPosition + aInstancePos;
        vWorldPos = worldPos;
        vIsHighlighted = aIsHighlighted;
        vNormal = normalize(aPosition); // Approximate normal for lighting
        
        gl_Position = uMVP * vec4(worldPos, 1.0);
      }
    `;

    const fsSource = `#version 300 es
      precision mediump float;
      
      in vec3 vWorldPos;
      in float vIsHighlighted;
      in vec3 vNormal;
      
      uniform vec3 uBaseColor;
      uniform vec3 uHighlightColor;
      uniform float uGlowIntensity;
      uniform float uTime;
      
      out vec4 fragColor;
      
      void main() {
        // Base color for non-highlighted cubes
        vec3 baseColor = uBaseColor;
        
        // Highlighted cube with X-ray glow effect
        if (vIsHighlighted > 0.5) {
          // Pulsing glow effect
          float pulse = sin(uTime * 3.0) * 0.3 + 0.7;
          vec3 glowColor = uHighlightColor * pulse;
          
          // Edge highlight for X-ray effect
          float edgeFactor = 1.0 - abs(dot(vNormal, vec3(0.577, 0.577, 0.577)));
          glowColor += vec3(1.0, 0.3, 0.3) * edgeFactor * uGlowIntensity;
          
          baseColor = glowColor;
        }
        
        // Simple lighting
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        float diff = max(dot(vNormal, lightDir), 0.3);
        
        fragColor = vec4(baseColor * diff, 1.0);
      }
    `;

    const program = this.compileProgram(vsSource, fsSource);
    if (!program) return false;

    this.program = program;
    gl.useProgram(program);

    // Get uniform locations
    this.uModelViewProjection = gl.getUniformLocation(program, 'uMVP');
    this.uColor = gl.getUniformLocation(program, 'uBaseColor');
    this.uGlowIntensity = gl.getUniformLocation(program, 'uGlowIntensity');
    this.uIsHighlighted = gl.getUniformLocation(program, 'uTime');

    return true;
  }

  /**
   * Compile vertex and fragment shaders into a program
   */
  private compileProgram(vsSource: string, fsSource: string): WebGLProgram | null {
    if (!this.gl) return null;
    const gl = this.gl;

    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!vs || !fs) return null;

    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vs));
      return null;
    }

    gl.shaderSource(fs, fsSource);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
      return null;
    }

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    return program;
  }

  /**
   * Setup vertex buffers and VAO
   */
  private setupGeometry(): void {
    if (!this.gl || !this.program || !this.cubeVertices || !this.cubeIndices) return;
    const gl = this.gl;

    // Create VAO
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);

    // Vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.cubeVertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(this.program, 'aPosition');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.cubeIndices, gl.STATIC_DRAW);
  }

  /**
   * Setup instance data buffer for all 100 cubes
   */
  private setupInstanceData(): void {
    if (!this.gl || !this.program) return;
    const gl = this.gl;

    // Generate instance positions for 10x10 grid
    const instanceData: number[] = [];
    for (let i = 0; i < this.cubeCount; i++) {
      const col = i % this.gridCols;
      const row = Math.floor(i / this.gridCols);
      
      const x = (col - this.gridCols / 2) * (this.cubeSize + this.spacing);
      const z = (row - this.gridRows / 2) * (this.cubeSize + this.spacing);
      const y = 0;
      
      instanceData.push(x, y, z); // Position (3 floats = 12 bytes)
      instanceData.push(i === this.currentFloorId ? 1.0 : 0.0); // IsHighlighted flag
    }

    this.instanceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(instanceData), gl.DYNAMIC_DRAW);

    // Instance position attribute (location 1)
    const instancePosLoc = gl.getAttribLocation(this.program, 'aInstancePos');
    gl.enableVertexAttribArray(instancePosLoc);
    gl.vertexAttribPointer(instancePosLoc, 3, gl.FLOAT, false, 16, 0);
    gl.vertexAttribDivisor(instancePosLoc, 1);

    // Instance highlight flag attribute (location 2)
    const highlightLoc = gl.getAttribLocation(this.program, 'aIsHighlighted');
    gl.enableVertexAttribArray(highlightLoc);
    gl.vertexAttribPointer(highlightLoc, 1, gl.FLOAT, false, 16, 12);
    gl.vertexAttribDivisor(highlightLoc, 1);
    
    // Store attribute locations for later use
    this.instancePosLoc = instancePosLoc;
    this.highlightLoc = highlightLoc;
  }

  /**
   * Update instance data when current floor changes
   */
  public updateInstanceData(): void {
    if (!this.gl || !this.instanceBuffer) return;
    const gl = this.gl;

    const instanceData: number[] = [];
    for (let i = 0; i < this.cubeCount; i++) {
      const col = i % this.gridCols;
      const row = Math.floor(i / this.gridCols);
      
      const x = (col - this.gridCols / 2) * (this.cubeSize + this.spacing);
      const z = (row - this.gridRows / 2) * (this.cubeSize + this.spacing);
      const y = 0;
      
      instanceData.push(x, y, z); // Position
      instanceData.push(i === this.currentFloorId ? 1.0 : 0.0); // IsHighlighted flag
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(instanceData));
  }

  /**
   * Set the current floor ID to highlight
   */
  public setCurrentFloor(floorId: number): void {
    const maxFloor = Math.min(this.cubeCount, getFloorCount());
    this.currentFloorId = Math.max(0, Math.min(floorId, maxFloor - 1));
    this.updateInstanceData();
  }

  /**
   * Get current floor ID
   */
  public getCurrentFloor(): number {
    return this.currentFloorId;
  }

  /**
   * Render the 3D mini-map
   */
  public render(time: number): void {
    if (!this.gl || !this.program || !this.vao) return;
    const gl = this.gl;

    // Clear
    gl.clearColor(0.05, 0.05, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update camera
    this.updateCamera();

    // Create MVP matrix
    const aspect = gl.canvas.width / gl.canvas.height;
    const mvpMatrix = this.createMVPMatrix(aspect, time);

    // Use program
    gl.useProgram(this.program);

    // Set uniforms
    gl.uniformMatrix4fv(this.uModelViewProjection, false, mvpMatrix);
    gl.uniform3f(this.uColor, 0.3, 0.3, 0.5); // Base cube color (bluish gray)
    gl.uniform3f(gl.getUniformLocation(this.program, 'uHighlightColor'), 1.0, 0.2, 0.2); // Red highlight
    gl.uniform1f(gl.getUniformLocation(this.program, 'uGlowIntensity'), 0.5);
    gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), time);

    // Bind VAO and draw instanced cubes
    gl.bindVertexArray(this.vao);
    
    // Ensure instance attributes are enabled before drawing
    if (this.instancePosLoc >= 0) {
      gl.enableVertexAttribArray(this.instancePosLoc);
      gl.vertexAttribPointer(this.instancePosLoc, 3, gl.FLOAT, false, 16, 0);
      gl.vertexAttribDivisor(this.instancePosLoc, 1);
    }
    if (this.highlightLoc >= 0) {
      gl.enableVertexAttribArray(this.highlightLoc);
      gl.vertexAttribPointer(this.highlightLoc, 1, gl.FLOAT, false, 16, 12);
      gl.vertexAttribDivisor(this.highlightLoc, 1);
    }
    
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.cubeIndices!.length,
      gl.UNSIGNED_SHORT,
      0,
      this.cubeCount
    );

    // Render red dot marker for current floor
    this.renderRedDotMarker(mvpMatrix, time);
  }

  /**
   * Render a red dot inside the highlighted cube
   */
  private renderRedDotMarker(mvpMatrix: Float32Array, time: number): void {
    if (!this.gl) return;
    const gl = this.gl;

    // Calculate position of current floor cube
    const col = this.currentFloorId % this.gridCols;
    const row = Math.floor(this.currentFloorId / this.gridCols);
    const x = (col - this.gridCols / 2) * (this.cubeSize + this.spacing);
    const z = (row - this.gridRows / 2) * (this.cubeSize + this.spacing);
    const y = 0.3; // Slightly above center

    // Simple point/sphere for the red dot
    const dotVertices = new Float32Array([
      0.0, 0.0, 0.0,
      0.1, 0.0, 0.0,
      0.0, 0.1, 0.0,
      -0.1, 0.0, 0.0,
      0.0, -0.1, 0.0,
      0.0, 0.0, 0.1,
      0.0, 0.0, -0.1,
    ]);

    // Create a separate VAO for the dot to avoid conflicts with instanced rendering
    const dotVAO = gl.createVertexArray();
    gl.bindVertexArray(dotVAO);

    const dotBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, dotVertices, gl.STATIC_DRAW);

    // Create simple shader for dot
    const dotVs = `#version 300 es
      precision mediump float;
      in vec3 aPosition;
      uniform mat4 uMVP;
      uniform vec3 uOffset;
      uniform float uTime;
      void main() {
        float scale = 0.15 + sin(uTime * 2.0) * 0.05;
        vec3 pos = aPosition * scale + uOffset;
        gl_Position = uMVP * vec4(pos, 1.0);
        gl_PointSize = 8.0;
      }
    `;

    const dotFs = `#version 300 es
      precision mediump float;
      out vec4 fragColor;
      void main() {
        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
      }
    `;

    const dotProgram = this.compileProgram(dotVs, dotFs);
    if (dotProgram) {
      gl.useProgram(dotProgram);
      
      // Setup VAO for dot rendering
      gl.bindVertexArray(dotVAO);
      
      const dotPosLoc = gl.getAttribLocation(dotProgram, 'aPosition');
      gl.enableVertexAttribArray(dotPosLoc);
      gl.vertexAttribPointer(dotPosLoc, 3, gl.FLOAT, false, 0, 0);
      // Disable instance divisors for non-instanced drawing
      gl.vertexAttribDivisor(dotPosLoc, 0);

      const mvpLoc = gl.getUniformLocation(dotProgram, 'uMVP');
      const offsetLoc = gl.getUniformLocation(dotProgram, 'uOffset');
      const timeLoc = gl.getUniformLocation(dotProgram, 'uTime');

      gl.uniformMatrix4fv(mvpLoc, false, mvpMatrix);
      gl.uniform3f(offsetLoc, x, y, z);
      gl.uniform1f(timeLoc, time);

      gl.drawArrays(gl.POINTS, 0, 7);

      gl.deleteProgram(dotProgram);
    }

    gl.deleteBuffer(dotBuffer);
    gl.deleteVertexArray(dotVAO);
    
    // Restore main VAO for next frame
    gl.bindVertexArray(this.vao);
  }

  /**
   * Update camera rotation and zoom
   */
  private updateCamera(): void {
    // Smooth zoom interpolation
    this.zoom += (this.targetZoom - this.zoom) * 0.1;
  }

  /**
   * Create Model-View-Projection matrix
   */
  private createMVPMatrix(aspect: number, time: number): Float32Array {
    // Slow auto-rotation
    const rotY = this.rotationY + time * 0.1;

    // Projection matrix (perspective)
    const fov = Math.PI / 4;
    const near = 0.1;
    const far = 1000.0;
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);

    const proj = new Float32Array(16);
    proj[0] = f / aspect;
    proj[5] = f;
    proj[10] = (far + near) * nf;
    proj[11] = -1;
    proj[14] = 2 * far * near * nf;

    // View matrix (camera position)
    const camX = Math.sin(rotY) * Math.cos(this.rotationX) * this.zoom;
    const camY = Math.sin(this.rotationX) * this.zoom;
    const camZ = Math.cos(rotY) * Math.cos(this.rotationX) * this.zoom;

    const view = this.lookAt(camX, camY, camZ, 0, 0, 0);

    // Model matrix (identity)
    const model = new Float32Array(16);
    model[0] = 1; model[5] = 1; model[10] = 1; model[15] = 1;

    // Multiply matrices: MVP = P * V * M
    const vp = this.multiplyMatrices(proj, view);
    const mvp = this.multiplyMatrices(vp, model);

    return mvp;
  }

  /**
   * Create lookAt matrix
   */
  private lookAt(eyeX: number, eyeY: number, eyeZ: number,
                 centerX: number, centerY: number, centerZ: number): Float32Array {
    const zx = eyeX - centerX;
    const zy = eyeY - centerY;
    const zz = eyeZ - centerZ;
    const len = Math.sqrt(zx * zx + zy * zy + zz * zz);
    const zNormX = zx / len;
    const zNormY = zy / len;
    const zNormZ = zz / len;

    const xx = -zNormY * 0 + zNormZ * 0;
    const xy = -zNormZ * 1 - zNormX * 0;
    const xz = zNormX * 0 - (-zNormY) * 1;
    const xLen = Math.sqrt(xx * xx + xy * xy + xz * xz);
    const xNormX = xx / xLen;
    const xNormY = xy / xLen;
    const xNormZ = xz / xLen;

    const yx = zNormY * xNormZ - zNormZ * xNormY;
    const yy = zNormZ * xNormX - zNormX * xNormZ;
    const yz = zNormX * xNormY - zNormY * xNormX;

    const mat = new Float32Array(16);
    mat[0] = xNormX; mat[4] = xNormY; mat[8] = xNormZ;
    mat[1] = yx; mat[5] = yy; mat[9] = yz;
    mat[2] = zNormX; mat[6] = zNormY; mat[10] = zNormZ;
    mat[3] = 0; mat[7] = 0; mat[11] = 0;
    mat[12] = -(xNormX * eyeX + xNormY * eyeY + xNormZ * eyeZ);
    mat[13] = -(yx * eyeX + yy * eyeY + yz * eyeY);
    mat[14] = -(zNormX * eyeX + zNormY * eyeY + zNormZ * eyeZ);
    mat[15] = 1;

    return mat;
  }

  /**
   * Multiply two 4x4 matrices
   */
  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i + k * 4] * b[k + j * 4];
        }
        result[i + j * 4] = sum;
      }
    }
    return result;
  }

  /**
   * Handle mouse/touch input for camera control
   */
  public handleInput(deltaX: number, deltaY: number, wheelDelta: number): void {
    this.rotationY -= deltaX * 0.01;
    this.rotationX -= deltaY * 0.01;
    this.rotationX = Math.max(0.1, Math.min(Math.PI / 2.5, this.rotationX));
    this.targetZoom += wheelDelta * 0.5;
    this.targetZoom = Math.max(50, Math.min(300, this.targetZoom));
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.gl) {
      if (this.vao) this.gl.deleteVertexArray(this.vao);
      if (this.vertexBuffer) this.gl.deleteBuffer(this.vertexBuffer);
      if (this.indexBuffer) this.gl.deleteBuffer(this.indexBuffer);
      if (this.instanceBuffer) this.gl.deleteBuffer(this.instanceBuffer);
      if (this.program) this.gl.deleteProgram(this.program);
    }
  }
}
