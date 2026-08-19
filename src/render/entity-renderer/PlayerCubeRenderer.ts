/**
 * Renders entities as 3D cubes using instanced rendering
 * Handles player cube rendering with per-face shading and rotation
 */
import { PLAYER_ID } from '../../config/Constants';
import { World } from '../../ecs/World';

export interface CubeRendererState {
  instanceData: Float32Array;
}

/**
 * Creates cube renderer state
 */
export function createCubeRendererState(maxEntities: number = 1): CubeRendererState {
  return {
    // 7 floats per instance: px, py, width, height, cubeHeight, rotation, elevation
    instanceData: new Float32Array(maxEntities * 7),
  };
}

/**
 * Packs player entity data into instance buffer for cube rendering
 */
export function packPlayerInstanceData(
  state: CubeRendererState,
  world: World
): void {
  const worldAny = world as any;
  
  if (!worldAny || !worldAny.active || !worldAny.active[PLAYER_ID]) {
    return;
  }
  
  const cubeHeight = (worldAny.height && worldAny.height[PLAYER_ID]) 
    ? worldAny.height[PLAYER_ID] * 2.0 
    : 64.0;
  const elevation = worldAny.z ? worldAny.z[PLAYER_ID] : 0.0;
  
  state.instanceData[0] = worldAny.px[PLAYER_ID];
  state.instanceData[1] = worldAny.py[PLAYER_ID];
  state.instanceData[2] = worldAny.width[PLAYER_ID];
  state.instanceData[3] = worldAny.height[PLAYER_ID];
  state.instanceData[4] = cubeHeight;
  state.instanceData[5] = worldAny.rotation ? worldAny.rotation[PLAYER_ID] : 0;
  state.instanceData[6] = elevation;
}

/**
 * Renders player as a 3D cube with red color and per-face shading
 */
export function renderPlayerCube(
  gl: WebGL2RenderingContext,
  state: CubeRendererState,
  program: WebGLProgram,
  cubeVAO: WebGLVertexArrayObject,
  instanceBuffer: WebGLBuffer,
  uniformLocations: Record<string, WebGLUniformLocation | null>,
  width: number,
  height: number,
  texture: WebGLTexture,
  cameraX: number = 0,
  cameraY: number = 0
): void {
  const worldAny = state as any; // Type workaround
  
  gl.useProgram(program);
  gl.uniform2f(uniformLocations.resolution!, width, height);
  gl.uniform1f(uniformLocations.isoAngle!, (state as any).isoAngle || Math.PI / 4);
  gl.uniform1f(uniformLocations.isoScale!, (state as any).isoScale || 0.5);
  gl.uniform2f(uniformLocations.cameraOffset!, cameraX, cameraY);
  gl.uniform1i(uniformLocations.renderMode!, 1);  // Entity mode
  gl.uniform4f(uniformLocations.entityColor!, 1.0, 0.0, 0.0, 1.0);  // Red color
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.instanceData.subarray(0, 7));
  
  // Disable face culling so all cube faces are always rendered
  gl.disable(gl.CULL_FACE);
  
  gl.bindVertexArray(cubeVAO);
  // Draw 36 vertices (6 vertices per face × 6 faces) for the cube
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, 1);
  gl.bindVertexArray(null);
}
