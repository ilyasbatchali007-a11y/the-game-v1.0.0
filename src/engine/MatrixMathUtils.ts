// SRC/engine/MatrixMathUtils.ts
// Matrix and vector math utilities for 3D transformations

/**
 * Create a perspective projection matrix
 */
export function createPerspectiveMatrix(fov: number, aspect: number, near: number, far: number): Float32Array {
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
 * Create a view matrix for camera positioning
 */
export function createViewMatrix(zoom: number): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, zoom, 1
  ]);
}

/**
 * Create a uniform scale matrix
 */
export function createScaleMatrix(scale: number): Float32Array {
  return new Float32Array([
    scale, 0, 0, 0,
    0, scale, 0, 0,
    0, 0, scale, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Create anisotropic scale matrix for non-uniform scaling
 */
export function createAnisotropicScaleMatrix(scaleX: number, scaleY: number, scaleZ: number): Float32Array {
  return new Float32Array([
    scaleX, 0, 0, 0,
    0, scaleY, 0, 0,
    0, 0, scaleZ, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Create rotation matrix around X axis
 */
export function createRotationXMatrix(angle: number): Float32Array {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new Float32Array([
    1, 0, 0, 0,
    0, cos, sin, 0,
    0, -sin, cos, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Create rotation matrix around Y axis
 */
export function createRotationYMatrix(angle: number): Float32Array {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return new Float32Array([
    cos, 0, -sin, 0,
    0, 1, 0, 0,
    sin, 0, cos, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Create translation matrix
 */
export function createTranslationMatrix(x: number, y: number, z: number): Float32Array {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ]);
}

/**
 * Multiply two 4x4 column-major matrices
 */
export function multiplyMatrices(a: Float32Array, b: Float32Array): Float32Array {
  const result = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      result[col * 4 + row] = sum;
    }
  }
  return result;
}

/**
 * Create normal matrix (inverse transpose of model-view rotation)
 */
export function createNormalMatrix(angleY: number, angleX: number): Float32Array {
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);

  // Normal matrix is the inverse transpose of the model-view matrix (rotation part only)
  return new Float32Array([
    cosY, 0, -sinY, 0,
    sinY * sinX, cosX, cosY * sinX, 0,
    sinY * cosX, -sinX, cosY * cosX, 0,
    0, 0, 0, 1
  ]);
}

/**
 * Check if matrix contains NaN or Infinity values
 */
export function hasExtremeValues(matrix: Float32Array, threshold: number = 100): boolean {
  for (let i = 0; i < 16; i++) {
    const val = matrix[i];
    if (!isFinite(val) || Math.abs(val) > threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Validate matrix values and log errors if invalid
 */
export function validateMatrix(matrix: Float32Array, context: string = 'Matrix'): boolean {
  const hasExtreme = hasExtremeValues(matrix);
  if (hasExtreme) {
    console.error(`[MatrixMathUtils] ${context} contains NaN or Infinity values!`);
    console.error(`[MatrixMathUtils] Matrix values:`, Array.from(matrix));
    return false;
  }
  return true;
}

/**
 * Create complete Model-View-Projection matrix for 3D rendering
 */
export function createMVPMatrix(
  rotationY: number,
  rotationX: number,
  aspect: number,
  zoom: number,
  focusPoint?: { x: number, y: number, z: number }
): Float32Array {
  const fp = focusPoint || { x: 0, y: 0, z: 0 };
  
  // Build transformation chain: Projection * View * Model
  const proj = createPerspectiveMatrix(60 * (Math.PI / 180), aspect, 0.1, 100.0);
  const view = createViewMatrix(zoom);
  const rotX = createRotationXMatrix(rotationX);
  const rotY = createRotationYMatrix(rotationY);
  const scale = createScaleMatrix(1.0);
  
  // Model = RotY * RotX * Scale
  const temp1 = multiplyMatrices(rotX, scale);
  const model = multiplyMatrices(rotY, temp1);
  
  // MVP = P * V * M
  const vm = multiplyMatrices(view, model);
  return multiplyMatrices(proj, vm);
}
