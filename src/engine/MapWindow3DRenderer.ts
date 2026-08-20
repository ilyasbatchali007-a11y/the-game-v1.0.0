// SRC/engine/MapWindow3DRenderer.ts
// Thin orchestrator for 3D map rendering - coordinates all subsystems

import { OBJLoader, OBJModel } from './OBJLoader';
import { FogOfWarTracker } from './FogOfWarTracker';
import { XRayMarker } from './XRayMarker';
import { BlockPosition, MapBlock } from './types/MapBlockTypes';
import { WebGLShaderManager, MapRendererShaders } from './WebGLShaderManager';
import { calculateModelBounds } from './ModelBoundsCalculator';
import { MapInputHandler, MapCameraState } from './MapInputHandler';
import { MatrixCalculator } from './map-window-renderer/MatrixCalculator';
import { BlockVisibilityManager } from './map-window-renderer/BlockVisibilityManager';
import { GridAnimationController } from './map-window-renderer/GridAnimationController';
import { XRayRenderer } from './map-window-renderer/XRayRenderer';
import { MainModelRenderer } from './map-window-renderer/MainModelRenderer';
import { BlockTriangleRange } from './map-window-renderer/MapWindowTypes';

export type { BlockPosition, MapBlock };

/**
 * Thin orchestrator for 3D dungeon map rendering
 * Delegates all work to specialized subsystems
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
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private shaderManager: WebGLShaderManager | null = null;
  private inputHandler: MapInputHandler | null = null;
  private xRayMarker: XRayMarker | null = null;
  private modelBounds: any | null = null;
  private fogOfWar: FogOfWarTracker | null = null;
  
  // Delegated subsystems
  private visibilityManager: BlockVisibilityManager | null = null;
  private gridAnimator: GridAnimationController | null = null;
  private xRayRenderer: XRayRenderer | null = null;
  private modelRenderer: MainModelRenderer | null = null;
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
    this.initSubsystems(gl);
    this.isRunning = true;
    this.animate();
  }

  private initSubsystems(gl: WebGLRenderingContext): void {
    this.xRayMarker = new XRayMarker(0.5);
    this.xRayRenderer = new XRayRenderer(gl);
    this.modelRenderer = new MainModelRenderer(gl);
    this.gridAnimator = new GridAnimationController();
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
    
    const gridCoordinates = blocks.map(block => ({
      x: (block.position.x - centerX) * scale,
      y: (block.position.y - centerY) * scale,
      z: (block.position.z - centerZ) * scale
    }));
    
    if (blocks.length > 0 && this.xRayMarker) {
      const sf = 0.9;
      this.xRayMarker.setBlockSizeVector(blocks[0].size.x * scale * sf, blocks[0].size.y * scale * sf, blocks[0].size.z * scale * sf);
      this.xRayMarker.blockSize = (this.xRayMarker.blockSizeVector.x + this.xRayMarker.blockSizeVector.y + this.xRayMarker.blockSizeVector.z) / 3;
      this.xRayRenderer?.createBlockBuffers(this.xRayMarker);
    }
    
    this.gridAnimator?.setGridCoordinates(gridCoordinates);
    
    // Initialize visibility manager
    this.visibilityManager = new BlockVisibilityManager(blocks.length);
    this.visibilityManager.revealBlock(0);
    
    this.fogOfWar = new FogOfWarTracker();
    
    // Handle triangle ranges
    if (this.model.blockTriangleRanges?.length === blocks.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges;
    } else if (this.model.blockTriangleRanges?.length) {
      this.blockTriangleRanges = this.model.blockTriangleRanges.slice(0, blocks.length);
    } else {
      this.blockTriangleRanges = blocks.map((_, i) => ({ start: i * 36, count: 36 }));
    }
    
    console.log(`[MapWindow3DRenderer] Grid populated with ${gridCoordinates.length} blocks`);
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

  // X-ray marker delegation methods
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
    this.updateGridAnimation();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updateGridAnimation(): void {
    this.gridAnimator?.update(this.xRayMarker, (index) => {
      this.visibilityManager?.revealBlock(index);
      this.fogOfWar?.revealBlock(index);
    });
  }

  public isBlockVisible(blockIndex: number): boolean {
    return this.visibilityManager?.isVisible(blockIndex) ?? false;
  }

  public getRevealedBlockCount(): number { 
    return this.fogOfWar?.getRevealedCount() ?? 0; 
  }

  private render(): void {
    if (!this.gl || !this.program || !this.model) return;
    const gl = this.gl;
    
    let focusPoint = { x: 0, y: 0, z: 0 };
    if (this.xRayMarker?.visible && this.xRayMarker.position) {
      focusPoint = this.xRayMarker.position;
    }
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    
    const matrixLocation = gl.getUniformLocation(this.program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(this.program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(this.program, 'u_color');
    const lightDirLocation = gl.getUniformLocation(this.program, 'u_lightDir');
    const useLightingLocation = gl.getUniformLocation(this.program, 'u_useLighting');
    
    const aspect = this.canvas.width / this.canvas.height;
    
    // Render main model
    this.modelRenderer?.render(
      this.program,
      this.vertexBuffer,
      this.normalBuffer,
      this.indexBuffer,
      this.blockTriangleRanges,
      this.visibilityManager ? Array.from({ length: this.blockTriangleRanges.length }, (_, i) => this.visibilityManager.isVisible(i)) : [],
      matrixLocation,
      normalMatrixLocation,
      colorLocation,
      lightDirLocation,
      useLightingLocation,
      this.rotationY,
      this.rotationX,
      aspect,
      this.zoom,
      focusPoint
    );
    
    // Render X-ray marker
    this.xRayRenderer?.render(
      this.xRayMarker!,
      this.program,
      this.rotationY,
      this.rotationX,
      aspect,
      this.zoom
    );
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.inputHandler?.destroy();
  }

  public toggleGridAnimation(enabled: boolean): void {
    if (enabled) {
      this.gridAnimator?.start();
    } else {
      this.gridAnimator?.stop();
    }
  }

  public moveToNextGridPosition(): void {
    this.gridAnimator?.moveNext();
  }
}
