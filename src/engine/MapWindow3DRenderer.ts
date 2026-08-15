// SRC/engine/MapWindow3DRenderer.ts
// Renders 3D models in the map window canvas using WebGL

import { OBJLoader, OBJModel } from './OBJLoader';

export class MapWindow3DRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private model: OBJModel | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private rotationY: number = 0;
  private rotationX: number = 0.3; // Slight tilt for better view
  private zoom: number = -3.0; // Camera distance
  private minZoom: number = -5.0;
  private maxZoom: number = -1.0;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl');
    if (!gl) {
      console.warn('[MapWindow3DRenderer] WebGL not supported');
      return;
    }

    this.gl = gl;

    // Set canvas size
    this.resize();

    // Create shader program
    const vsSource = `
      attribute vec3 a_position;
      attribute vec3 a_normal;
      uniform mat4 u_matrix;
      uniform mat4 u_normalMatrix;
      varying vec3 v_normal;
      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
        v_normal = (u_normalMatrix * vec4(a_normal, 0.0)).xyz;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec3 v_normal;
      uniform vec3 u_lightDir;
      uniform vec4 u_color;
      void main() {
        vec3 normal = normalize(v_normal);
        float light = max(dot(normal, u_lightDir), 0.2);
        gl_FragColor = u_color * light;
      }
    `;

    const vs = this.createShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.createShader(gl.FRAGMENT_SHADER, fsSource);
    
    if (vs && fs) {
      this.program = this.createProgram(vs, fs);
    }
    
    // Enable depth testing globally
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Setup mouse controls for rotation
    this.setupMouseControls();

    // Start animation loop
    this.isRunning = true;
    this.animate();
  }

  private setupMouseControls(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      
      this.rotationY += deltaX * 0.01;
      this.rotationX += deltaY * 0.01;
      
      // Clamp vertical rotation to avoid flipping
      this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });

    // Scroll wheel for zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomSpeed = 0.002;
      this.zoom += e.deltaY * zoomSpeed;
      this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    }, { passive: false });

    // Touch support for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Pinch to zoom
        this.lastMouseY = e.touches[0].clientY;
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const deltaX = e.touches[0].clientX - this.lastMouseX;
        const deltaY = e.touches[0].clientY - this.lastMouseY;
        
        this.rotationY += deltaX * 0.01;
        this.rotationX += deltaY * 0.01;
        
        this.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotationX));
        
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Pinch zoom
        const prevDist = this.lastMouseY;
        const currentDist = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
        const delta = prevDist - currentDist;
        
        if (prevDist > 0) {
          const zoomSpeed = 0.01;
          this.zoom += delta * zoomSpeed;
          this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
          this.lastMouseY = currentDist;
        }
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  private createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    if (!this.gl) return null;
    
    const program = this.gl.createProgram();
    if (!program) return null;
    
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program link error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }

  public async loadOBJ(url: string): Promise<void> {
    try {
      this.model = await OBJLoader.loadFromURL(url);
      console.log('[MapWindow3DRenderer] Model loaded:', this.model.vertexCount, 'vertices');
      
      if (this.gl && this.model) {
        // Create vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.vertices, this.gl.STATIC_DRAW);
        
        // Create normal buffer
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.normals, this.gl.STATIC_DRAW);
        
        // Create index buffer
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indices, this.gl.STATIC_DRAW);
      }
    } catch (error) {
      console.error('[MapWindow3DRenderer] Failed to load OBJ:', error);
    }
  }

  public resize(): void {
    if (!this.canvas || !this.gl) return;
    
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;
    
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private render(): void {
    if (!this.gl || !this.program || !this.model) return;
    
    const gl = this.gl;
    
    // Clear canvas (depth test already enabled in init)
    gl.clearColor(0.1, 0.1, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Use program
    gl.useProgram(this.program);
    
    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const normalLocation = gl.getAttribLocation(this.program, 'a_normal');
    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(this.program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(this.program, 'u_color');
    const lightDirLocation = gl.getUniformLocation(this.program, 'u_lightDir');
    
    // Enable vertex attributes
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    // Create transformation matrix with proper perspective and view
    const aspect = this.canvas.width / this.canvas.height;
    const matrix = this.createModelViewProjectionMatrix(this.rotationY, this.rotationX, aspect, this.zoom);
    const normalMatrix = this.createNormalMatrix(this.rotationY, this.rotationX);
    
    // DEBUG: Log diagnostic info to console
    console.log('=== 3D RENDER DEBUG ===');
    console.log('Zoom:', this.zoom);
    console.log('Rotation X:', this.rotationX.toFixed(2), 'Y:', this.rotationY.toFixed(2));
    console.log('Is dragging:', this.isDragging);
    console.log('Model indices:', this.model.indices.length);
    console.log('Model vertices:', this.model.vertices ? this.model.vertices.length / 3 : 'N/A');
    console.log('Canvas size:', this.canvas.width, 'x', this.canvas.height);
    console.log('Aspect ratio:', aspect);
    console.log('MVP Matrix:', JSON.stringify(Array.from(matrix)));
    console.log('Normal Matrix:', JSON.stringify(Array.from(normalMatrix)));
    
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform4f(colorLocation, 0.9, 0.75, 0.5, 1.0); // Golden brown color for dungeon
    gl.uniform3f(lightDirLocation, 0.5, 1.0, 0.3); // Light from above-right
    
    // Draw
    gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_SHORT, 0);
    
    // Auto-rotate only when not dragging (commented out to stop constant rotation)
    // if (!this.isDragging) {
    //   this.rotationY += 0.005; // Slower auto-rotation
    // }
  }

  private createModelViewProjectionMatrix(angleY: number, angleX: number, aspect: number, zoom: number): Float32Array {
    // Model rotation around Y and X axes
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    
    // The dungeon model coordinates are roughly:
    // X: -1 to 1, Y: 0 to 34 (tall), Z: -7 to 7
    // We need to center it vertically and scale appropriately
    
    const centerY = -17.0; // Center the tall dungeon vertically
    
    // Scale factors - make the dungeon fit nicely in view
    const scaleX = 0.8;
    const scaleY = 0.08;  // Compress Y since dungeon is very tall  
    const scaleZ = 0.6;
    const zOffset = zoom; // Use dynamic zoom instead of fixed -3.0
    
    // Build proper perspective projection matrix
    const fov = 60 * (Math.PI / 180);
    const near = 0.1;
    const far = 100.0;
    const f = 1.0 / Math.tan(fov / 2);
    
    // Projection matrix (column-major for WebGL)
    const proj = new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), (2 * far * near) / (near - far),
      0, 0, -1, 0
    ]);
    
    // View matrix (translate camera back and apply X rotation for tilt)
    const view = new Float32Array([
      1, 0, 0, 0,
      0, cosX, sinX, 0,
      0, -sinX, cosX, 0,
      0, 0, zOffset, 1
    ]);
    
    // Model matrix: Translate to center -> Scale -> Rotate Y
    // First translate to center the model
    const translate = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, centerY, 0, 1
    ]);
    
    // Then scale
    const scale = new Float32Array([
      scaleX, 0, 0, 0,
      0, scaleY, 0, 0,
      0, 0, scaleZ, 0,
      0, 0, 0, 1
    ]);
    
    // Then rotate around Y
    const rotY = new Float32Array([
      cosY, 0, -sinY, 0,
      0, 1, 0, 0,
      sinY, 0, cosY, 0,
      0, 0, 0, 1
    ]);
    
    // Multiply: Model = RotY * Scale * Translate
    const scaleTrans = this.multiplyMatrices(scale, translate);
    const model = this.multiplyMatrices(rotY, scaleTrans);
    
    // Multiply: MVP = P * V * M
    const vm = this.multiplyMatrices(view, model);
    return this.multiplyMatrices(proj, vm);
  }
  
  private createNormalMatrix(angleY: number, angleX: number): Float32Array {
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    
    // Normal matrix is the inverse transpose of the model-view matrix (rotation part only)
    // This is the correct inverse transpose for Y-then-X rotation
    return new Float32Array([
      cosY, sinY * sinX, sinY * cosX, 0,
      0, cosX, -sinX, 0,
      -sinY, cosY * sinX, cosY * cosX, 0,
      0, 0, 0, 1
    ]);
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }
    return result;
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
