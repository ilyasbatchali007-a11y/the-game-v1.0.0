// SRC/engine/camera/MatrixCalculator.ts
// Handles all 4x4 matrix calculations for camera view and projection matrices
// Generates orthographic projection, view, and combined view-projection matrices

export class MatrixCalculator {
  private static readonly MATRIX_SIZE = 16;

  /**
   * Create orthographic projection matrix
   * Column-major order for WebGL
   */
  public static createOrthographicProjection(
    left: number,
    right: number,
    top: number,
    bottom: number
  ): Float32Array {
    const matrix = new Float32Array(this.MATRIX_SIZE);

    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);

    matrix[0] = 2 * lr;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = 2 * bt;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = -1;
    matrix[11] = 0;
    matrix[12] = (right + left) * lr;
    matrix[13] = (top + bottom) * bt;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

  /**
   * Create view matrix (camera translation only)
   * Column-major order for WebGL
   */
  public static createViewMatrix(positionX: number, positionY: number): Float32Array {
    const matrix = new Float32Array(this.MATRIX_SIZE);

    matrix[0] = 1;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = 1;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = 1;
    matrix[11] = 0;
    matrix[12] = -positionX;
    matrix[13] = -positionY;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

  /**
   * Create combined view-projection matrix
   * Optimized for orthographic camera following a target
   */
  public static createViewProjectionMatrix(
    cameraX: number,
    cameraY: number,
    viewportWidth: number,
    viewportHeight: number
  ): Float32Array {
    const matrix = new Float32Array(this.MATRIX_SIZE);

    const left = cameraX;
    const right = cameraX + viewportWidth;
    const top = cameraY;
    const bottom = cameraY + viewportHeight;

    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);

    matrix[0] = 2 * lr;
    matrix[1] = 0;
    matrix[2] = 0;
    matrix[3] = 0;
    matrix[4] = 0;
    matrix[5] = 2 * bt;
    matrix[6] = 0;
    matrix[7] = 0;
    matrix[8] = 0;
    matrix[9] = 0;
    matrix[10] = -1;
    matrix[11] = 0;
    matrix[12] = (right + left) * lr;
    matrix[13] = (top + bottom) * bt;
    matrix[14] = 0;
    matrix[15] = 1;

    return matrix;
  }

  /**
   * Copy source matrix to destination matrix
   */
  public static copyMatrix(source: Float32Array, destination: Float32Array): void {
    for (let i = 0; i < this.MATRIX_SIZE; i++) {
      destination[i] = source[i];
    }
  }
}
