// SRC/engine/MapWindow3DRenderer.ts
// Renders 3D models in the map window canvas using WebGL

import { OBJLoader, OBJModel } from './OBJLoader';

export interface BlockPosition {
  x: number;
  y: number;
  z: number;
}

export class GlowingBlock {
  position: BlockPosition;
  blockSize: number;
  color: [number, number, number, number];
  visible: boolean;

  constructor(blockSize: number = 0.1) {
    this.position = { x: 0, y: 0, z: 0 };
    this.blockSize = blockSize;
    this.color = [0.0, 1.0, 0.0, 0.9]; // Bright Green with high alpha for visibility
    this.visible = false;
  }

  setPosition(x: number, y: number, z: number): void {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  moveUp(steps: number = 1): void {
    this.position.y += steps * this.blockSize;
  }

  moveDown(steps: number = 1): void {
    this.position.y -= steps * this.blockSize;
  }

  setColor(r: number, g: number, b: number, a: number = 0.8): void {
    this.color = [r, g, b, a];
  }

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }
}

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
  private zoom: number = -1.80; // Camera distance
  private readonly STATIC_ZOOM: number = -1.80;
  private minZoom: number = -20.0; // Allow extreme close-up for debugging
  private maxZoom: number = 5.0; // Allow far view for debugging
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private isDragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;
  
  // Glowing block for X-ray visualization
  private glowingBlock: GlowingBlock | null = null;
  private blockVertexBuffers: { position: WebGLBuffer | null, index: WebGLBuffer | null } | null = null;
  
  // Model bounds for positioning the glowing block
  private modelBounds: { minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number } | null = null;
  
  // Grid detection for automated spatial mapping
  private gridSize: { x: number, y: number, z: number } = { x: 2.0, y: 2.0, z: 2.0 };
  private gridDimensions: { nx: number, ny: number, nz: number } = { nx: 0, ny: 0, nz: 0 };
  private gridCoordinates: BlockPosition[] = [];
  private currentGridIndex: number = 0;
  private lastGridMoveTime: number = 0;
  private readonly GRID_MOVE_INTERVAL: number = 500; // ms between moves

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

    // Add window resize listener to handle dynamic resizing
    window.addEventListener('resize', () => {
      this.resize();
    });

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
      uniform bool u_useLighting;
      void main() {
        if (u_useLighting) {
          vec3 normal = normalize(v_normal);
          float light = max(dot(normal, u_lightDir), 0.2);
          gl_FragColor = u_color * light;
        } else {
          // Emissive mode - no lighting, pure glow
          gl_FragColor = u_color;
        }
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

    // Initialize glowing block system
    this.initGlowingBlock();

    // Start animation loop
    this.isRunning = true;
    this.animate();
  }

  private initGlowingBlock(): void {
    // Initialize with default size, will be updated after grid detection
    this.glowingBlock = new GlowingBlock(2.0);
    this.createBlockBuffers();
    // Show the block by default so it's visible
    this.glowingBlock.show();
    
    // Set initial position
    if (this.glowingBlock) {
      this.glowingBlock.setPosition(0, 0, 0);
    }
  }

  /**
   * Calculate the bounding box of the loaded model and detect grid size
   */
  private calculateModelBounds(): void {
    if (!this.model || this.model.vertices.length === 0) {
      this.modelBounds = null;
      return;
    }

    const verts = this.model.vertices;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < verts.length; i += 3) {
      const x = verts[i];
      const y = verts[i + 1];
      const z = verts[i + 2];
      
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    this.modelBounds = { minX, maxX, minY, maxY, minZ, maxZ };
    console.log(`[MapWindow3DRenderer] Model bounds calculated: Y[${minY.toFixed(2)}, ${maxY.toFixed(2)}], X[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Z[${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`);
    
    // Detect grid step size from vertices (O(V log V) algorithm)
    this.detectGridStepSize();
    
    // Calculate grid dimensions and coordinates (also sets block size)
    this.calculateGridDimensions();
  }

  /**
   * Plan 1: Autodetect Step Size using O(V log V) sorting algorithm.
   * Avoids O(V^2) pairwise comparison. Uses tolerance clustering for float precision.
   */
  private detectGridStepSize(): void {
    if (!this.model || this.model.vertices.length === 0) {
      this.gridSize = { x: 2.0, y: 2.0, z: 2.0 };
      return;
    }

    const vertices = this.model.vertices;
    const tolerance = 0.15; // Tolerance for grouping similar distances (handles 1.999 vs 2.001)

    // Helper: Extract unique sorted coordinates for an axis
    const getSortedUniqueCoords = (offset: number): number[] => {
      const coords = new Set<number>();
      for (let i = offset; i < vertices.length; i += 3) {
        coords.add(parseFloat(vertices[i].toFixed(3))); // Quick clean
      }
      return Array.from(coords).sort((a, b) => a - b);
    };

    // Helper: Calculate median step size from sorted coordinates
    const calculateMedianStep = (coords: number[]): number => {
      if (coords.length < 2) return 0;
      
      const steps: number[] = [];
      for (let i = 1; i < coords.length; i++) {
        const diff = coords[i] - coords[i - 1];
        if (diff > tolerance) {
          steps.push(diff);
        }
      }

      if (steps.length === 0) return 0;

      // Sort steps to find median (robust against outliers)
      steps.sort((a, b) => a - b);
      const medianIndex = Math.floor(steps.length / 2);
      return steps[medianIndex];
    };

    const xCoords = getSortedUniqueCoords(0);
    const yCoords = getSortedUniqueCoords(1);
    const zCoords = getSortedUniqueCoords(2);

    let stepX = calculateMedianStep(xCoords);
    let stepY = calculateMedianStep(yCoords);
    let stepZ = calculateMedianStep(zCoords);

    // Fallback only if detection completely fails (e.g., single point)
    const defaultStep = 2.0;
    this.gridSize = {
      x: stepX > 0 ? stepX : defaultStep,
      y: stepY > 0 ? stepY : defaultStep,
      z: stepZ > 0 ? stepZ : defaultStep
    };

    console.log(`[MapWindow3DRenderer] Detected grid steps (O(V log V)): Δx=${this.gridSize.x.toFixed(2)}, Δy=${this.gridSize.y.toFixed(2)}, Δz=${this.gridSize.z.toFixed(2)}`);
  }

  /**
   * Plan 1: Calculate Grid Dimensions and Populate Coordinate Targets
   * Uses detected steps to define Nx, Ny, Nz and generates center points.
   * Traversal order: Y -> Z -> X for predictable scanline movement.
   * Also sets the glowing block size dynamically.
   */
  private calculateGridDimensions(): void {
    if (!this.modelBounds) return;

    const { minX, maxX, minY, maxY, minZ, maxZ } = this.modelBounds;
    
    // Calculate counts based on bounds and steps, ensuring at least 1
    const nx = Math.max(1, Math.round((maxX - minX) / this.gridSize.x) + 1);
    const ny = Math.max(1, Math.round((maxY - minY) / this.gridSize.y) + 1);
    const nz = Math.max(1, Math.round((maxZ - minZ) / this.gridSize.z) + 1);

    this.gridDimensions = { nx, ny, nz };

    // Dynamic Scaling: Set block size to 90% of the smallest detected step
    const minStep = Math.min(this.gridSize.x, this.gridSize.y, this.gridSize.z);
    const newBlockSize = minStep * 0.9;
    
    // Only rebuild buffers if size changed significantly to save performance
    if (this.glowingBlock && Math.abs(newBlockSize - this.glowingBlock.blockSize) > 0.01) {
      this.glowingBlock.blockSize = newBlockSize;
      this.createBlockBuffers(); 
      console.log(`[MapWindow3DRenderer] Block size set to: ${newBlockSize.toFixed(2)}`);
    }

    // Generate Coordinate Targets (Order: Y -> Z -> X for predictable scanline movement)
    this.gridCoordinates = [];
    
    for (let y = 0; y < ny; y++) {
      for (let z = 0; z < nz; z++) {
        for (let x = 0; x < nx; x++) {
          this.gridCoordinates.push({
            x: minX + (x * this.gridSize.x),
            y: minY + (y * this.gridSize.y),
            z: minZ + (z * this.gridSize.z)
          });
        }
      }
    }

    console.log(`[MapWindow3DRenderer] Grid dimensions: ${nx} x ${ny} x ${nz} (Total Points: ${this.gridCoordinates.length})`);
    
    // Reset animation to start
    this.currentGridIndex = 0;
    if (this.gridCoordinates.length > 0) {
      this.updateGlowingBlockPosition(this.gridCoordinates[0]);
    }
  }

  /**
   * Position the glowing block at the lowest point of the model
   */
  private positionGlowingBlockAtLowest(): void {
    if (!this.glowingBlock || !this.modelBounds) return;
    
    // Position at the center X/Z and lowest Y of the model bounds
    const centerX = (this.modelBounds.minX + this.modelBounds.maxX) / 2;
    const centerZ = (this.modelBounds.minZ + this.modelBounds.maxZ) / 2;
    const lowestY = this.modelBounds.minY;
    
    this.glowingBlock.setPosition(centerX, lowestY, centerZ);
  }

  /**
   * Public method to start/stop grid animation
   */
  public toggleGridAnimation(enabled: boolean): void {
    if (enabled) {
      this.currentGridIndex = 0;
      this.lastGridMoveTime = Date.now();
      console.log('[MapWindow3DRenderer] Grid animation started');
    } else {
      console.log('[MapWindow3DRenderer] Grid animation stopped');
    }
  }

  /**
   * Public method to manually move to next grid position
   */
  public moveToNextGridPosition(): void {
    if (this.gridCoordinates.length === 0 || !this.glowingBlock) return;
    
    if (this.currentGridIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentGridIndex];
      this.glowingBlock.setPosition(pos.x, pos.y, pos.z);
      this.currentGridIndex++;
      console.log(`[MapWindow3DRenderer] Manual grid step ${this.currentGridIndex}/${this.gridCoordinates.length}`);
    } else {
      this.currentGridIndex = 0;
    }
  }

  private createBlockBuffers(): void {
    if (!this.gl) return;

    // Use default size, but this will be overridden by calculateModelBounds() after model loads
    const blockSize = this.glowingBlock ? this.glowingBlock.blockSize : 0.1;
    const half = blockSize / 2;

    // Create a cube mesh (8 vertices, 6 faces * 2 triangles * 3 vertices = 36 indices)
    const vertices = new Float32Array([
      // Front face
      -half, -half,  half,
       half, -half,  half,
       half,  half,  half,
      -half,  half,  half,
      // Back face
      -half, -half, -half,
      -half,  half, -half,
       half,  half, -half,
       half, -half, -half,
    ]);

    const indices = new Uint16Array([
      // Front
      0, 1, 2, 0, 2, 3,
      // Back
      4, 5, 6, 4, 6, 7,
      // Top
      3, 2, 6, 3, 6, 5,
      // Bottom
      0, 7, 1, 0, 4, 7,
      // Right
      1, 7, 6, 1, 6, 2,
      // Left
      0, 5, 4, 0, 3, 5,
    ]);

    // Create position buffer
    const positionBuffer = this.gl.createBuffer();
    if (!positionBuffer) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

    // Create index buffer
    const indexBuffer = this.gl.createBuffer();
    if (!indexBuffer) return;
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

    this.blockVertexBuffers = {
      position: positionBuffer,
      index: indexBuffer
    };
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
      const delta = e.deltaY > 0 ? 0.5 : -0.5;
      this.zoom = Math.max(-20.0, Math.min(5.0, this.zoom + delta));
      this.render();
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
    if (!shader) {
      this.logBug('[BUG] Failed to create shader object');
      return null;
    }
    
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const errorLog = this.gl.getShaderInfoLog(shader);
      this.logBug(`[BUG] Shader compile error: ${errorLog}`);
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  private createProgram(vs: WebGLShader, fs: WebGLShader): WebGLProgram | null {
    if (!this.gl) return null;
    
    const program = this.gl.createProgram();
    if (!program) {
      this.logBug('[BUG] Failed to create program object');
      return null;
    }
    
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const errorLog = this.gl.getProgramInfoLog(program);
      this.logBug(`[BUG] Program link error: ${errorLog}`);
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
        // The OBJLoader already normalizes the model, so we use the data directly
        console.log('[MapWindow3DRenderer] Using pre-normalized model data');
        
        // Calculate model bounds for positioning the glowing block
        this.calculateModelBounds();
        
        // Create vertex buffer
        this.vertexBuffer = this.gl.createBuffer();
        if (!this.vertexBuffer) {
          this.logBug('[BUG] Failed to create vertex buffer');
          return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.vertices, this.gl.STATIC_DRAW);
        
        // Check for buffer errors
        if (this.gl.getError() !== this.gl.NO_ERROR) {
          this.logBug('[BUG] Error setting vertex buffer data');
        }
        
        // Create normal buffer
        this.normalBuffer = this.gl.createBuffer();
        if (!this.normalBuffer) {
          this.logBug('[BUG] Failed to create normal buffer');
          return;
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.normals, this.gl.STATIC_DRAW);
        
        // Create index buffer
        this.indexBuffer = this.gl.createBuffer();
        if (!this.indexBuffer) {
          this.logBug('[BUG] Failed to create index buffer');
          return;
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indices, this.gl.STATIC_DRAW);
        
        console.log(`[MapWindow3DRenderer] Buffers created: ${this.model.vertexCount} vertices`);
      }
    } catch (error) {
      this.logBug(`[BUG] Failed to load OBJ: ${error}`);
      console.error('[MapWindow3DRenderer] Failed to load OBJ:', error);
    }
  }

  // Public API for glowing block control
  public getGlowingBlock(): GlowingBlock | null {
    return this.glowingBlock;
  }

  public moveGlowingBlockUp(steps: number = 1): void {
    if (this.glowingBlock) {
      this.glowingBlock.moveUp(steps);
      console.log(`[MapWindow3DRenderer] Glowing block moved UP ${steps} step(s), new Y: ${this.glowingBlock.position.y.toFixed(2)}`);
    }
  }

  public moveGlowingBlockDown(steps: number = 1): void {
    if (this.glowingBlock) {
      this.glowingBlock.moveDown(steps);
      console.log(`[MapWindow3DRenderer] Glowing block moved DOWN ${steps} step(s), new Y: ${this.glowingBlock.position.y.toFixed(2)}`);
    }
  }

  public setGlowingBlockPosition(x: number, y: number, z: number): void {
    if (this.glowingBlock) {
      this.glowingBlock.setPosition(x, y, z);
      console.log(`[MapWindow3DRenderer] Glowing block positioned to (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    }
  }

  public showGlowingBlock(): void {
    if (this.glowingBlock) {
      this.glowingBlock.show();
      console.log('[MapWindow3DRenderer] Glowing block shown');
    }
  }

  public hideGlowingBlock(): void {
    if (this.glowingBlock) {
      this.glowingBlock.hide();
      console.log('[MapWindow3DRenderer] Glowing block hidden');
    }
  }

  public setGlowingBlockColor(r: number, g: number, b: number, a: number = 0.8): void {
    if (this.glowingBlock) {
      this.glowingBlock.setColor(r, g, b, a);
      console.log(`[MapWindow3DRenderer] Glowing block color set to RGBA(${r}, ${g}, ${b}, ${a})`);
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
    
    // Update glowing block position in grid animation loop
    this.updateGlowingBlockAnimation();
    
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Animate the glowing block moving through all grid coordinates
   */
  private updateGlowingBlockAnimation(): void {
    if (!this.glowingBlock || this.gridCoordinates.length === 0) return;
    
    const now = Date.now();
    if (now - this.lastGridMoveTime < this.GRID_MOVE_INTERVAL) return;
    
    this.lastGridMoveTime = now;
    
    // Move to next grid coordinate
    if (this.currentGridIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentGridIndex];
      this.glowingBlock.setPosition(pos.x, pos.y, pos.z);
      this.currentGridIndex++;
      
      console.log(`[MapWindow3DRenderer] Grid step ${this.currentGridIndex}/${this.gridCoordinates.length}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
    } else {
      // Reset to start when done
      this.currentGridIndex = 0;
      console.log('[MapWindow3DRenderer] Grid scan complete, restarting...');
    }
  }

  private lastLogState = {
    zoom: 0,
    rotX: 0,
    rotY: 0,
    isDragging: false,
    width: 0,
    height: 0,
    vertexCount: 0,
    indexCount: 0,
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 }
  };

  private logFrameCount = 0;
  
  /**
   * Centralized bug logging method - all bug reports go through this
   */
  private logBug(message: string): void {
    console.error(`[3D BUG] ${message}`);
  }

  private logDebugInfo(): void {
    this.logFrameCount++;
    
    // Calculate bounds if we have vertices
    let bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
    if (this.model && this.model.vertices.length > 0) {
      const verts = this.model.vertices;
      for (let i = 0; i < verts.length; i += 3) {
        const x = verts[i];
        const y = verts[i + 1];
        const z = verts[i + 2];
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
        if (z < bounds.minZ) bounds.minZ = z;
        if (z > bounds.maxZ) bounds.maxZ = z;
      }
    } else {
      bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    }

    const stateChanged = 
      Math.abs(this.zoom - this.lastLogState.zoom) > 0.01 ||
      Math.abs(this.rotationX - this.lastLogState.rotX) > 0.01 ||
      Math.abs(this.rotationY - this.lastLogState.rotY) > 0.01 ||
      this.isDragging !== this.lastLogState.isDragging ||
      this.canvas.width !== this.lastLogState.width ||
      this.canvas.height !== this.lastLogState.height ||
      (this.model && (this.model.vertices.length !== this.lastLogState.vertexCount || this.model.indices.length !== this.lastLogState.indexCount)) ||
      JSON.stringify(bounds) !== JSON.stringify(this.lastLogState.bounds);

    if (!stateChanged && this.logFrameCount % 60 !== 0) {
      return; // Skip logging if nothing changed, unless it's been 60 frames
    }

    if (this.logFrameCount === 1 || stateChanged) {
      console.groupCollapsed('=== 3D RENDER STATE ===');
      console.log(`Frame: ${this.logFrameCount} | Zoom: ${this.zoom.toFixed(2)} | Rot(X:${this.rotationX.toFixed(2)}, Y:${this.rotationY.toFixed(2)}) | Dragging: ${this.isDragging}`);
      console.log(`Canvas: ${this.canvas.width}x${this.canvas.height} | Aspect: ${(this.canvas.width / this.canvas.height).toFixed(2)}`);
      
      if (this.model) {
        console.log(`Model: ${this.model.indices.length} indices, ${this.model.vertices.length / 3} vertices`);
        console.log(`Vertex Bounds -> X:[${bounds.minX.toFixed(2)}, ${bounds.maxX.toFixed(2)}] Y:[${bounds.minY.toFixed(2)}, ${bounds.maxY.toFixed(2)}] Z:[${bounds.minZ.toFixed(2)}, ${bounds.maxZ.toFixed(2)}]`);
        
        // Check for extreme aspect ratios in bounds which indicate deformation
        const spanX = bounds.maxX - bounds.minX;
        const spanY = bounds.maxY - bounds.minY;
        const spanZ = bounds.maxZ - bounds.minZ;
        if (spanX > 0 && spanY > 0 && spanZ > 0) {
          const ratioXY = spanX / spanY;
          const ratioXZ = spanX / spanZ;
          if (ratioXY > 10 || ratioXY < 0.1 || ratioXZ > 10 || ratioXZ < 0.1) {
            console.warn(`⚠️ POTENTIAL DEFORMATION: Extreme axis ratio detected! X/Y: ${ratioXY.toFixed(2)}, X/Z: ${ratioXZ.toFixed(2)}`);
          }
        }
      }

      // Only log matrices on significant changes or first frame to avoid spam
      if (this.logFrameCount === 1 || stateChanged) {
        // Create pure projection matrix for debugging (separate from MVP)
        const fov = 60 * (Math.PI / 180);
        const aspect = this.canvas.width / this.canvas.height;
        const near = 0.1;
        const far = 100.0;
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        
        const pureProj = new Float32Array([
          f / aspect, 0, 0, 0,
          0, f, 0, 0,
          0, 0, (far + near) * nf, -1,
          0, 0, (2 * far * near) * nf, 0
        ]);
        
        console.log('Pure Projection Matrix (before MVP):');
        for (let i = 0; i < 16; i += 4) {
          const row = Array.from(pureProj).slice(i, i + 4).map(n => n.toFixed(4));
          console.log(`  [ ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]} ]`);
        }
        
        // Calculate actual FOV from pure projection matrix element [5] which should be 'f'
        const actualFovRad = 2 * Math.atan(1.0 / pureProj[5]);
        const actualFovDeg = (actualFovRad * 180 / Math.PI).toFixed(1);
        console.log(`Projection Params: FOV=${actualFovDeg}°, Aspect=${aspect.toFixed(2)}, Near=${near}, Far=${far}`);
        
        // Also show combined MVP for reference (without focus point for debug)
        const mvpMatrix = this.createModelViewProjectionMatrix(this.rotationY, this.rotationX, aspect, this.zoom, { x: 0, y: 0, z: 0 });
        console.log('Combined MVP Matrix (Model*View*Projection):');
        for (let i = 0; i < 16; i += 4) {
          const row = Array.from(mvpMatrix).slice(i, i + 4).map(n => n.toFixed(4));
          console.log(`  [ ${row[0]}, ${row[1]}, ${row[2]}, ${row[3]} ]`);
        }
      }
      console.groupEnd();
    }

    // Update last state
    this.lastLogState = {
      zoom: this.zoom,
      rotX: this.rotationX,
      rotY: this.rotationY,
      isDragging: this.isDragging,
      width: this.canvas.width,
      height: this.canvas.height,
      vertexCount: this.model ? this.model.vertices.length : 0,
      indexCount: this.model ? this.model.indices.length : 0,
      bounds: bounds
    };
  }

  private render(): void {
    if (!this.gl || !this.program || !this.model) return;
    
    const gl = this.gl;
    
    // Determine zoom focus point (glowing block if visible, otherwise model center)
    let focusPoint = { x: 0, y: 0, z: 0 };
    if (this.glowingBlock && this.glowingBlock.visible && this.glowingBlock.position) {
      focusPoint = this.glowingBlock.position;
    }
    
    // Clear canvas (depth test already enabled in init)
    gl.clearColor(0.1, 0.1, 0.12, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Check for clear errors
    const clearError = gl.getError();
    if (clearError !== gl.NO_ERROR) {
      this.logBug(`[BUG] Error clearing buffer: ${clearError}`);
    }
    
    // Use program
    gl.useProgram(this.program);
    
    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const normalLocation = gl.getAttribLocation(this.program, 'a_normal');
    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(this.program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(this.program, 'u_color');
    const lightDirLocation = gl.getUniformLocation(this.program, 'u_lightDir');
    const useLightingLocation = gl.getUniformLocation(this.program, 'u_useLighting');
    
    // Check for location errors
    if (positionLocation < 0 || normalLocation < 0) {
      this.logBug('[BUG] Failed to get attribute locations');
    }
    if (!matrixLocation || !normalMatrixLocation || !colorLocation || !lightDirLocation || !useLightingLocation) {
      this.logBug('[BUG] Failed to get uniform locations');
    }
    
    // Enable vertex attributes
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    
    // Create transformation matrix with proper perspective and view, focused on glowing block
    const aspect = this.canvas.width / this.canvas.height;
    const matrix = this.createModelViewProjectionMatrix(this.rotationY, this.rotationX, aspect, this.zoom, focusPoint);
    const normalMatrix = this.createNormalMatrix(this.rotationY, this.rotationX);
    
    // Check for NaN/Infinity in matrices
    if (matrix.some(v => isNaN(v) || !isFinite(v))) {
      this.logBug('[BUG] MVP Matrix contains NaN or Infinity values!');
    }
    if (normalMatrix.some(v => isNaN(v) || !isFinite(v))) {
      this.logBug('[BUG] Normal Matrix contains NaN or Infinity values!');
    }
    
    // DEBUG: Log diagnostic info to console (consolidated)
    this.logDebugInfo();
    
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform4f(colorLocation, 0.9, 0.75, 0.5, 1.0); // Golden brown color for dungeon
    gl.uniform3f(lightDirLocation, 0.5, 1.0, 0.3); // Light from above-right
    gl.uniform1i(useLightingLocation, 1); // Enable lighting for main model
    
    // Check for uniform errors
    const uniformError = gl.getError();
    if (uniformError !== gl.NO_ERROR) {
      this.logBug(`[BUG] Error setting uniforms: ${uniformError}`);
    }
    
    // Draw the main 3D model
    gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_SHORT, 0);
    
    // Check for draw errors
    const drawError = gl.getError();
    if (drawError !== gl.NO_ERROR) {
      this.logBug(`[BUG] Error during draw call: ${drawError}`);
    }
    
    // Render glowing block if visible (X-ray mode)
    this.renderGlowingBlock(matrixLocation, useLightingLocation);
    
    // Auto-rotate only when not dragging (commented out to stop constant rotation)
    // if (!this.isDragging) {
    //   this.rotationY += 0.005; // Slower auto-rotation
    // }
  }

  private renderGlowingBlock(matrixLocation: WebGLUniformLocation | null, useLightingLocation: WebGLUniformLocation | null): void {
    if (!this.gl || !this.glowingBlock || !this.glowingBlock.visible || !this.blockVertexBuffers || !matrixLocation || !useLightingLocation) return;
    
    const gl = this.gl;
    
    // Recreate block buffers with current size (in case it changed)
    this.createBlockBuffers();
    
    // Disable depth testing AND depth writing for true X-ray effect
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); // Additive blending for glow effect
    
    // Get block position and apply same transformation as main model (focused on block itself)
    const aspect = this.canvas.width / this.canvas.height;
    const baseMatrix = this.createModelViewProjectionMatrix(this.rotationY, this.rotationX, aspect, this.zoom, this.glowingBlock.position);
    
    // Create translation matrix for block position
    const tx = this.glowingBlock.position.x;
    const ty = this.glowingBlock.position.y;
    const tz = this.glowingBlock.position.z;
    
    const translationMatrix = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    ]);
    
    // Combine matrices: final = baseMatrix * translationMatrix
    const finalMatrix = this.multiplyMatrices(baseMatrix, translationMatrix);
    
    // Bind block buffers
    if (this.blockVertexBuffers.position) {
      const positionLocation = gl.getAttribLocation(this.program!, 'a_position');
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.blockVertexBuffers.position);
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    }
    
    if (this.blockVertexBuffers.index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.blockVertexBuffers.index);
    }
    
    // Set transformation matrix
    gl.uniformMatrix4fv(matrixLocation, false, finalMatrix);
    
    // Disable lighting for emissive glow effect
    gl.uniform1i(useLightingLocation, 0);
    
    // Set glowing color (emissive - no lighting)
    const colorLocation = gl.getUniformLocation(this.program!, 'u_color');
    const [r, g, b, a] = this.glowingBlock.color;
    gl.uniform4f(colorLocation, r, g, b, a);
    
    // Draw block (18 triangles = 36 indices for a cube)
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    
    // Restore state
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.uniform1i(useLightingLocation, 1); // Restore lighting for next frame
    
    // Restore original matrix for next frame
    gl.uniformMatrix4fv(matrixLocation, false, baseMatrix);
  }

  private createModelViewProjectionMatrix(angleY: number, angleX: number, aspect: number, zoom: number, focusPoint?: { x: number, y: number, z: number }): Float32Array {
    // Default focus point if not provided
    const fp = focusPoint || { x: 0, y: 0, z: 0 };
    
    // Model rotation around Y and X axes
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    
    // The dungeon model coordinates are roughly:
    // X: -1 to 1, Y: 0 to 34 (tall), Z: -7 to 7
    // We need to center it vertically and scale appropriately
    
    const centerY = -17.0; // Center the tall dungeon vertically
    
    // Scale factors - UNIFORM scaling to preserve proportions
    // The model is already normalized to fit within -0.8 to 0.8 in OBJLoader
    const uniformScale = 1.0; // Use 1:1 scale since normalization already handled sizing
    const scaleX = uniformScale;
    const scaleY = uniformScale;  // Fixed: was 0.08, causing vertical flattening
    const scaleZ = uniformScale;
    const zOffset = zoom; // Use dynamic zoom instead of fixed -3.0
    
    // Build proper perspective projection matrix
    const fov = 60 * (Math.PI / 180);
    const near = 0.1;
    const far = 100.0;
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    
    // [3D BUG DETECTOR] Projection Matrix Calculation Check
    const projZ = (far + near) * nf;
    const projW = (2 * far * near) * nf;
    
    if (!isFinite(projZ) || !isFinite(projW)) {
      console.error('[3D BUG] Invalid projection matrix values! Check near/far planes.');
      console.error(`[3D BUG] near=${near}, far=${far}, nf=${nf}`);
      console.error(`[3D BUG] Calculated: projZ=${projZ}, projW=${projW}`);
    }
    
    // Projection matrix (column-major for WebGL) - Standard Perspective
    // [ f/aspect, 0, 0, 0 ]
    // [ 0, f, 0, 0 ]
    // [ 0, 0, (far+near)*nf, -1 ]
    // [ 0, 0, (2*far*near)*nf, 0 ]
    const proj = new Float32Array([
      f / aspect, 0, 0, 0,          // Column 0
      0, f, 0, 0,                   // Column 1
      0, 0, projZ, -1,              // Column 2
      0, 0, projW, 0                // Column 3
    ]);
    
    // View matrix - translate camera back along Z axis AND translate to focus point
    // Camera position is (0, 0, -zoom) because zoom is negative (e.g., -3 means camera at z=3)
    // View matrix translates world by -cameraPos, so we use -(-zoom) = zoom? No.
    // If zoom = -3, we want camera at z=3. View matrix translates by -3.
    // So we put -3 in the translation slot (index 14). 
    // But zoom IS -3. So we just use zoom directly? 
    // Wait, standard view matrix for camera at (0,0,cz) has translation -cz in column 3.
    // We want camera at z = -zoom (since zoom=-3, camera at 3).
    // Translation = -(-zoom) = zoom. Yes, index 14 = zoom is correct IF zoom is the negation of camera Z.
    // Let's verify: zoom=-3 -> camera at z=3 -> translate world by -3. Index 14 = -3. Correct.
    
    // Apply focus point translation - translate world so focus point is at origin
    // Reverted to center on mesh (0,0,0) instead of glowing block
    const view = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, zoom, 1  // Centered on mesh origin
    ]);
    
    // Model matrix: Scale -> Rotate X -> Rotate Y
    // The model is already centered and normalized by OBJLoader
    
    // Scale
    const scale = new Float32Array([
      scaleX, 0, 0, 0,
      0, scaleY, 0, 0,
      0, 0, scaleZ, 0,
      0, 0, 0, 1
    ]);
    
    // Then rotate around X axis (tilt)
    const rotX = new Float32Array([
      1, 0, 0, 0,
      0, cosX, sinX, 0,
      0, -sinX, cosX, 0,
      0, 0, 0, 1
    ]);
    
    // Then rotate around Y axis (spin)
    const rotY = new Float32Array([
      cosY, 0, -sinY, 0,
      0, 1, 0, 0,
      sinY, 0, cosY, 0,
      0, 0, 0, 1
    ]);
    
    // Multiply: Model = RotY * RotX * Scale
    const temp1 = this.multiplyMatrices(rotX, scale);
    const model = this.multiplyMatrices(rotY, temp1);
    
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
    // For RotY * RotX, the normal matrix is RotX^T * RotY^T
    // RotX^T = [1,0,0; 0,cosX,-sinX; 0,sinX,cosX]
    // RotY^T = [cosY,0,sinY; 0,1,0; -sinY,0,cosY]
    // NormalMatrix = RotX^T * RotY^T
    return new Float32Array([
      cosY, 0, -sinY, 0,
      sinY * sinX, cosX, cosY * sinX, 0,
      sinY * cosX, -sinX, cosY * cosX, 0,
      0, 0, 0, 1
    ]);
  }

  private multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    // Standard column-major multiplication for WebGL
    // Result[i][j] = sum(A[k][j] * B[i][k])
    // In 1D array: result[col*4 + row] = sum(a[col*4 + k] * b[k*4 + row])
    // Wait, that's wrong. Let's use standard formula:
    // C[i][j] = sum_k(A[i][k] * B[k][j])
    // Column-major storage: index = col*4 + row
    // So A[colA][rowA] is at a[colA*4 + rowA]
    // C[colC][rowC] = sum_k( A[colA=k][rowC] * B[colC][rowB=k] )
    //               = sum_k( a[k*4 + rowC] * b[colC*4 + k] )
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[k * 4 + row] * b[col * 4 + k];
        }
        result[col * 4 + row] = sum;
      }
    }
    return result;
  }
  
  /**
   * [3D BUG DETECTOR] Check if matrix has extreme values that indicate errors
   */
  private hasExtremeValues(matrix: Float32Array, threshold: number = 100): boolean {
    for (let i = 0; i < 16; i++) {
      const val = matrix[i];
      if (!isFinite(val) || Math.abs(val) > threshold) {
        return true;
      }
    }
    return false;
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
