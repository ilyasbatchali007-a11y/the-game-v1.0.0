// SRC/engine/map-window-renderer/TriangleRangeResolver.ts
// Resolves triangle index ranges for each block in the model

import { OBJModel } from '../OBJLoader';
import { BlockTriangleRange } from './MapWindowTypes';

export class TriangleRangeResolver {
  private ranges: BlockTriangleRange[] = [];

  public resolve(model: OBJModel, blockCount: number): void {
    if (model.blockTriangleRanges?.length === blockCount) {
      this.ranges = model.blockTriangleRanges;
    } else if (model.blockTriangleRanges?.length) {
      this.ranges = model.blockTriangleRanges.slice(0, blockCount);
    } else {
      // Default: assume 36 indices per block (12 triangles * 3 vertices)
      this.ranges = Array.from({ length: blockCount }, (_, i) => ({
        start: i * 36,
        count: 36
      }));
    }
  }

  public getRanges(): BlockTriangleRange[] {
    return this.ranges;
  }
}
