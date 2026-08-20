// SRC/engine/map-renderer/SceneRenderer.ts
// Dedicated module for executing WebGL render commands

import { MapModelManager } from './MapModelManager';
import { BlockVisibilityTracker } from './BlockVisibilityTracker';
import { BlockTriangleRangeManager } from './BlockTriangleRangeManager';
import { BlockDrawer } from './BlockDrawer';
import { RenderStateStack } from './RenderStateStack';
import { XRayMarkerManager } from './XRayMarkerManager';
import { MapMatrixCalculator } from './MapMatrixCalculator';
import { BlockVertexBufferManager } from './BlockVertexBufferManager';
import { MapInputController } from './MapInputController';
import { RENDER_CONSTANTS } from './MapRendererTypes';
import { OBJModel } from '../OBJLoader';

export interface RenderDependencies {
  modelManager: MapModelManager;
  triangleRangeManager: BlockTriangleRangeManager;
  visibilityTracker: BlockVisibilityTracker | null;
  blockDrawer: BlockDrawer;
  xRayMarkerManager: XRayMarkerManager;
  inputController: MapInputController;
  renderStateStack: RenderStateStack;
  blockBufferManager: BlockVertexBufferManager;
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
}

export class SceneRenderer {
  constructor(private deps: RenderDependencies) {}

  public render(): void {
    const { gl, program, modelManager, canvas, inputController } = this.deps;
    const model = modelManager.getModel();
    if (!model) return;

    const focusPoint = this.calculateFocusPoint();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);

    this.bindVertexAttributes(program);
    this.setShaderUniforms(program, focusPoint, inputController, canvas);
    this.drawSceneObjects();
    this.renderXRayMarker(program, focusPoint, inputController, canvas);
  }

  private calculateFocusPoint(): { x: number; y: number; z: number } {
    const { xRayMarkerManager } = this.deps;
    let focusPoint = { x: 0, y: 0, z: 0 };
    const xRayPos = xRayMarkerManager.getPosition();
    if (xRayMarkerManager.isVisible() && xRayPos) {
      focusPoint = xRayPos;
    }
    return focusPoint;
  }

  private bindVertexAttributes(program: WebGLProgram): void {
    const { gl, modelManager } = this.deps;
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const normalLocation = gl.getAttribLocation(program, 'a_normal');

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, modelManager.getVertexBuffer());
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, modelManager.getNormalBuffer());
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  }

  private setShaderUniforms(
    program: WebGLProgram,
    focusPoint: { x: number; y: number; z: number },
    inputController: MapInputController,
    canvas: HTMLCanvasElement
  ): void {
    const { gl, modelManager } = this.deps;
    const aspect = canvas.width / canvas.height;
    const rotationY = inputController.getRotationY() ?? 0;
    const rotationX = inputController.getRotationX() ?? RENDER_CONSTANTS.DEFAULT_ROTATION_X;
    const zoom = inputController.getZoom() ?? RENDER_CONSTANTS.DEFAULT_ZOOM;

    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    const normalMatrixLocation = gl.getUniformLocation(program, 'u_normalMatrix');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const lightDirLocation = gl.getUniformLocation(program, 'u_lightDir');
    const useLightingLocation = gl.getUniformLocation(program, 'u_useLighting');

    const matrix = MapMatrixCalculator.calculateMVPMatrix(rotationY, rotationX, aspect, zoom, focusPoint);
    const normalMatrix = MapMatrixCalculator.calculateNormalMatrix(rotationY, rotationX);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.uniformMatrix4fv(normalMatrixLocation, false, normalMatrix);
    gl.uniform4f(colorLocation, 0.5, 0.5, 0.5, 1.0);
    gl.uniform3f(lightDirLocation, 0.5, 1.0, 0.3);
    gl.uniform1i(useLightingLocation, 1);
  }

  private drawSceneObjects(): void {
    const { gl, modelManager, triangleRangeManager, visibilityTracker, blockDrawer } = this.deps;
    const indexBuffer = modelManager.getIndexBuffer();
    const triangleRanges = triangleRangeManager.getRanges();

    if (triangleRanges.length > 0 && visibilityTracker) {
      blockDrawer.drawVisibleBlocks(
        indexBuffer,
        triangleRanges,
        visibilityTracker.getAllVisibility()
      );
    } else {
      const model = modelManager.getModel();
      if (model) {
        blockDrawer.drawFullModel(indexBuffer, model.indices.length);
      }
    }
  }

  private renderXRayMarker(
    program: WebGLProgram,
    focusPoint: { x: number; y: number; z: number },
    inputController: MapInputController,
    canvas: HTMLCanvasElement
  ): void {
    const { xRayMarkerManager, renderStateStack, blockBufferManager, blockDrawer, gl } = this.deps;
    
    if (!xRayMarkerManager.isVisible()) return;

    const xRayPos = xRayMarkerManager.getPosition();
    if (!xRayPos) return;

    const indexBuffer = blockBufferManager.getIndexBuffer();
    if (!indexBuffer) return;

    renderStateStack.push();
    renderStateStack.configureForXRay();

    const aspect = canvas.width / canvas.height;
    const rotationY = inputController.getRotationY() ?? 0;
    const rotationX = inputController.getRotationX() ?? RENDER_CONSTANTS.DEFAULT_ROTATION_X;
    const zoom = inputController.getZoom() ?? RENDER_CONSTANTS.DEFAULT_ZOOM;

    const baseMatrix = MapMatrixCalculator.calculateMVPMatrix(rotationY, rotationX, aspect, zoom, xRayPos);
    if (!baseMatrix) {
      renderStateStack.pop();
      return;
    }

    const translation = MapMatrixCalculator.multiplyMatrices(
      baseMatrix,
      MapMatrixCalculator.createTranslationMatrix(xRayPos.x, xRayPos.y, xRayPos.z)
    );

    const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
    const useLightingLocation = gl.getUniformLocation(program, 'u_useLighting');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, blockBufferManager.getPositionBuffer());
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.uniformMatrix4fv(matrixLocation, false, translation);
    gl.uniform1i(useLightingLocation, 0);

    const [r, g, b, a] = xRayMarkerManager.getColor();
    gl.uniform4f(colorLocation, r, g, b, a);

    blockDrawer.drawTriangles(indexBuffer, 36, 0);

    renderStateStack.restoreFromXRay();
    renderStateStack.pop();
  }
}
