// SRC/engine/MapWindow3DRenderer.ts
// Thin orchestrator for 3D map rendering - coordinates all subsystems

import { OBJLoader, OBJModel } from './OBJLoader';
import { FogOfWarTracker } from './FogOfWarTracker';
import { XRayMarker } from './XRayMarker';
import { MapBlock } from './types/MapBlockTypes';
import { WebGLShaderManager, MapRendererShaders } from './WebGLShaderManager';
import { MapInputHandler, MapCameraState } from './MapInputHandler';
import { MatrixCalculator } from './map-window-renderer/MatrixCalculator';
import { BlockVisibilityManager } from './map-window-renderer/BlockVisibilityManager';
import { GridAnimationController } from './map-window-renderer/GridAnimationController';
import { XRayRenderer } from './map-window-renderer/XRayRenderer';
import { MainModelRenderer } from './map-window-renderer/MainModelRenderer';
import { ModelBufferManager } from './map-window-renderer/ModelBufferManager';
import { TriangleRangeResolver } from './map-window-renderer/TriangleRangeResolver';

export type { MapBlock };

/**
 * Thin orchestrator for 3D dungeon map rendering
 * Delegates ALL work to specialized subsystems
 */
export class MapWindow3DRenderer {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private rotationY: number = 0;
  private rotationX: number = 0.3;
  private zoom: number = -1.80;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  
  // Delegated subsystems
  private inputHandler: MapInputHandler | null = null;
  private xRayMarker: XRayMarker | null = null;
  private fogOfWar: FogOfWarTracker | null = null;
  private visibilityManager: BlockVisibilityManager | null = null;
  private gridAnimator: GridAnimationController | null = null;
  private xRayRenderer: XRayRenderer | null = null;
  private modelRenderer: MainModelRenderer | null = null;
  private bufferManager: ModelBufferManager | null = null;
  private rangeResolver: TriangleRangeResolver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl');
    if (!gl) { console.warn('[MapWindow3DRenderer] WebGL not supported'); return; }
    this.gl = gl;
    
    const shaderManager = new WebGLShaderManager(gl);
    this.program = shaderManager.createProgramFromSource(MapRendererShaders.vertex, MapRendererShaders.fragment);
    
    this.inputHandler = new MapInputHandler(this.canvas);
    this.inputHandler.setOnChangeCallback((state) => {
      this.rotationX = state.rotationX;
      this.rotationY = state.rotationY;
      this.zoom = state.zoom;
      this.render();
    });
    
    this.initSubsystems(gl);
    
    window.addEventListener('resize', () => this.resize());
    this.resize();
    
    this.isRunning = true;
    this.animate();
  }

  private initSubsystems(gl: WebGLRenderingContext): void {
    this.xRayMarker = new XRayMarker(0.5);
    this.xRayRenderer = new XRayRenderer(gl);
    this.modelRenderer = new MainModelRenderer(gl);
    this.bufferManager = new ModelBufferManager(gl);
    this.rangeResolver = new TriangleRangeResolver();
    this.gridAnimator = new GridAnimationController();
    this.xRayMarker.setPosition(0, 0, 0);
  }

  public setMapBlocks(blocks: MapBlock[]): void {
    if (!this.bufferManager?.hasModel()) return;
    
    const gridCoordinates = this.bufferManager.calculateGridCoordinates(blocks);
    
    if (blocks.length > 0 && this.xRayMarker) {
      this.xRayMarker.setBlockSizeVector(...this.bufferManager.getBlockSizeVector(blocks[0]));
      this.xRayRenderer?.createBlockBuffers(this.xRayMarker);
    }
    
    this.gridAnimator?.setGridCoordinates(gridCoordinates);
    this.visibilityManager = new BlockVisibilityManager(blocks.length);
    this.visibilityManager.revealBlock(0);
    this.fogOfWar = new FogOfWarTracker();
    
    this.rangeResolver?.resolve(this.bufferManager.getModel()!, blocks.length);
  }

  public loadModel(model: OBJModel): void {
    this.bufferManager?.loadModel(model);
    this.rangeResolver?.resolve(model, 0); // Pre-resolve ranges if available
  }

  public async loadOBJ(url: string): Promise<void> {
    const model = await OBJLoader.loadFromURL(url);
    this.loadModel(model);
  }

  // X-ray marker delegation
  public getXRayMarker(): XRayMarker | null { return this.xRayMarker; }
  public moveXRayMarkerUp(steps: number = 1): void { this.xRayMarker?.moveUp(steps); }
  public moveXRayMarkerDown(steps: number = 1): void { this.xRayMarker?.moveDown(steps); }
  public setXRayMarkerPosition(x: number, y: number, z: number): void { this.xRayMarker?.setPosition(x, y, z); }
  public showXRayMarker(): void { this.xRayMarker?.show(); }
  public hideXRayMarker(): void { this.xRayMarker?.hide(); }
  public setXRayMarkerColor(r: number, g: number, b: number, a: number = 0.8): void { this.xRayMarker?.setColor(r, g, b, a); }

  private resize(): void {
    if (!this.gl) return;
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
    this.gridAnimator?.update(this.xRayMarker, (index) => {
      this.visibilityManager?.revealBlock(index);
      this.fogOfWar?.revealBlock(index);
    });
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public isBlockVisible(blockIndex: number): boolean {
    return this.visibilityManager?.isVisible(blockIndex) ?? false;
  }

  public getRevealedBlockCount(): number { 
    return this.fogOfWar?.getRevealedCount() ?? 0; 
  }

  private render(): void {
    if (!this.gl || !this.program || !this.bufferManager?.hasModel()) return;
    
    const focusPoint = (this.xRayMarker?.visible && this.xRayMarker.position) ? this.xRayMarker.position : { x: 0, y: 0, z: 0 };
    const aspect = this.canvas.width / this.canvas.height;
    
    this.modelRenderer?.render({
      program: this.program,
      buffers: this.bufferManager.getBuffers(),
      ranges: this.rangeResolver?.getRanges() || [],
      visibility: this.visibilityManager,
      camera: { rotationY: this.rotationY, rotationX: this.rotationX, zoom: this.zoom, aspect, focusPoint }
    });
    
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
    enabled ? this.gridAnimator?.start() : this.gridAnimator?.stop();
  }

  public moveToNextGridPosition(): void {
    this.gridAnimator?.moveNext();
  }
}
