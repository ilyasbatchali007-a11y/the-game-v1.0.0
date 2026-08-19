// SRC/engine/MapWindow3DRenderer.ts
// Main orchestrator for 3D map rendering - coordinates all subsystems

import { OBJLoader, OBJModel } from './OBJLoader';
import { FogOfWarTracker } from './FogOfWarTracker';
import { XRayMarker } from './XRayMarker';
import { BlockPosition, MapBlock, BlockTriangleRange, ModelBounds } from './types/MapBlockTypes';
import { WebGLShaderManager, MapRendererShaders } from './WebGLShaderManager';
import { createCubeVertices, createCubeIndices } from './CubeBufferFactory';
import { calculateModelBounds } from './ModelBoundsCalculator';
import { createMVPMatrix, createNormalMatrix, multiplyMatrices, hasExtremeValues } from './MatrixMathUtils';
import { MapInputHandler, MapCameraState } from './MapInputHandler';

export type { BlockPosition, MapBlock };

/**
 * Main orchestrator for 3D dungeon map rendering
 * Coordinates shader management, input handling, fog of war, and X-ray visualization
 */
export class MapWindow3DRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private model: OBJModel | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private indexBuffer: WebGLBuffer | null = null;
  private rotationY: number = 0;
  private rotationX: number = 0.3;
  private zoom: number = -1.80;
  private readonly minZoom: number = -20.0;
  private readonly maxZoom: number = 5.0;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private shaderManager: WebGLShaderManager | null = null;
  private inputHandler: MapInputHandler | null = null;
  private xRayMarker: XRayMarker | null = null;
  private blockVertexBuffers: { position: WebGLBuffer | null, index: WebGLBuffer | null } | null = null;
  private modelBounds: ModelBounds | null = null;
  private gridCoordinates: BlockPosition[] = [];
  private currentGridIndex: number = 0;
  private lastGridMoveTime: number = 0;
  private readonly GRID_MOVE_INTERVAL: number = 1000;
  private fogOfWar: FogOfWarTracker | null = null;
  private blockVisibility: boolean[] = [];
  private blockTriangleRanges: BlockTriangleRange[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl');
    if (!gl) { console.warn('[MapWindow3DRenderer] WebGL not supported'); return; }
    this.gl = gl;
    this.shaderManager = new WebGLShaderManager(gl);
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.program = this.shaderManager.createProgramFromSource(MapRendererShaders.vertex, MapRendererShaders.fragment);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    this.inputHandler = new MapInputHandler(this.canvas);
    this.inputHandler.setOnChangeCallback((state) => {
      this.rotationX = state.rotationX;
      this.rotationY = state.rotationY;
      this.zoom = state.zoom;
      this.render();
    });
    this.initXRayMarker();
    this.isRunning = true;
    this.animate();
  }

  private initXRayMarker(): void {
    this.xRayMarker = new XRayMarker(0.5);
    this.createBlockBuffers();
    this.xRayMarker.setPosition(0, 0, 0);
  }

  private calculateModelBoundsInternal(): void {
    if (!this.model || !this.model.vertices || this.model.vertices.length === 0) {
      console.error("[MapWindow3DRenderer] Cannot calculate bounds on empty mesh.");
      this.modelBounds = null;
      return;
    }
    this.modelBounds = calculateModelBounds(this.model.vertices);
    if (this.modelBounds) {
      console.log(`[MapWindow3DRenderer] Model bounds: Y[${this.modelBounds.minY.toFixed(2)}, ${this.modelBounds.maxY.toFixed(2)}]`);
    }
  }

  public setMapBlocks(blocks: MapBlock[]): void {
    console.log('[SETUP: PRE-FUSION BLOCK METADATA] setMapBlocks()');
    if (!this.model || !this.model.originalBounds || !this.model.scaleFactor) {
      console.error('[MapWindow3DRenderer] Model not initialized');
      return;
    }
    const originalBounds = this.model.originalBounds;
    const scale = this.model.scaleFactor;
    const centerX = (originalBounds.minX + originalBounds.maxX) / 2;
    const centerY = (originalBounds.minY + originalBounds.maxY) / 2;
    const centerZ = (originalBounds.minZ + originalBounds.maxZ) / 2;
    console.log(`[MapWindow3DRenderer] Converting ${blocks.length} blocks to normalized space`);
    this.gridCoordinates = blocks.map(block => ({
      x: (block.position.x - centerX) * scale,
      y: (block.position.y - centerY) * scale,
      z: (block.position.z - centerZ) * scale
    }));
    if (blocks.length > 0 && this.xRayMarker) {
      const sf = 0.9;
      this.xRayMarker.setBlockSizeVector(blocks[0].size.x * scale * sf, blocks[0].size.y * scale * sf, blocks[0].size.z * scale * sf);
      this.xRayMarker.blockSize = (this.xRayMarker.blockSizeVector.x + this.xRayMarker.blockSizeVector.y + this.xRayMarker.blockSizeVector.z) / 3;
      this.createBlockBuffers();
    }
    this.currentGridIndex = 0;
    if (this.gridCoordinates.length > 0 && this.xRayMarker) this.xRayMarker.position = { ...this.gridCoordinates[0] };
    this.blockVisibility = new Array(blocks.length).fill(false);
    this.blockVisibility[0] = true;
    this.fogOfWar = new FogOfWarTracker();
    if (this.model.blockTriangleRanges?.length === blocks.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges;
    } else if (this.model.blockTriangleRanges?.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges.slice(0, blocks.length);
    } else {
      this.blockTriangleRanges = blocks.map((_, i) => ({ start: i * 36, count: 36 }));
    }
    console.log(`[MapWindow3DRenderer] Grid populated with ${this.gridCoordinates.length} blocks`);
  }

  private createBlockBuffers(): void {
    if (!this.gl || !this.xRayMarker) return;
    const halfX = this.xRayMarker.blockSizeVector.x / 2;
    const halfY = this.xRayMarker.blockSizeVector.y / 2;
    const halfZ = this.xRayMarker.blockSizeVector.z / 2;
    const vertices = createCubeVertices(halfX, halfY, halfZ);
    const indices = createCubeIndices();
    const positionBuffer = this.gl.createBuffer();
    const indexBuffer = this.gl.createBuffer();
    if (!positionBuffer || !indexBuffer) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    this.blockVertexBuffers = { position: positionBuffer, index: indexBuffer };
  }

  public loadModel(model: OBJModel): void {
    try {
      this.model = model;
      console.log('[MapWindow3DRenderer] Model loaded:', this.model.vertexCount, 'vertices');
      if (this.gl && this.model) {
        this.calculateModelBoundsInternal();
        this.createBuffersFromModel();
        console.log(`[MapWindow3DRenderer] Buffers created: ${this.model.vertexCount} vertices`);
      }
    } catch (error) {
      console.error('[MapWindow3DRenderer] Failed to load model:', error);
    }
  }

  private createBuffersFromModel(): void {
    if (!this.gl || !this.model) return;
    this.vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.vertices, this.gl.STATIC_DRAW);
    this.normalBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.model.normals, this.gl.STATIC_DRAW);
    this.indexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.model.indices, this.gl.STATIC_DRAW);
  }

  public async loadOBJ(url: string): Promise<void> {
    try {
      this.model = await OBJLoader.loadFromURL(url);
      console.log('[MapWindow3DRenderer] Model loaded:', this.model.vertexCount, 'vertices');
      if (this.gl && this.model) {
        this.calculateModelBoundsInternal();
        this.createBuffersFromModel();
      }
    } catch (error) {
      console.error('[MapWindow3DRenderer] Failed to load OBJ:', error);
    }
  }

  public getXRayMarker(): XRayMarker | null { return this.xRayMarker; }
  public moveXRayMarkerUp(steps: number = 1): void { if (this.xRayMarker) this.xRayMarker.moveUp(steps); }
  public moveXRayMarkerDown(steps: number = 1): void { if (this.xRayMarker) this.xRayMarker.moveDown(steps); }
  public setXRayMarkerPosition(x: number, y: number, z: number): void { if (this.xRayMarker) this.xRayMarker.setPosition(x, y, z); }
  public showXRayMarker(): void { if (this.xRayMarker) this.xRayMarker.show(); }
  public hideXRayMarker(): void { if (this.xRayMarker) this.xRayMarker.hide(); }
  public setXRayMarkerColor(r: number, g: number, b: number, a: number = 0.8): void { if (this.xRayMarker) this.xRayMarker.setColor(r, g, b, a); }

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
    this.updateXRayMarkerAnimation();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updateXRayMarkerAnimation(): void {
    if (!this.xRayMarker || !this.gridCoordinates?.length) return;
    const now = Date.now();
    if (now - this.lastGridMoveTime < this.GRID_MOVE_INTERVAL) return;
    this.lastGridMoveTime = now;
    if (this.currentGridIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentGridIndex];
      this.xRayMarker.setPosition(pos.x, pos.y, pos.z);
      this.revealBlock(this.currentGridIndex);
      this.currentGridIndex++;
      if (this.currentGridIndex % 10 === 0 || this.currentGridIndex === 1) {
        console.log(`[MapWindow3DRenderer] Grid step ${this.currentGridIndex}/${this.gridCoordinates.length}`);
      }
    } else {
      this.currentGridIndex = 0;
      console.log('[MapWindow3DRenderer] Grid scan complete, restarting...');
    }
  }

  private revealBlock(blockIndex: number): void {
    if (blockIndex < 0 || blockIndex >= this.blockVisibility.length) return;
    if (!this.blockVisibility[blockIndex]) {
      this.blockVisibility[blockIndex] = true;
      this.fogOfWar?.revealBlock(blockIndex);
    }
  }

  public isBlockVisible(blockIndex: number): boolean {
    if (blockIndex < 0 || blockIndex >= this.blockVisibility.length) return false;
    return this.blockVisibility[blockIndex];
  }

  public getRevealedBlockCount(): number { return this.fogOfWar?.getRevealedCount() ?? 0; }

  private render(): void {
    if (!this.gl || !this.program || !this.model) return;
    const gl = this.gl;
    let focusPoint = { x: 0, y: 0, z: 0 };
    if (this.xRayMarker?.visible && this.xRayMarker.position) focusPoint = this.xRayMarker.position;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    const normalLocation = gl.getAttribLocation(this.program, 'a_normal');
    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(this.program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(this.program, 'u_color');
    const lightDirLocation = gl.getUniformLocation(this.program, 'u_lightDir');
    const useLightingLocation = gl.getUniformLocation(this.program, 'u_useLighting');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    const aspect = this.canvas.width / this.canvas.height;
    const matrix = createMVPMatrix(this.rotationY, this.rotationX, aspect, this.zoom, focusPoint);
    const normalMatrix = createNormalMatrix(this.rotationY, this.rotationX);
    if (hasExtremeValues(matrix)) console.error('[MapWindow3DRenderer] MVP Matrix contains invalid values!');
    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform4f(colorLocation, 0.5, 0.5, 0.5, 1.0);
    gl.uniform3f(lightDirLocation, 0.5, 1.0, 0.3);
    gl.uniform1i(useLightingLocation, 1);
    if (this.blockTriangleRanges.length > 0) {
      for (let i = 0; i < this.blockTriangleRanges.length; i++) {
        if (this.blockVisibility[i]) {
          const range = this.blockTriangleRanges[i];
          gl.drawElements(gl.TRIANGLES, range.count, gl.UNSIGNED_SHORT, range.start * 2);
        }
      }
    } else {
      gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_SHORT, 0);
    }
    this.renderXRayMarker(matrixLocation, useLightingLocation);
  }

  private renderXRayMarker(matrixLocation: WebGLUniformLocation | null, useLightingLocation: WebGLUniformLocation | null): void {
    if (!this.gl || !this.xRayMarker?.visible || !this.blockVertexBuffers || !matrixLocation || !useLightingLocation || !this.program) return;
    if (!this.blockVertexBuffers.position || !this.blockVertexBuffers.index) return;
    const gl = this.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    const aspect = this.canvas.width / this.canvas.height;
    const baseMatrix = createMVPMatrix(this.rotationY, this.rotationX, aspect, this.zoom, this.xRayMarker.position);
    const translation = multiplyMatrices(baseMatrix, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, this.xRayMarker.position.x, this.xRayMarker.position.y, this.xRayMarker.position.z, 1]));
    const positionLocation = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.blockVertexBuffers.position);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.blockVertexBuffers.index);
    gl.uniformMatrix4fv(matrixLocation, false, translation);
    gl.uniform1i(useLightingLocation, 0);
    const colorLocation = gl.getUniformLocation(this.program, 'u_color');
    const [r, g, b, a] = this.xRayMarker.color;
    gl.uniform4f(colorLocation, r, g, b, a);
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.uniform1i(useLightingLocation, 1);
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.inputHandler?.destroy();
  }

  /**
   * Public method to toggle grid animation on/off
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
    if (!this.xRayMarker || this.gridCoordinates.length === 0) return;

    if (this.currentGridIndex < this.gridCoordinates.length) {
      const pos = this.gridCoordinates[this.currentGridIndex];
      this.xRayMarker.setPosition(pos.x, pos.y, pos.z);

      // Reveal the block at current index (fog of war)
      this.revealBlock(this.currentGridIndex);

      this.currentGridIndex++;
      console.log(`[MapWindow3DRenderer] Manual grid step ${this.currentGridIndex}/${this.gridCoordinates.length}, revealed block ${this.currentGridIndex - 1}`);
    } else {
      this.currentGridIndex = 0;
    }
  }
}
