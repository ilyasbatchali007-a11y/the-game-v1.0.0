// SRC/engine/map-renderer/XRayMarkerManager.ts
// Manages X-ray marker state, position, and visualization

import { XRayMarker } from '../XRayMarker';
import { RENDER_CONSTANTS } from './MapRendererTypes';

export class XRayMarkerManager {
  private xRayMarker: XRayMarker | null = null;
  private blockSizeVector: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

  constructor(initialAlpha: number = RENDER_CONSTANTS.XRAY_DEFAULT_ALPHA) {
    this.xRayMarker = new XRayMarker(initialAlpha);
  }

  public getXRayMarker(): XRayMarker | null { return this.xRayMarker; }

  public setBlockSizeVector(x: number, y: number, z: number): void {
    this.blockSizeVector = { x, y, z };
    if (this.xRayMarker) {
      const sf = 0.9;
      this.xRayMarker.setBlockSizeVector(x * sf, y * sf, z * sf);
      this.xRayMarker.blockSize = (x + y + z) / 3 * sf;
    }
  }

  public getBlockSizeVector(): { x: number; y: number; z: number } {
    return this.blockSizeVector;
  }

  public setPosition(x: number, y: number, z: number): void {
    if (this.xRayMarker) {
      this.xRayMarker.setPosition(x, y, z);
    }
  }

  public getPosition(): { x: number; y: number; z: number } | null {
    return this.xRayMarker?.position ?? null;
  }

  public moveUp(steps: number = 1): void {
    if (this.xRayMarker) this.xRayMarker.moveUp(steps);
  }

  public moveDown(steps: number = 1): void {
    if (this.xRayMarker) this.xRayMarker.moveDown(steps);
  }

  public show(): void {
    if (this.xRayMarker) this.xRayMarker.show();
  }

  public hide(): void {
    if (this.xRayMarker) this.xRayMarker.hide();
  }

  public isVisible(): boolean {
    return this.xRayMarker?.visible ?? false;
  }

  public setColor(r: number, g: number, b: number, a: number = RENDER_CONSTANTS.XRAY_DEFAULT_ALPHA): void {
    if (this.xRayMarker) {
      this.xRayMarker.setColor(r, g, b, a);
    }
  }

  public getColor(): [number, number, number, number] {
    return this.xRayMarker?.color ?? [0.5, 0.5, 0.5, 0.8];
  }
}
