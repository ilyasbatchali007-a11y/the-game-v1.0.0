// SRC/engine/map-renderer/BlockTriangleRangeManager.ts
// Manages block triangle ranges for indexed drawing

import { BlockTriangleRange } from '../types/MapBlockTypes';
import { OBJModel } from '../OBJLoader';
import { MapBlock } from '../types/MapBlockTypes';

export class BlockTriangleRangeManager {
  private blockTriangleRanges: BlockTriangleRange[] = [];

  public initializeFromModel(model: OBJModel | null, blocks: MapBlock[]): void {
    if (!model) {
      this.blockTriangleRanges = [];
      return;
    }

    if (model.blockTriangleRanges?.length === blocks.length) {
      this.blockTriangleRanges = model.blockTriangleRanges;
    } else if (model.blockTriangleRanges?.length) {
      this.blockTriangleRanges = model.blockTriangleRanges.slice(0, blocks.length);
    } else {
      this.blockTriangleRanges = blocks.map((_, i) => ({ start: i * 36, count: 36 }));
    }
  }

  public getRanges(): BlockTriangleRange[] {
    return this.blockTriangleRanges;
  }

  public getRange(index: number): BlockTriangleRange | null {
    if (index < 0 || index >= this.blockTriangleRanges.length) return null;
    return this.blockTriangleRanges[index];
  }

  public getCount(): number {
    return this.blockTriangleRanges.length;
  }
}
