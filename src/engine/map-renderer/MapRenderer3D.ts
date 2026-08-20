// SRC/engine/map-renderer/MapRenderer3D.ts
// Thin orchestrator for 3D dungeon map rendering - coordinates all subsystems

import { WebGLShaderManager, MapRendererShaders } from '../WebGLShaderManager';
import { MapInputController } from './MapInputController';
import { XRayMarkerManager } from './XRayMarkerManager';
import { BlockVisibilityTracker } from './BlockVisibilityTracker';
import { BlockVertexBufferManager } from './BlockVertexBufferManager';
import { GridAnimationController } from './GridAnimationController';
import { MapModelManager } from './MapModelManager';
import { BlockTriangleRangeManager } from './BlockTriangleRangeManager';
import { RenderStateStack } from './RenderStateStack';
import { BlockDrawer } from './BlockDrawer';
import { MapBlock } from '../types/MapBlockTypes';
import { RENDER_CONSTANTS } from './MapRendererTypes';
import { OBJModel } from '../OBJLoader';
import { SceneRenderer, RenderDependencies } from './SceneRenderer';

export class MapRenderer3D {
  private gl: WebGLRenderingContext | null = null;
  private canvas: HTMLCanvasElement;
  private program: WebGLProgram | null = null;
  private isRunning: boolean = false;
  private animationFrameId: number = 0;
  private shaderManager: WebGLShaderManager | null = null;
  private inputController: MapInputController | null = null;
  private xRayMarkerManager: XRayMarkerManager | null = null;
  private blockBufferManager: BlockVertexBufferManager | null = null;
  private gridAnimationController: GridAnimationController | null = null;
  private modelManager: MapModelManager | null = null;
  private visibilityTracker: BlockVisibilityTracker | null = null;
  private triangleRangeManager: BlockTriangleRangeManager | null = null;
  private renderStateStack: RenderStateStack | null = null;
  private blockDrawer: BlockDrawer | null = null;
  private sceneRenderer: SceneRenderer | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init(): void {
    const gl = this.canvas.getContext('webgl');
    if (!gl) {
      console.warn('[MapRenderer3D] WebGL not supported');
      return;
    }
    this.gl = gl;
    this.shaderManager = new WebGLShaderManager(gl);
    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.program = this.shaderManager.createProgramFromSource(
      MapRendererShaders.vertex,
      MapRendererShaders.fragment
    );

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.inputController = new MapInputController(this.canvas);
    this.inputController.setOnChangeCallback(() => this.render());

    this.xRayMarkerManager = new XRayMarkerManager(RENDER_CONSTANTS.XRAY_DEFAULT_ALPHA);
    this.blockBufferManager = new BlockVertexBufferManager(gl);
    this.modelManager = new MapModelManager(gl);
    this.gridAnimationController = new GridAnimationController();
    this.triangleRangeManager = new BlockTriangleRangeManager();
    this.renderStateStack = new RenderStateStack(gl);
    this.blockDrawer = new BlockDrawer(gl);

    this.initXRayMarker();
    this.isRunning = true;
    this.animate();
  }

  private initXRayMarker(): void {
    this.xRayMarkerManager?.setPosition(0, 0, 0);
  }

  public setMapBlocks(blocks: MapBlock[]): void {
    if (!this.modelManager || !this.triangleRangeManager) return;

    const model = this.modelManager.getModel();
    this.modelManager.setMapBlocks(blocks);
    this.triangleRangeManager.initializeFromModel(model, blocks);

    const gridCoordinates = this.modelManager.getGridCoordinates();
    if (gridCoordinates.length > 0 && this.xRayMarkerManager) {
      const firstBlock = blocks[0];
      const scale = this.modelManager.getModel()?.scaleFactor ?? 1;
      const originalBounds = this.modelManager.getModel()?.originalBounds;
      if (originalBounds) {
        const sf = 0.9;
        const blockSizeX = firstBlock.size.x * scale * sf;
        const blockSizeY = firstBlock.size.y * scale * sf;
        const blockSizeZ = firstBlock.size.z * scale * sf;
        this.xRayMarkerManager.setBlockSizeVector(blockSizeX, blockSizeY, blockSizeZ);
        this.blockBufferManager?.createBuffers(this.xRayMarkerManager.getBlockSizeVector());
      }
    }

    this.visibilityTracker = new BlockVisibilityTracker(blocks.length);
    this.visibilityTracker.revealBlock(0);

    this.gridAnimationController?.setGridCoordinates(gridCoordinates);

    console.log(`[MapRenderer3D] Grid populated with ${gridCoordinates.length} blocks`);
  }

  public loadModel(model: OBJModel): void {
    this.modelManager?.loadModel(model);
  }

  public async loadOBJ(url: string): Promise<void> {
    await this.modelManager?.loadFromURL(url);
  }

  public getXRayMarker(): any | null {
    return this.xRayMarkerManager?.getXRayMarker() ?? null;
  }

  public moveXRayMarkerUp(steps: number = 1): void {
    this.xRayMarkerManager?.moveUp(steps);
  }

  public moveXRayMarkerDown(steps: number = 1): void {
    this.xRayMarkerManager?.moveDown(steps);
  }

  public setXRayMarkerPosition(x: number, y: number, z: number): void {
    this.xRayMarkerManager?.setPosition(x, y, z);
  }

  public showXRayMarker(): void {
    this.xRayMarkerManager?.show();
  }

  public hideXRayMarker(): void {
    this.xRayMarkerManager?.hide();
  }

  public setXRayMarkerColor(r: number, g: number, b: number, a: number = RENDER_CONSTANTS.XRAY_DEFAULT_ALPHA): void {
    this.xRayMarkerManager?.setColor(r, g, b, a);
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
    this.updateGridAnimation();
    this.render();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private updateGridAnimation(): void {
    if (!this.gridAnimationController || !this.xRayMarkerManager) return;

    const result = this.gridAnimationController.update((index) => {
      this.visibilityTracker?.revealBlock(index);
    });

    if (result.hasUpdate && result.position && this.xRayMarkerManager) {
      this.xRayMarkerManager.setPosition(result.position.x, result.position.y, result.position.z);
    }
  }

  public isBlockVisible(blockIndex: number): boolean {
    return this.visibilityTracker?.isBlockVisible(blockIndex) ?? false;
  }

  public getRevealedBlockCount(): number {
    return this.visibilityTracker?.getRevealedCount() ?? 0;
  }

  private render(): void {
    if (!this.gl || !this.program || !this.modelManager?.getModel()) return;
    
    if (!this.sceneRenderer) {
      const deps: RenderDependencies = {
        modelManager: this.modelManager!,
        triangleRangeManager: this.triangleRangeManager!,
        visibilityTracker: this.visibilityTracker,
        blockDrawer: this.blockDrawer!,
        xRayMarkerManager: this.xRayMarkerManager!,
        inputController: this.inputController!,
        renderStateStack: this.renderStateStack!,
        blockBufferManager: this.blockBufferManager!,
        canvas: this.canvas,
        gl: this.gl,
        program: this.program
      };
      this.sceneRenderer = new SceneRenderer(deps);
    }
    
    // Update visibility tracker reference in case it changed
    (this.sceneRenderer as any).deps.visibilityTracker = this.visibilityTracker;
    
    this.sceneRenderer.render();
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.inputController?.destroy();
    this.blockBufferManager?.destroy();
    this.modelManager?.destroy();
  }

  public toggleGridAnimation(enabled: boolean): void {
    if (enabled) {
      this.gridAnimationController?.start();
      console.log('[MapRenderer3D] Grid animation started');
    } else {
      this.gridAnimationController?.stop();
      console.log('[MapRenderer3D] Grid animation stopped');
    }
  }

  public moveToNextGridPosition(): void {
    const pos = this.gridAnimationController?.moveToNext();
    if (pos && this.xRayMarkerManager) {
      this.xRayMarkerManager.setPosition(pos.x, pos.y, pos.z);
    }
  }
}
