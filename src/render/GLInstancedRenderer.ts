/**
 * GLInstancedRenderer - Orchestrates instanced rendering using specialized modules
 * 
 * This is now a thin coordinator that wires together:
 * - Shader compilation (shader-compiler/)
 * - Geometry buffers (entity-renderer/, floor-renderer/)
 * - Map texture management (map-texture-manager/)
 * - Isometric view (isometric-view/)
 */
import { World } from '../ecs/World';
import { PLAYER_ID } from '../config/Constants';
import { createInstancedShaderProgram, UniformLocations } from './shader-compiler/InstancedShaderCompiler';
import { createCubeGeometryBuffers } from './entity-renderer/CubeGeometryManager';
import { createFloorGeometryBuffers } from './floor-renderer/FloorGeometryManager';
import { createMapDataTexture, updateMapDataTexture } from './map-texture-manager/MapDataTextureManager';
import { createDefaultIsometricView, setIsometricView } from './isometric-view/IsometricViewManager';
import { packFloorInstanceData, renderFloorQuads, createFloorRendererState } from './floor-renderer/FloorQuadRenderer';
import { createCubeRendererState, packPlayerInstanceData } from './entity-renderer/PlayerCubeRenderer';

export class GLInstancedRenderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private locations: UniformLocations;
  private cubeVAO: WebGLVertexArrayObject;
  private cubeInstanceBuffer: WebGLBuffer;
  private floorVAO: WebGLVertexArrayObject;
  private floorInstanceBuffer: WebGLBuffer;
  private mapDataTexture: WebGLTexture | null;
  private sessionSeed: number;
  private isometricView = createDefaultIsometricView();
  private cubeRendererState = createCubeRendererState(1);
  private floorRendererState = createFloorRendererState(1000);

  constructor(gl: WebGL2RenderingContext, maxEntities: number) {
    this.gl = gl;
    
    // Compile shaders and get uniform locations
    const shaderInfo = createInstancedShaderProgram(gl);
    this.program = shaderInfo.program;
    this.locations = shaderInfo.locations;
    
    // Generate random seed for this session
    this.sessionSeed = Math.random() * 10000.0;
    
    // Create map data texture
    const mapTextureInfo = createMapDataTexture(gl);
    this.mapDataTexture = mapTextureInfo.texture;
    
    // Create cube geometry
    const cubeBuffers = createCubeGeometryBuffers(gl, 1);
    this.cubeVAO = cubeBuffers.vao;
    this.cubeInstanceBuffer = cubeBuffers.instanceBuffer;
    
    // Create floor geometry
    const floorBuffers = createFloorGeometryBuffers(gl, maxEntities);
    this.floorVAO = floorBuffers.vao;
    this.floorInstanceBuffer = floorBuffers.instanceBuffer;
  }
  
  /**
   * Set isometric view parameters
   */
  public setIsometricView(angleRadians: number, scaleY: number): void {
    setIsometricView(this.isometricView, angleRadians, scaleY);
  }
  
  public render(world: World, width: number, height: number, texture: WebGLTexture, 
                cameraX: number = 0, cameraY: number = 0): void {
    const count = packFloorInstanceData(this.floorRendererState, world);
    if (count === 0) return;
    
    renderFloorQuads(
      this.gl,
      this.floorRendererState,
      this.program,
      this.floorVAO,
      this.floorInstanceBuffer,
      this.locations,
      texture,
      this.mapDataTexture,
      width,
      height,
      count,
      cameraX,
      cameraY
    );
  }
  
  /**
   * Render player entity as a 3D cube with red color and per-face shading
   */
  public renderPlayer(world: World, width: number, height: number, texture: WebGLTexture,
                      cameraX: number = 0, cameraY: number = 0): void {
    packPlayerInstanceData(this.cubeRendererState, world);
    
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform2f(this.locations.resolution!, width, height);
    gl.uniform1f(this.locations.isoAngle!, this.isometricView.angleRadians);
    gl.uniform1f(this.locations.isoScale!, this.isometricView.scaleY);
    gl.uniform2f(this.locations.cameraOffset!, cameraX, cameraY);
    gl.uniform1i(this.locations.renderMode!, 1);  // Entity mode
    gl.uniform4f(this.locations.entityColor!, 1.0, 0.0, 0.0, 1.0);  // Red color

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeInstanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.cubeRendererState.instanceData.subarray(0, 7));

    // Disable face culling so all cube faces are always rendered
    gl.disable(gl.CULL_FACE);
    
    gl.bindVertexArray(this.cubeVAO);
    // Draw 36 vertices (6 vertices per face × 6 faces) for the cube
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, 1);
    gl.bindVertexArray(null);
  }

  /**
   * Update the map data texture when map dimensions change
   */
  public updateMapDataTexture(): void {
    if (this.mapDataTexture) {
      updateMapDataTexture(this.gl, this.mapDataTexture);
    }
  }

  public renderFloor(
    floorData: { x: number; y: number; width: number; height: number; useAtlas?: boolean } | null,
    width: number,
    height: number,
    texture: WebGLTexture,
    cameraX: number = 0,
    cameraY: number = 0
  ): void {
    if (!floorData) return;
    
    const gl = this.gl;
    gl.disable(gl.CULL_FACE);
    gl.useProgram(this.program);
    
    // Set atlas/chessboard mode
    gl.uniform1i(this.locations.useAtlas!, floorData.useAtlas ? 1 : 0);
    
    gl.uniform2f(this.locations.resolution!, width, height);
    gl.uniform1f(this.locations.isoAngle!, this.isometricView.angleRadians);
    gl.uniform1f(this.locations.isoScale!, this.isometricView.scaleY);
    gl.uniform2f(this.locations.cameraOffset!, cameraX, cameraY);
    gl.uniform1i(this.locations.renderMode!, 0);  // Floor mode
    
    // Set atlas configuration uniforms
    gl.uniform1i(this.locations.atlasTileCountLoc!, 32);
    gl.uniform1f(this.locations.tileSizePixelsLoc!, 64.0);
    gl.uniform1f(this.locations.worldTileSizeLoc!, 64.0);
    gl.uniform1i(this.locations.staticRangeStartLoc!, 0);
    gl.uniform1i(this.locations.staticRangeEndLoc!, 99);
    gl.uniform1i(this.locations.variationRangeStartLoc!, 100);
    gl.uniform1i(this.locations.variationRangeEndLoc!, 1023);
    gl.uniform2f(this.locations.mapDimensionsLoc!, 
      floorData.width / 64, floorData.height / 64);
    gl.uniform1f(this.locations.seedLoc!, this.sessionSeed);

    // Bind atlas texture to TEXTURE0
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    // Bind map data texture to TEXTURE1
    gl.activeTexture(gl.TEXTURE1);
    if (this.mapDataTexture) {
      gl.bindTexture(gl.TEXTURE_2D, this.mapDataTexture);
    }
    gl.uniform1i(this.locations.mapDataTextureLoc!, 1);

    // Pack floor instance data
    this.floorRendererState.instanceData[0] = floorData.x;
    this.floorRendererState.instanceData[1] = floorData.y;
    this.floorRendererState.instanceData[2] = floorData.width;
    this.floorRendererState.instanceData[3] = floorData.height;
    this.floorRendererState.instanceData[4] = 0.0;
    this.floorRendererState.instanceData[5] = 0.0;
    this.floorRendererState.instanceData[6] = 0.0;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.floorInstanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.floorRendererState.instanceData.subarray(0, 7));

    gl.bindVertexArray(this.floorVAO);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, 1);
    gl.bindVertexArray(null);
  }
}
