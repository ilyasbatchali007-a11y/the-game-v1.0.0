// SRC/engine/map-renderer/MapMatrixCalculator.ts
// Pure math functions for MVP matrices and transformations

export class MapMatrixCalculator {
  /**
   * Creates a perspective matrix
   */
  static createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);
    
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  }

  /**
   * Creates a lookAt view matrix
   */
  static createLookAtMatrix(eye: {x: number, y: number, z: number}, 
                           center: {x: number, y: number, z: number}, 
                           up: {x: number, y: number, z: number}): Float32Array {
    const zAxis = this.normalize(this.subtractVectors(eye, center));
    const xAxis = this.normalize(this.cross(up, zAxis));
    const yAxis = this.cross(zAxis, xAxis);

    return new Float32Array([
      xAxis.x, yAxis.x, zAxis.x, 0,
      xAxis.y, yAxis.y, zAxis.y, 0,
      xAxis.z, yAxis.z, zAxis.z, 0,
      -this.dot(xAxis, eye), -this.dot(yAxis, eye), -this.dot(zAxis, eye), 1
    ]);
  }

  /**
   * Multiplies two 4x4 matrices
   */
  static multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
    const result = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }
    return result;
  }

  /**
   * Creates a translation matrix
   */
  static createTranslationMatrix(x: number, y: number, z: number): Float32Array {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  }

  /**
   * Calculates the normal matrix (inverse transpose of model-view)
   */
  static calculateNormalMatrix(rotationY: number, rotationX: number): Float32Array {
    const cosY = Math.cos(rotationY);
    const sinY = Math.sin(rotationY);
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);

    // Simplified rotation matrix for Y then X
    return new Float32Array([
      cosY, sinY * sinX, sinY * cosX, 0,
      0, cosX, -sinX, 0,
      -sinY, cosY * sinX, cosY * cosX, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Calculates the complete Model-View-Projection matrix
   */
  static calculateMVPMatrix(rotationY: number, rotationX: number, aspect: number, zoom: number, focusPoint: {x: number, y: number, z: number}): Float32Array {
    const distance = zoom;
    const eye = {
      x: focusPoint.x + distance * Math.sin(rotationY) * Math.cos(rotationX),
      y: focusPoint.y + distance * Math.sin(rotationX),
      z: focusPoint.z + distance * Math.cos(rotationY) * Math.cos(rotationX)
    };

    const projectionMatrix = this.createPerspectiveMatrix(Math.PI / 4, aspect, 0.1, 1000.0);
    const viewMatrix = this.createLookAtMatrix(eye, focusPoint, { x: 0, y: 1, z: 0 });
    
    return this.multiplyMatrices(projectionMatrix, viewMatrix);
  }

  private static subtractVectors(a: {x: number, y: number, z: number}, 
                                 b: {x: number, y: number, z: number}): {x: number, y: number, z: number} {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  }

  private static cross(a: {x: number, y: number, z: number}, 
                       b: {x: number, y: number, z: number}): {x: number, y: number, z: number} {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  private static normalize(v: {x: number, y: number, z: number}): {x: number, y: number, z: number} {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return len > 0 ? { x: v.x / len, y: v.y / len, z: v.z / len } : v;
  }

  private static dot(a: {x: number, y: number, z: number}, 
                     b: {x: number, y: number, z: number}): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
}
