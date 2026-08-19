/**
 * Renders floor tiles using instanced rendering
 * Handles batch rendering of all entities as flat quads with atlas or chessboard textures
 */
import { World } from '../../ecs/World';
import { getCurrentMapCols, getCurrentMapRows } from '../../config/MapData';

export interface FloorRendererState {
  instanceData: Float32Array;
  pendingUseAtlas: boolean;
}

/**
 * Creates floor renderer state
 */
export function createFloorRendererState(maxEntities: number = 1000): FloorRendererState {
  return {
    instanceData: new Float32Array(maxEntities * 7),
    pendingUseAtlas: false,
  };
}

/**
 * Packs all entity transform data into contiguous instance buffer for floor rendering
 */
export function packFloorInstanceData(
  state: FloorRendererState,
  world: World
): number {
  const worldAny = world as any;
  
  if (!worldAny || !worldAny.set) {
    return 0;
  }
  
  const count = worldAny.set.count;
  if (!count || count === 0) {
    return 0;
  }
  
  const dense = worldAny.set.dense;
  if (!dense) {
    return 0;
  }
  
  let offset = 0;
  for (let i = 0; i < count; i++) {
    const id = dense[i];
    state.instanceData[offset++] = worldAny.px[id];
    state.instanceData[offset++] = worldAny.py[id];
    state.instanceData[offset++] = worldAny.width[id];
    state.instanceData[offset++] = worldAny.height[id];
    state.instanceData[offset++] = 0.0; // cubeHeight = 0 for flat entities
    state.instanceData[offset++] = 0.0; // rotation = 0 for flat entities
    state.instanceData[offset++] = 0.0; // elevation = 0 for floor/flat entities
  }
  
  return count;
}

/**
 * Renders all entities as flat floor quads
 */
export function renderFloorQuads(
  gl: WebGL2RenderingContext,
  state: FloorRendererState,
  program: WebGLProgram,
  floorVAO: WebGLVertexArrayObject,
  instanceBuffer: WebGLBuffer,
  uniformLocations: Record<string, WebGLUniformLocation | null>,
  texture: WebGLTexture,
  mapDataTexture: WebGLTexture | null,
  width: number,
  height: number,
  entityCount: number,
  cameraX: number = 0,
  cameraY: number = 0
): void {
  if (entityCount === 0) return;
  
  gl.useProgram(program);
  gl.uniform2f(uniformLocations.resolution!, width, height);
  gl.uniform1f(uniformLocations.isoAngle!, (state as any).isoAngle || Math.PI / 4);
  gl.uniform1f(uniformLocations.isoScale!, (state as any).isoScale || 0.5);
  gl.uniform2f(uniformLocations.cameraOffset!, cameraX, cameraY);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.instanceData.subarray(0, entityCount * 7));
  
  // Use the floor VAO for flat entities (quad = 6 vertices)
  gl.bindVertexArray(floorVAO);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, entityCount);
  gl.bindVertexArray(null);
}

/**
 * Renders a single full-floor quad covering the entire map area
 */
export function renderFullFloorQuad(
  gl: WebGL2RenderingContext,
  state: FloorRendererState,
  program: WebGLProgram,
  floorVAO: WebGLVertexArrayObject,
  instanceBuffer: WebGLBuffer,
  uniformLocations: Record<string, WebGLUniformLocation | null>,
  texture: WebGLTexture,
  mapDataTexture: WebGLTexture | null,
  floorData: { x: number; y: number; width: number; height: number; useAtlas?: boolean },
  width: number,
  height: number,
  cameraX: number = 0,
  cameraY: number = 0
): void {
  // Pack floor data: x, y, width, height, height=0
  state.instanceData[0] = floorData.x;
  state.instanceData[1] = floorData.y;
  state.instanceData[2] = floorData.width;
  state.instanceData[3] = floorData.height;
  state.instanceData[4] = 0.0; // cubeHeight = 0 for floor
  state.instanceData[5] = 0.0; // rotation = 0 for floor
  state.instanceData[6] = 0.0; // elevation = 0 for floor
  
  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, state.instanceData.subarray(0, 7));
  
  // Store atlas mode for later use
  state.pendingUseAtlas = floorData.useAtlas !== undefined ? floorData.useAtlas : false;
  
  // Disable culling for floor rendering
  gl.disable(gl.CULL_FACE);
  
  gl.useProgram(program);
  
  // Set atlas/chessboard mode now that program is active
  gl.uniform1i(uniformLocations.useAtlas!, state.pendingUseAtlas ? 1 : 0);
  
  gl.uniform2f(uniformLocations.resolution!, width, height);
  gl.uniform1f(uniformLocations.isoAngle!, (state as any).isoAngle || Math.PI / 4);
  gl.uniform1f(uniformLocations.isoScale!, (state as any).isoScale || 0.5);
  gl.uniform2f(uniformLocations.cameraOffset!, cameraX, cameraY);
  gl.uniform1i(uniformLocations.renderMode!, 0);  // Floor mode
  
  // Set atlas configuration uniforms
  gl.uniform1i(uniformLocations.atlasTileCountLoc!, 32);           // 32x32 tiles in atlas
  gl.uniform1f(uniformLocations.tileSizePixelsLoc!, 64.0);         // 64px per tile in atlas
  gl.uniform1f(uniformLocations.worldTileSizeLoc!, 64.0);          // 64px per game tile
  gl.uniform1i(uniformLocations.staticRangeStartLoc!, 0);          // Static tiles: 0-99
  gl.uniform1i(uniformLocations.staticRangeEndLoc!, 99);
  gl.uniform1i(uniformLocations.variationRangeStartLoc!, 100);     // Variation tiles: 100-1023
  gl.uniform1i(uniformLocations.variationRangeEndLoc!, 1023);
  gl.uniform2f(uniformLocations.mapDimensionsLoc!, getCurrentMapCols(), getCurrentMapRows());
  // Use the stored session seed (consistent throughout gameplay, changes on reload)
  gl.uniform1f(uniformLocations.seedLoc!, (state as any).sessionSeed || 0);
  
  // Bind atlas texture to TEXTURE0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Bind map data texture to TEXTURE1
  gl.activeTexture(gl.TEXTURE1);
  if (mapDataTexture) {
    gl.bindTexture(gl.TEXTURE_2D, mapDataTexture);
  }
  // Tell shader which texture unit to use for map data
  gl.uniform1i(uniformLocations.mapDataTextureLoc!, 1);
  
  gl.bindVertexArray(floorVAO);
  gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1); // Draw 1 instance (the floor)
  gl.bindVertexArray(null);
}
