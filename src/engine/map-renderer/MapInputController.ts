// SRC/engine/map-renderer/MapInputController.ts
// Handles camera rotation, zoom, and user input for 3D map view

import { MapInputHandler, MapCameraState } from '../MapInputHandler';
import { RENDER_CONSTANTS } from './MapRendererTypes';

export class MapInputController {
  private inputHandler: MapInputHandler | null = null;
  private rotationX: number = RENDER_CONSTANTS.DEFAULT_ROTATION_X;
  private rotationY: number = RENDER_CONSTANTS.DEFAULT_ROTATION_Y;
  private zoom: number = RENDER_CONSTANTS.DEFAULT_ZOOM;
  private onChangeCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.inputHandler = new MapInputHandler(canvas);
    this.inputHandler.setOnChangeCallback((state: MapCameraState) => {
      this.rotationX = state.rotationX;
      this.rotationY = state.rotationY;
      this.zoom = state.zoom;
      if (this.onChangeCallback) {
        this.onChangeCallback();
      }
    });
  }

  public setOnChangeCallback(callback: () => void): void {
    this.onChangeCallback = callback;
  }

  public getRotationX(): number { return this.rotationX; }
  public getRotationY(): number { return this.rotationY; }
  public getZoom(): number { return this.zoom; }

  public destroy(): void {
    if (this.inputHandler) {
      this.inputHandler.destroy();
    }
  }
}
